const axios = require("axios");

const getUserLicense = async (userID, resourceID) => {
  try {
    console.log(
      `getUserLicense(${userID}, ${resourceID}) ${process.env.MC_MARKET_API_KEY}`
    );
    const response = await axios.get(
      `https://api.mc-market.org/v1/resources/${resourceID}/licenses/members/${userID}`,
      {
        headers: {
          Authorization: `Private ${process.env.MC_MARKET_API_KEY}`.trim(),
        },
      }
    );
    console.log(`Returned response`);
    return { response: response };
  } catch (error) {
    console.log(`Returned error`);
    return { error: error.response };
  }
};

const createConversation = async (recipient_ids, title, message) => {
  try {
    const response = await axios.post(
      "https://api.mc-market.org/v1/conversations",
      {
        recipient_ids,
        title,
        message,
      },
      {
        headers: {
          Authorization: `Private ${process.env.MC_MARKET_API_KEY}`.trim(),
        },
      }
    );
    return { response: response };
  } catch (error) {
    console.log(`Returned error createConversation`);
    return { error: error.response };
  }
};

const findConversation = async (creatorID, title) => {
  try {
    const params = new URLSearchParams({
      creator_id: creatorID,
      title: title,
    });
    const response = await axios.get(
      `https://api.mc-market.org/v1/conversations?${params.toString()}`,
      {
        headers: {
          Authorization: `Private ${process.env.MC_MARKET_API_KEY}`.trim(),
        },
      }
    );
    return { response: response };
  } catch (error) {
    console.log(`Returned error createConversation`);
    return { error: error.response };
  }
};

module.exports = { getUserLicense, createConversation, findConversation };
