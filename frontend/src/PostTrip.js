import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default function PostTrip() {
  const [form, setForm] = useState({ from: "", to: "", time: "", seats: 1, farePerSeat: 250, note: "" });
  const [message, setMessage] = useState("");
  const user = getUser();
  const nav = useNavigate();

  const addTrip = async (e) => {
    e.preventDefault();
    if (!user) {
      setMessage("You must be logged in to post a trip.");
      return;
    }

    const tripData = {
      ...form,
      seats: parseInt(form.seats),
      farePerSeat: form.farePerSeat ? parseInt(form.farePerSeat) : 250,
      driverId: user._id,
      driverName: user.name,
      driverPhone: user.phone
    };

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/trips`, tripData);
      setMessage(`Trip posted! Fare per seat: ${res.data.farePerSeat} Rs`);
      setForm({ from: "", to: "", time: "", seats: 1, farePerSeat: 250, note: "" });
      setTimeout(() => nav('/my-trips'), 1500);
    } catch (err) {
      console.error("Error posting trip:", err);
      setMessage(err.response?.data?.message || "Error posting trip");
    }
  };

  return (
    <div>
      <button style={{margin: "10px"}} onClick={() => nav('/dashboard')}>&larr; Back</button>
      <div style={{ padding: "20px" }}>
        <h3>Post a New Trip</h3>
        <form onSubmit={addTrip}>
          <input placeholder="From" value={form.from} required onChange={e => setForm({ ...form, from: e.target.value })} />
          <input placeholder="To" value={form.to} required onChange={e => setForm({ ...form, to: e.target.value })} />
          <input placeholder="Time (e.g., 9:00 AM)" value={form.time} required onChange={e => setForm({ ...form, time: e.target.value })} />
          <input type="number" min="1" value={form.seats} placeholder="Seats" required onChange={e => setForm({ ...form, seats: e.target.value })} />
          <input type="number" min="0" value={form.farePerSeat} placeholder="Fare per seat (Rs)" onChange={e => setForm({ ...form, farePerSeat: e.target.value })} />
          <textarea
          placeholder="Add an optional note (e.g., 'Pickup at main gate', 'Only small bags')"
          value={form.note}
          onChange={e => setForm({ ...form, note: e.target.value })}
          style={{ minHeight: '60px', resize: 'vertical', width: 'calc(100% - 24px)', boxSizing: 'border-box', margin: '5px' }}
          />
          <button type="submit">Post Trip</button>
        </form>
        {message && <p style={{color: message.includes("posted") ? "green" : "red"}}>{message}</p>}
      </div>
    </div>
  );
}
