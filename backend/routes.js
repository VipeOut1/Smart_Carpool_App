import express from "express";
import { User, Trip } from "./models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();
router.post("/auth", async (req, res) => {
  try {
    const { email, password, name, phone, mode } = req.body; 
    if (mode === "register") {
      if (!phone || !name || !email || !password) {
        return res.status(400).json({ message: "All fields are required for registration" });
      }
      const hashed = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, phone, password: hashed }); 
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); 
      
      return res.json({ token, user }); // Return user object on register
    } else {
      const user = await User.findOne({ email });
      if (!user || !(await bcrypt.compare(password, user.password)))
        return res.status(401).json({ message: "Invalid credentials" });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); 
      
      res.json({ token, user }); // Return user object on login
    }
  } catch (err) {
    if (err.code === 11000) { // Handle duplicate email error
      return res.status(409).json({ message: "Email already in use" });
    }
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all Trips
router.get("/trips", async (req, res) => {
  const trips = await Trip.find({ seats: { $gt: 0 } });
  res.json(trips);
});

// Get all trips for a specific driver
router.get("/trips/my-trips/:driverId", async (req, res) => {
  try {
    const trips = await Trip.find({ driverId: req.params.driverId });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create a new Trip
router.post("/trips", async (req, res) => {
  try {
    const trip = await Trip.create({ ...req.body, passengers: [] }); 
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Book a Seat on a Trip
router.post("/trips/:id/book", async (req, res) => {
  try {
    const { passenger } = req.body; 
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    if (trip.seats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }
    if (trip.passengers.some(p => p.userId.toString() === passenger.userId)) {
      return res.status(400).json({ message: "You are already booked on this trip" });
    }

    trip.passengers.push(passenger);
    trip.seats -= 1;
    
    await trip.save();
    res.json(trip); 

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
// Trip ko cancel
router.delete("/trips/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    await Trip.deleteOne({ _id: req.params.id });

    res.json({ message: "Trip cancelled successfully" });

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});
router.post("/trips/:id/cancel-booking", async (req, res) => {
  try {
    const { userId } = req.body; // Jab cancel kr rahe tou app ko pata chale ke konsa user cancel kr raha hai.
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Find the index of the passenger to remove
    const passengerIndex = trip.passengers.findIndex(
      (p) => p.userId.toString() === userId
    );

    // If passenger isn't found in the array
    if (passengerIndex === -1) {
      return res.status(400).json({ message: "You are not booked on this trip" });
    }

    // Remove the passenger from the array
    trip.passengers.splice(passengerIndex, 1);
    
    // Increment the seat count
    trip.seats += 1;

    await trip.save();
    res.json(trip); // Sending the updtaed trip back

  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;