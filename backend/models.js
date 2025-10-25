import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: { type: String, required: true }, // <-- ADDED phone
  password: String,
  role: { type: String, default: "passenger" }
});

const passengerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: String,
  phone: String
}, { _id: false }); // _id: false stops Mongoose from creating sub-document IDs

const tripSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  driverName: String,
  driverPhone: String,
  from: String,
  to: String,
  time: String,
  seats: Number,
  farePerSeat: { type: Number, default: 250 }, // 👈 added here
  note: { type: String, default: "" },
  passengers: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      name: String,
      phone: String,
    }
  ]
});


export const User = mongoose.model("User", userSchema);
export const Trip = mongoose.model("Trip", tripSchema);
