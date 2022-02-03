const { SlashCommandBuilder } = require("@discordjs/builders");
const resourcesJSON = require("../resources.json");
const User = require("../models/user.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("confirm-code")
    .setDescription("Confirm code received for a specific resource!")
    .addStringOption((option) =>
      option
        .setName("user-id")
        .setDescription("Your McMarket user id")
        .setRequired(true)
    )
    .addStringOption((option) => {
      option
        .setName("resource-name")
        .setDescription("Select the resource purchased")
        .setRequired(true);

      resourcesJSON.resources.forEach((r) => option.addChoice(r.name, r.id));

      return option;
    })
    .addStringOption((option) =>
      option
        .setName("code")
        .setDescription("The code received from conversation")
        .setRequired(true)
    ),
  async execute(interaction) {
    const { options } = interaction;
    const resourceID = options.getString("resource-name");
    const userID = options.getString("user-id");
    const discordID = interaction.user.id;
    const code = options.getString("code");

    const foundUser = await User.findOne({
      mc_market_user_id: userID,
      discord_id: discordID,
    });

    if (!foundUser) {
      await interaction.editReply(
        `Could not find the data about this. Try verifying first.`
      );
      return;
    }

    const isVerifyCodeEqual =
      foundUser.resources &&
      foundUser.resources.find(
        (r) => r.resourceID === resourceID && r.verifyCode == code
      );

    if (isVerifyCodeEqual) {
      await interaction.editReply(`isVerifyCodeEqual`);
    }
  },
};
