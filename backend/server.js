import express from "express";
import cors from "cors";
import mongoose from "mongoose"; 
import router from "./routes.js";
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

// requesting mongo connection from env
const MONGO_URI = process.env.MONGO_URI;

// Connection MongoDB se
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use("/api", router);
//console par confirmation log laga rahe jab backend connect ho jaye 
app.listen(5000, () => console.log("Smart Carpool running on port 5000"));