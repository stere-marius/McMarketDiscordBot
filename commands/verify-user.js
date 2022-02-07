const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const { v4: uuidv4 } = require("uuid");
const { getMinutesBetweenDates } = require("../utils/utils.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify-user")
    .setDescription("Verify the user by user id!")
    .addNumberOption((option) =>
      option
        .setName("user-id")
        .setRequired(true)
        .setDescription("Your McMarket account id")
    ),
  async execute(interaction) {
    const { options } = interaction;
    const discordID = interaction.user.id;
    const userID = options.getNumber("user-id");
    const generatedUUID = uuidv4();

    await interaction.reply({
      content: `Fetching data...`,
      ephemeral: true,
    });

    await connectDatabase();

    const userDatabase = await User.findOne({ discord_id: discordID });

    const { verifiedDate, uuidGenerateDate } = userDatabase || {};

    if (verifiedDate) {
      await interaction.followUp({
        content: `There is already an account verified with this discord address.`,
        ephemeral: true,
      });
      return;
    }

    const mcmAccountAlreadyVerified = await User.findOne({
      mc_market_user_id: userID,
      verifiedDate: { $exists: true },
    });

    if (mcmAccountAlreadyVerified) {
      await interaction.followUp({
        content:
          "There is already a McMarket account verified for requested id",
        ephemeral: true,
      });
      return;
    }

    if (
      uuidGenerateDate &&
      getMinutesBetweenDates(uuidGenerateDate, new Date()) < 10
    ) {
      await interaction.followUp({
        content: `The code has already been genereated! Please generate another one after ${Math.floor(
          10 - getMinutesBetweenDates(uuidGenerateDate, new Date())
        )} minutes.`,
        ephemeral: true,
      });
      return;
    }

    const user =
      userDatabase ||
      new User({
        mc_market_user_id: userID,
        discord_id: discordID,
      });

    await interaction.followUp({
      content: `Generating a new code...`,
      ephemeral: true,
    });

    user.mc_market_user_id = userID;
    user.uuid = generatedUUID;
    user.uuidGenerateDate = new Date();

    await user.save();
    await interaction.followUp({
      content: `1. Create a conversation with ${process.env.MC_MARKET_USERNAME} with the title ${generatedUUID}\n2. After creating the conversation use the command /verify-code`,
      ephemeral: true,
    });
  },
};
