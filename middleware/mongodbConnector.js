const mongoose = require("mongoose");

const connectDatabase = async () => {
  if (mongoose.connections[0].readyState) {
    return Promise.resolve();
  }

  await mongoose.connect(process.env.MONGODB_URL);
  return Promise.resolve();
};

module.exports = connectDatabase;
