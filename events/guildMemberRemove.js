const connectDatabase = require("../middleware/mongodbConnector.js");
const User = require("../models/user.js");

const run = async (client, member) => {
  await connectDatabase();

  const user = await User.findOne({ discord_id: member.id });

  if (!user) return;

  user.resources = [];
  await user.save();
};

module.exports = { run };
