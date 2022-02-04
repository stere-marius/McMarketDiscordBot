const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const { v4: uuidv4 } = require("uuid");
const {
  getUserLicense,
  createConversation,
} = require("../middleware/mcmApi.js");
const resourcesJSON = require("../resources.json");

const {
  userHasValidCode,
  userHasVerifiedResource,
} = require("../middleware/userLicenseValidator.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("test-verify")
    .setDescription("Command used to verify your purchase of a resource!")
    .addNumberOption((option) =>
      option
        .setName("user-id")
        .setDescription("Your user id from McMarket")
        .setRequired(true)
    )
    .addStringOption((option) => {
      option
        .setName("resource-name")
        .setDescription("Select the resource purchased")
        .setRequired(true);

      resourcesJSON.resources.forEach((r) => option.addChoice(r.name, r.id));

      return option;
    }),
  async execute(interaction) {
    const { options } = interaction;
    const resourceID = options.getString("resource-name");
    const discordID = interaction.user.id;
    const userID = options.getNumber("user-id");
    await interaction.reply(
      `Fetching data for ${userID} , ${discordID} and resource ${resourceID}`
    );

    await connectDatabase();
    await interaction.editReply(`Connected to database successfully!`);

    const userDatabase = await User.findOne({
      discord_id: discordID,
      mc_market_user_id: userID,
    });

    if (userDatabase && userHasVerifiedResource(userDatabase, resourceID)) {
      await interaction.editReply(
        `There is already a verified discord id associated with this resource id.`
      );
      return;
    }

    if (userDatabase && userHasValidCode(userDatabase, resourceID)) {
      await interaction.editReply(
        `A code has been already generated for this discord id. Check your McMarket conversations.`
      );
      return;
    }

    await interaction.editReply(`Fetching user license...`);
    const { response, error } = await getUserLicense(userID, resourceID);

    if (error && error.status == 404) {
      await interaction.editReply(
        `There is no license registered for this user id.`
      );
      console.error(`Linia 71 - ${error}`);
      return;
    }

    if (error) {
      await interaction.editReply(
        `There was an error while fetching the license.\nTry again later`
      );
      console.error(`Linia 78 - ${error}`);
      return;
    }

    const {
      result,
      data: { active, validated, license_id },
    } = response.data;

    await interaction.editReply(
      `Fetching MCMarket licenses \n result = ${result} \n active = ${active} \n validated= ${validated} \n ${
        result === "success" && active && validated
      }`
    );

    const isLicenseActive = active;

    if (!isLicenseActive) {
      await interaction.editReply(`Your license for this resource is expired.`);
      return;
    }

    await interaction.editReply(`license_id ${license_id}`);
    const generatedUUID = `${uuidv4()}`.replace("-", "");
    await interaction.editReply(`generatedUUID = ${generatedUUID}`);

    // TODO: Utilizator exista, are resurse verificate, trebuie adaugata o noua resursa
    const user =
      userDatabase ||
      new User({
        mc_market_user_id: userID,
        discord_id: discordID,
      });

    user.resources.push({
      resourceID: resourceID,
      verifyCode: generatedUUID,
      verifyCodeDate: Date.now(),
    });

    const savedUser = await user.save();
    await interaction.editReply(`savedUser = ${savedUser._id}`);

    const { error: errorConversation } = await createConversation(
      [userID],
      "Verify process of buying resource",
      `${generatedUUID}`
    );

    if (errorConversation) {
      await interaction.editReply(
        `There was en error while sending the message to you. Try again later.`
      );
      return;
    }

    await interaction.editReply(
      `A message with a code has been sent to you. Check your McMarket conversations!`
    );

    // TODO: Create command to verify the user writing the UUID
  },
};
