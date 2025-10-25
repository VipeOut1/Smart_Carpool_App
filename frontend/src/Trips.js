import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Simple component to get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  // Get user from localStorage on load
  useEffect(() => {
    const loggedInUser = getUser();
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      nav("/"); // Go back to login
    }
    fetchTrips();
  }, [nav]);

  // Function to fetch trips
  const fetchTrips = () => {
    axios.get(`${process.env.REACT_APP_API_URL}/trips`)
      .then(r => setTrips(r.data))
      .catch(err => console.error("Error fetching trips:", err));
  };

  // handleBook function
  const handleBook = async (tripId) => {
    if (!user) return;
    
    const passengerData = {
      userId: user._id,
      name: user.name,
      phone: user.phone
    };

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/trips/${tripId}/book`, { 
        passenger: passengerData 
      });
      // Update the list with the new trip data
      setTrips(trips.map(t => (t._id === tripId ? res.data : t)));
      setMessage("Booked successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Error booking trip:", error);
      setMessage(error.response?.data?.message || "Could not book trip");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return (
    <div>
      <button style={{margin: "10px"}} onClick={() => nav('/dashboard')}>&larr; Back to Dashboard</button>
      <div style={{ padding: "20px" }}>
        <h2>Available Trips to Book</h2>
        {message && <p style={{color: message.includes("success") ? "green" : "red", fontWeight: "bold"}}>{message}</p>}
        
        <div style={{ borderTop: "2px solid #eee", paddingTop: "10px" }}>
          {trips.length === 0 && <p>No trips available right now. Check back later!</p>}
          
          {trips.map((t) => (
            <div key={t._id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", borderRadius: "5px" }}>
              <h3>{t.from} → {t.to}</h3>
              <p><b>Driver:</b> {t.driverName}</p>
              <p><b>Driver Phone:</b> {t.driverPhone}</p> {/* <-- So passenger can contact */}
              <p><b>Time:</b> {t.time}</p>
              <p><b>Seats Available: {t.seats}</b></p>
              <p><b>Fare: {t.farePerSeat} Rs</b></p>
              {t.note && (
               <p style={{ fontStyle: 'italic', background: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                 <b>Driver's Note:</b> {t.note}
               </p>
              )}
              {/* Show Book button if user is NOT the driver */}
              {user && t.driverId !== user._id && (
                <button onClick={() => handleBook(t._id)}>
                  Book Seat
                </button>
              )}
              {user && t.driverId === user._id && (
                <p style={{color: "gray"}}><i>This is your trip.</i></p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
