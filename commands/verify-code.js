const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const { findConversation } = require("../middleware/mcmApi.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("echo")
    .setDescription("Replies with your input!"),
  async execute(interaction) {
    const discordID = interaction.user.id;
    await connectDatabase();
    const userDatabase = await User.findOne({ discord_id: discordID });

    await interaction.reply("Fetching information...");

    if (!userDatabase) {
      await interaction.editReply(
        "There is no data associated with this discord address. Please use the command /verify-user first."
      );
      return;
    }

    const { mc_market_user_id: userID, uuid } = userDatabase;
    const { error } = await findConversation(userID, uuid);

    if (error && error.status === 404) {
      await interaction.editReply(`
        Could not find a conversation with the generated code.\n
        Please start a conversation with TripleZone with the title being your generated code.\n
        If you already created an conversation, please try running this command later
        `);
      return;
    }

    if (error) {
      await interaction.editReply(
        `There was an error on our side.\nTry again later.`
      );
      return;
    }

    userDatabase.verifiedDate = new Date();
    await userDatabase.save();
    await interaction.editReply(`You have been successfully verified!`);
  },
};
