const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const user = new Schema(
  {
    mc_market_user_id: {
      type: String,
      required: true,
    },
    discord_id: {
      type: String,
      required: true,
    },
    uuid: {
      type: String,
    },
    uuidGenerateDate: {
      type: Date,
    },
    verifiedDate: {
      type: Date,
    },
    resources: [
      {
        resourceID: {
          type: String,
          required: true,
        },
        verifiedDate: {
          type: Date,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

mongoose.models = {};

const User = mongoose.model("User", user);

module.exports = User;
