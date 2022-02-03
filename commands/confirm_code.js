const { SlashCommandBuilder } = require("@discordjs/builders");
const resourcesJSON = require("../resources.json");
const User = require("../models/user.js");
const connectDatabase = require("../middleware/mongodbConnector.js");

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

    await interaction.reply(`Connecting to the database`);
    await connectDatabase();
    await interaction.editReply(`Fetching the user`);
    const foundUser = await User.findOne({
      mc_market_user_id: userID,
      discord_id: discordID,
    });

    if (!foundUser || !foundUser.resources) {
      await interaction.editReply(
        `Could not find the data about this. Try verifying first.`
      );
      return;
    }

    const foundResource = foundUser.resources.find(
      (r) => r.resourceID === resourceID && r.verifyCode == code
    );

    if (!foundResource) {
      await interaction.editReply(
        `isVerifyCodeEqual is false \nfounderUser has resources ${
          foundUser.resources == null
        }`
      );
      return;
    }

    if (foundResource.verifiedDate) {
      await interaction.editReply(
        `There is already a verified user for this discord id`
      );
      return;
    }

    await interaction.editReply(`isVerifyCodeEqual`);

    const resourceRoleID = resourcesJSON.resources.find(
      (r) => r.id === resourceID
    );

    if (!resourceRoleID) {
      await interaction.editReply(
        `Could not find the role_id for this resource`
      );
      return;
    }

    console.log(JSON.stringify(resourceRoleID));
    interaction.member.roles.add(resourceRoleID.role_id);
    await interaction.editReply(`The role has been added!`);
    foundResource.verifiedDate = new Date();
    await foundUser.save();
  },
};
