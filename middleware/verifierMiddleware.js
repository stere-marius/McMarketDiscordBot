const { verifyResourceLicense } = require("../middleware/mcmApi.js");

const verifyUserResources = async (
  resources,
  userDatatabse,
  userID,
  interaction
) => {
  for (const resource of resources) {
    const { error, success } = await verifyResourceLicense(
      resource.id,
      resource.name,
      userID
    );
    await interaction.followUp({ content: success || error, ephemeral: true });

    if (!success) continue;

    if (resource.role_id) {
      interaction.member.roles.add(resource.role_id);
    }

    userDatatabse.resources.push({
      resourceID: resource.id,
      verifiedDate: new Date(),
    });
  }
};

module.exports = { verifyUserResources };
