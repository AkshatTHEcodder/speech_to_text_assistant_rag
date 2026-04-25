const mongoose = require("mongoose");

let isConnected = false;

async function connectDb(mongoUri) {
  if (!mongoUri) throw new Error("MONGO_URI is required");
  if (isConnected) return;

  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri);
  isConnected = true;
}

module.exports = { connectDb };

