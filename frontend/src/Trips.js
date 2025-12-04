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
    axios.get(`${process.env.REACT_APP_API_URL}/trips`, {
        headers: {
          "ngrok-skip-browser-warning": "true" // FIX: Bypass Ngrok warning page
        }
      })
      .then(r => {
        // FIX: Ensure data is an array before setting state
        if (Array.isArray(r.data)) {
          setTrips(r.data);
        } else {
          console.error("Unexpected API response (likely not JSON):", r.data);
          setTrips([]); 
        }
      })
      .catch(err => {
        console.error("Error fetching trips:", err);
        setTrips([]);
      });
  };

  // handleBook function
  const handleBook = async (tripId) => {
    if (!window.confirm("Are you sure you want to book this seat?")) {
      return; 
    }

    if (!user) return;
    
    const passengerData = {
      userId: user._id,
      name: user.name,
      phone: user.phone
    };

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}/book`, 
        { passenger: passengerData },
        { 
          headers: { 
            "ngrok-skip-browser-warning": "true" // FIX: Bypass Ngrok warning page
          } 
        }
      );

      // FIX: Ensure response is a valid object
      if (res.data && typeof res.data === 'object') {
        setTrips(trips.map(t => (t._id === tripId ? res.data : t)));
        setMessage("Booked successfully!");
      } else {
        console.error("Invalid response from booking:", res.data);
      }
      setTimeout(() => setMessage(""), 2000);

    } catch (error) {
      console.error("Error booking trip:", error);
      setMessage(error.response?.data?.message || "Could not book trip");
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // handleCancelBooking function
  const handleCancelBooking = async (tripId) => {
    if (!user) return;

    if (!window.confirm("Are you sure you want to cancel your booking?")) {
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/trips/${tripId}/cancel-booking`,
        { userId: user._id },
        { 
          headers: { 
            "ngrok-skip-browser-warning": "true" // FIX: Bypass Ngrok warning page
          } 
        }
      );

      // FIX: Ensure response is a valid object
      if (res.data && typeof res.data === 'object') {
        setTrips(trips.map((t) => (t._id === tripId ? res.data : t)));
        setMessage("Booking cancelled successfully.");
      } else {
         console.error("Invalid response from cancel:", res.data);
      }
      setTimeout(() => setMessage(""), 2000);

    } catch (error) {
      console.error("Error cancelling booking:", error);
      setMessage(error.response?.data?.message || "Could not cancel booking");
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
          
          {/* FIX: Ensure trips is an array before mapping */}
          {Array.isArray(trips) && trips.map((t) => {
            const isDriver = user && t.driverId === user._id;

            // FIX: Ensure passengers array exists before checking .some()
            const isBooked = user && Array.isArray(t.passengers) && t.passengers.some((p) => p.userId === user._id);
            
            return (
              <div key={t._id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", borderRadius: "5px" }}>
                <h3>{t.from} → {t.to}</h3>
                <p><b>Driver:</b> {t.driverName}</p>
                <p><b>Driver Phone:</b> {t.driverPhone}</p>
                <p><b>Time:</b> {t.time}</p>
                <p><b>Seats Available: {t.seats}</b></p>
                <p><b>Fare: {t.farePerSeat} Rs</b></p>
                {t.note && (
                  <p style={{ fontStyle: 'italic', background: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                    <b>Driver's Note:</b> {t.note}
                  </p>
                )}
                
                {/* Case 1: The user is the driver */}
                {isDriver && (
                  <p style={{ color: "gray" }}><i>This is your trip.</i></p>
                )}

                {/* Case 2: The user is already a passenger */}
                {isBooked && !isDriver && (
                  <button
                    onClick={() => handleCancelBooking(t._id)}
                    style={{ backgroundColor: "#ffc107", color: "black" }} 
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#e0a800'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#ffc107'}
                  >
                    Cancel Booking
                  </button>
                )}

                {/* Case 3: The user is not the driver AND not booked */}
                {!isBooked && !isDriver && (
                  <button onClick={() => handleBook(t._id)}>
                    Book Seat
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}