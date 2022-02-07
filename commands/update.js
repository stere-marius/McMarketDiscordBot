const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const resourcesJSON = require("../resources.json");
const { verifyUserResources } = require("../middleware/verifierMiddleware.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("update")
    .setDescription("Update your purchased resources rank!"),
  async execute(interaction) {
    const discordID = interaction.user.id;

    await connectDatabase();
    const userDatabase = await User.findOne({ discord_id: discordID });

    await interaction.reply({ content: "Fetching data...", ephemeral: true });

    if (!userDatabase || !userDatabase.verifiedDate) {
      await interaction.followUp({
        content: `You are not verified.\nUse the command /verify-user to verify.`,
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
