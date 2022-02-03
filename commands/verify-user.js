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
    const discordID = interaction.user.id;
    const userID = options.getNumber("user-id");
    const generatedUUID = uuidv4();
    await interaction.reply(`Generating the uuid...`);
    await connectDatabase();

    const userDatabase = await User.findOne({ discord_id: discordID });

    const { verifiedDate, uuidGenerateDate } = userDatabase;

    if (verifiedDate) {
      await interaction.editReply(
        `There is already an account verified with this discord address.`
      );
      return;
    }

    const minutesPassedFromGeneration = getMinutesBetweenDates(
      uuidGenerateDate,
      new Date()
    );

    if (uuidGenerateDate && minutesPassedFromGeneration < 10) {
      await interaction.editReply(
        `The UUID has already been genereated! Please generate another one after ${
          minutesPassedFromGeneration - 10
        } minutes.`
      );
      return;
    }

    const user =
      userDatabase ||
      new User({
        mc_market_user_id: userID,
        discord_id: discordID,
      });

    await interaction.editReply(`Generating a new UUID...`);
    user.uuid = generatedUUID;
    user.uuidGenerateDate = new Date();

    await user.save();
    await interaction.editReply({
      content: `
      1. Create a conversation with TripleZone with the title ${generatedUUID}\n
      2. After creating the conversation user the command /verify-code yourCode
      `,
      ephemeral: true,
    });
  },
};
