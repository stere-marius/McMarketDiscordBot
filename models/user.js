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
    resources: [
      {
        resourceID: {
          type: String,
          required: true,
        },
        verifyCode: {
          type: String,
        },
        verifyCodeDate: {
          type: Date,
          default: Date.now(),
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
