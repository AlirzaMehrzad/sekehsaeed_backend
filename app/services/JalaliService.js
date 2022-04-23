var moment = require("jalali-moment");

function getTime() {
  var time = moment().format("YYYY-MM-DD HH:mm:ss");
  return time;
}

module.exports = getTime;
