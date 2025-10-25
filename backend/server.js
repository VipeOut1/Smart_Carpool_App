// backend/server.js
import express from "express";
import cors from "cors";
import mongoose from "mongoose"; // <-- Uncomment this
import router from "./routes.js";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// Get the MongoDB connection string from the environment variable
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api", router);

app.listen(5000, () => console.log("Smart Carpool running on port 5000"));