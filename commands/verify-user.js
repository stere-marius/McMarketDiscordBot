const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const { v4: uuidv4 } = require("uuid");
const { getMinutesBetweenDates } = require("../utils/utils.js");
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');


const userAlreadyVerified = new MessageEmbed()
  .setColor('#BD3838')
  .setTitle('User already verified')
  .setDescription(`There is already an account verified with this discord address`)
  .setTimestamp()
  .setFooter({ text: 'TripleBot', iconURL: 'https://cdn.discordapp.com/attachments/939911214857871420/940298810649899048/TrippleZone_pfp_bgless.png' });

const userAlreadyTaken = new MessageEmbed()
  .setColor('#BD3838')
  .setTitle('User already taken')
  .setDescription(`There is already a McMarket account verified for requested id`)
  .setTimestamp()
  .setFooter({ text: 'TripleBot', iconURL: 'https://cdn.discordapp.com/attachments/939911214857871420/940298810649899048/TrippleZone_pfp_bgless.png' });


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
      content: `Loading...`,
      ephemeral: true,
    });

    await connectDatabase();

    const userDatabase = await User.findOne({ discord_id: discordID });

    const { verifiedDate, uuidGenerateDate } = userDatabase || {};

    if (verifiedDate) {
      await interaction.editReply({
        embeds: [userAlreadyVerified],
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
        embeds: [userAlreadyTaken],
        ephemeral: true,
      });
      return;
    }

    if (
      uuidGenerateDate &&
      getMinutesBetweenDates(uuidGenerateDate, new Date()) < 10
    ) {

      const waitForAnotherCode = new MessageEmbed()
        .setColor('#BD3838')
        .setTitle('Cooldown')
        .setDescription(
          `The code has already been genereated! Please generate another one after 
          ${Math.floor(10 - getMinutesBetweenDates(uuidGenerateDate, new Date()))} minutes.`
        )
        .setTimestamp()
        .setFooter({ text: 'TripleBot', iconURL: 'https://cdn.discordapp.com/attachments/939911214857871420/940298810649899048/TrippleZone_pfp_bgless.png' });


      await interaction.editReply({
        embeds: [waitForAnotherCode],
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

    user.mc_market_user_id = userID;
    user.uuid = generatedUUID;
    user.uuidGenerateDate = new Date();

    const createConversationButton = new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setURL('https://www.mc-market.org/conversations/add')
          .setLabel('Create Conversation')
          .setStyle('LINK')
      );

    const codeGenerated = new MessageEmbed()
      .setColor('#C36816')
      .setTitle('Cooldown')
      .setDescription(
        `Create a conversation with **${process.env.MC_MARKET_USERNAME}** with the title \n`
        + '``' + generatedUUID + '``'
        + `\nAfter creating the conversation use the command **/verify-code**`
      )
      .setTimestamp()
      .setFooter({ text: 'TripleBot', iconURL: 'https://cdn.discordapp.com/attachments/939911214857871420/940298810649899048/TrippleZone_pfp_bgless.png' });

    await user.save();
    await interaction.editReply({
      embeds: [codeGenerated],
      ephemeral: true,
      components: [createConversationButton]
    });
  },
};
