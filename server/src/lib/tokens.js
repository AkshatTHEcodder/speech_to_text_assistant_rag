const crypto = require("crypto");

function randomToken() {
  return crypto.randomBytes(32).toString("hex");
}

function sha256Hex(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

module.exports = { randomToken, sha256Hex };

