const { ethers } = require("ethers");
const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;

// Function to convert hex to string
function hex2str(hex) {
  return ethers.toUtf8String(hex);
}

// Function to convert string to hex
function str2hex(payload) {
  return ethers.hexlify(ethers.toUtf8Bytes(payload));
}

// Function to send a report
async function report(payload) {
  let data = payload;
  if (payload === null || payload === undefined) {
    data = "null";
  }
  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(data) }),
  });
  // console.log is removed as it's not essential for the utility's core function
  return;
}

// Function to send a notice
async function notice(payload) {
  let data = payload;
  if (payload === null || payload === undefined) {
    data = "null";
  }
  const notice_req = await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(data) }),
  });
  // console.log(notice_req) is removed
  return;
}

module.exports = {
  hex2str,
  str2hex,
  report,
  notice,
};
