const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const { v4: uuidv4 } = require("uuid");
const { getMinutesBetweenDates } = require("../utils/utils.js");
const { createEmbedded } = require("../middleware/embeddedUtils")
const { MessageActionRow, MessageButton } = require("discord.js");
const {
  createConversation,
  getUserIdFromUsername,
} = require("../middleware/mcmApi.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify-user")
    .setDescription("Verify the user by user id!")
    .addStringOption((option) =>
      option
        .setName("username")
        .setRequired(true)
        .setDescription("Your McMarket username")
    ),
  async execute(interaction) {
    const { options } = interaction;
    const discordID = interaction.user.id;
    const userName = options.getString("username");

    await interaction.reply({
      content: `Loading...`,
      ephemeral: true,
    });

    const { userID, error: errorFetchingUserID } = await getUserIdFromUsername(
      userName
    );

    if (errorFetchingUserID && errorFetchingUserID.status == 404) {
      await interaction.followUp({
        embeds: [createEmbedded(
          "User not found",
          `Could not find the username ${userName}`,
          "#BD3838")],
        ephemeral: true,
      });
      return;
    }

    if (errorFetchingUserID) {
      await interaction.followUp({
        embeds: [createEmbedded(
          "Error...",
          `There has been an error while fetching the username.`,
          "#BD3838")],
        ephemeral: true,
      });
      return;
    }

    console.log(`UserID = ${userID}`);

    const generatedUUID = uuidv4();

    await connectDatabase();

    const userDatabase = await User.findOne({ discord_id: discordID });

    const { verifiedDate, uuidGenerateDate } = userDatabase || {};

    if (verifiedDate) {
      await interaction.editReply({
        embeds: [createEmbedded(
          "User already verified",
          `There is already an account verified with this discord address`,
          "#BD3838")],
        ephemeral: true,
      });
      return;
    }

    const mcmAccountAlreadyVerified = await User.findOne({
      mc_market_user_id: userID,
      verifiedDate: { $exists: true },
    });

    if (mcmAccountAlreadyVerified) {
      await interaction.editReply({
        embeds: [createEmbedded(
          "User already taken",
          `There is already a McMarket account verified for requested id`,
          "#BD3838")],
        ephemeral: true,
      });
      return;
    }

    if (
      uuidGenerateDate &&
      getMinutesBetweenDates(uuidGenerateDate, new Date()) < 10
    ) {

      await interaction.editReply({
        embeds: [createEmbedded(
          "Cooldown",
          `The code has already been genereated! Please generate another one after 
          ${Math.floor(
            10 - getMinutesBetweenDates(uuidGenerateDate, new Date())
          )} minutes.`,
          "#BD3838")],
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

    await interaction.editReply({
      content: `Generating a new code...`,
      ephemeral: true,
    });

    const { response, error } = await createConversation(
      [userID],
      `Verify of the user`,
      `Please reply with the code ${generatedUUID}`
    );

    if (error) {
      await interaction.followUp(
        "There was an error while creating the conversation. Try again later"
      );
      return;
    }

    const {
      data: { data: conversationID },
    } = response;

    user.conversation_id = `${conversationID}`;
    user.mc_market_user_id = userID;
    user.uuid = generatedUUID;
    user.uuidGenerateDate = new Date();
    await user.save();

    const createConversationButton = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setURL(`https://www.mc-market.org/conversations/${user.conversation_id}/`)
          .setLabel('See the conversation')
          .setStyle('LINK')
      );

    await interaction.followUp({
      embeds: [createEmbedded(
        "Check your MCMarket conversations",
        `A code has been generated in a conversation with **${process.env.MC_MARKET_USERNAME}**.\n Please reply on mcmarket with that code. \n
        Then execute the **/verify-user** command.`,
        "#47f066")],
      components: [createConversationButton],
      ephemeral: true
    });
  },
};
