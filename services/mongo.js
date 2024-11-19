require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error("MONGO_URI is not defined in the environment");
  process.exit(1);
}

const connect = () => {
  mongoose.connect(mongoURI).catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
    process.exit(1);
  });
};

module.exports = connect;
