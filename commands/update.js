const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const resourcesJSON = require("../resources.json");
const { verifyUserResources } = require("../middleware/verifierMiddleware.js");
const { createEmbedded } = require("../middleware/embeddedUtils");

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
        ephemeral: true,
        embeds: [
          createEmbedded(
            "You are not verified",
            "Use the command **/verify-user** to verify yourself.",
            "#BD3838"
          ),
        ],
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

    addVerifiedRank(interaction);

    await interaction.followUp({
      embeds: [
        createEmbedded("Success!", `Your account has been updated.`, "#47f066"),
      ],
      ephemeral: true,
    });
  },
};

const addVerifiedRank = (interaction) => {
  if (!process.env.VERIFIED_USER_ROLE_ID) return;

  interaction.member.roles.add(process.env.VERIFIED_USER_ROLE_ID);
};
