function getMinutesBetweenDates(startDate, endDate) {
  let diff = endDate.getTime() - startDate.getTime();
  return diff / 60000;
}


module.exports = { getMinutesBetweenDates };
