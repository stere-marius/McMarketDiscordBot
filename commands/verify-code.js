const { SlashCommandBuilder } = require("@discordjs/builders");
const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");
const { findConversation, getUserLicense } = require("../middleware/mcmApi.js");
const resourcesJSON = require("../resources.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verify-code")
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

    const mcmAccountAlreadyVerified = await User.findOne({
      mc_market_user_id: userDatabase.mc_market_user_id,
      verifiedDate: { $exists: true },
    });

    if (mcmAccountAlreadyVerified) {
      await interaction.editReply(
        "There is already a McMarket account verified for requested id"
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
    interaction.member.roles.add("785297299004719104");

    resourcesJSON.resources.forEach(async (r) => {
      const { response, error } = await getUserLicense(
        userDatabase.mc_market_user_id,
        r.id
      );

      if (error && error.status === 404) {
        await interaction.followUp(
          `Could not find a license for resource ${r.name}`
        );
        return;
      }

      if (error) {
        throw error;
      }

      const {
        result,
        data: { active: isLicenseActive, validated, license_id },
      } = response.data;

      if (!isLicenseActive) {
        await interaction.followUp(
          `Your license for this resource is expired.`
        );
        return;
      }

      await interaction.followUp(
        `You have been verified for the resource ${r.name}`
      );
      if (r.role_id) {
        interaction.member.roles.add(r.role_id);
      }
    });
  },
};
