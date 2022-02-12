const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const resourcesJSON = require("../resources.json");
const { verifyUserResources } = require("../middleware/verifierMiddleware.js");
const { findUuidInConversationReplies } = require("../middleware/mcmApi.js");
const { MessageEmbed } = require("discord.js");

const errorEmbed = new MessageEmbed()
  .setColor("#BD3838")
  .setTitle("You are not verified")
  .setDescription("Use the command **/verify-user** to verify yourself.")
  .setTimestamp()
  .setFooter({
    text: "TripleBot",
    iconURL:
      "https://cdn.discordapp.com/attachments/939911214857871420/940298810649899048/TrippleZone_pfp_bgless.png",
  });

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Update your purchased resources rank!"),
  async execute(interaction) {
    const discordID = interaction.user.id;
    await connectDatabase();
    const userDatabase = await User.findOne({ discord_id: discordID });
    await interaction.reply({ content: "Loading...", ephemeral: true });
    if (!userDatabase || !userDatabase.verifiedDate) {
      await interaction.editReply({
        embeds: [errorEmbed],
        ephemeral: true,
      });
      return;
    }

    const configuredResources = resourcesJSON.resources;
    const { resources: dbResources, mc_market_user_id: userID } = userDatabase;
    const unverifiedResources = configuredResources.filter(
      (r) => !dbResources.find((rd) => rd.resourceID === r.id)
    );
    await verifyUserResources(
      unverifiedResources,
      userDatabase,
      userID,
      interaction
    );
  },
};
