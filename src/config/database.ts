import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
export const dbConnection = async () => {
  mongoose
    .connect(process.env.MONGO_URL || "")
    .then(() => {
      console.log("Database Connection established");
    })
    .catch((err) => console.log("Error connecting to Database"));
};
