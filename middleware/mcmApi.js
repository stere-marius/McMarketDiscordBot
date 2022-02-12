const axios = require("axios");

const getUserLicense = async (userID, resourceID) => {
  try {
    const response = await axios.get(
      `https://api.mc-market.org/v1/resources/${resourceID}/licenses/members/${userID}`,
      {
        headers: {
          Authorization: `Private ${process.env.MC_MARKET_API_KEY}`.trim(),
        },
      }
    );
    return { response: response };
  } catch (error) {
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
    return { error: error.response };
  }
};

const findConversations = async (page) => {
  try {
    const params = new URLSearchParams({
      page,
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
    return { error: error.response };
  }
};

const verifyResourceLicense = async (resourceID, resourceName, userID) => {
  const { response, error } = await getUserLicense(userID, resourceID);

  if (error && error.status === 404) {
    return { error: `Could not find a license for resource ${resourceName}` };
  }

  if (error) {
    console.error(error);
    return {
      error: `There has been an error while verifying the resource ${resourceName}`,
    };
  }

  const {
    data: { active: isLicenseActive },
  } = response.data;

  if (!isLicenseActive) {
    return { error: `Your license for this resource is expired.` };
  }

  return {
    success: `You have been verified for the resource ${resourceName}`,
  };
};

const getThreadReplies = async (page) => {
  try {
    const params = new URLSearchParams({
      page,
    });
    const response = await axios.get(
      `https://api.mc-market.org/v1/threads/${
        process.env.VERIFY_THREAD_ID
      }/replies?${params.toString()}`,
      {
        headers: {
          Authorization: `Private ${process.env.MC_MARKET_API_KEY}`.trim(),
        },
      }
    );
    return { response };
  } catch (error) {
    return { error: error.response };
  }
};

const findUuidInConversationReplies = async (
  conversationID,
  authorID,
  uuid
) => {
  try {
    const { data } = await axios.get(
      `https://api.mc-market.org/v1/conversations/${conversationID}/replies`,
      {
        headers: {
          Authorization: `Private ${process.env.MC_MARKET_API_KEY}`.trim(),
        },
      }
    );

    let success = data.data.find(
      (r) => r.message.includes(uuid) && r.author_id == authorID
    );

    return { success };
  } catch (error) {
    return { error: error.response };
  }
};

const getUserIdFromUsername = async (username) => {
  try {
    const { data } = await axios.get(
      `https://api.mc-market.org/v1/members/usernames/${username}`,
      {
        headers: {
          Authorization: `Private ${process.env.MC_MARKET_API_KEY}`.trim(),
        },
      }
    );

    return { userID: data.data.member_id };
  } catch (error) {
    return { error: error.response };
  }
};

module.exports = {
  getUserLicense,
  createConversation,
  findConversations,
  verifyResourceLicense,
  findUuidInConversationReplies,
  getUserIdFromUsername,
};
