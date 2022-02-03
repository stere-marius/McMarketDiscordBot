const User = require("../models/user.js");
const { getMinutesBetweenDates } = require("../utils/utils.js");

const userHasValidCode = (user, resourceID) => {
  if (!user.resources) return false;

  const resourceEntry = user.resources.find((r) => r.resourceID === resourceID);

  if (!resourceEntry) return false;

  const { verifyCode, verifyCodeDate } = resourceEntry;
  const minutesPassed = getMinutesBetweenDates(verifyCodeDate, new Date());
  const hasCodeGenerated = verifyCode && minutesPassed < 10;

  return hasCodeGenerated;
};

const userHasVerifiedResource = (user, resourceID) => {
  if (!user.resources) return false;

  const resourceEntry = user.resources.find((r) => r.resourceID === resourceID);

  if (!resourceEntry) return false;

  return resourceEntry.verifiedDate != null;
};

module.exports = { userHasValidCode, userHasVerifiedResource };
