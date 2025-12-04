import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Simple component to get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default function MyTrips() {
  const [myTrips, setMyTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();
  const nav = useNavigate();

  useEffect(() => {
    if (!user) {
      nav('/'); // Should be handled by ProtectedRoute, but as a fallback
      return;
    }

    // Fetch trips posted by the current user
    axios.get(`${process.env.REACT_APP_API_URL}/trips/my-trips/${user._id}`, {
        headers: {
          "ngrok-skip-browser-warning": "true" // <--- FIX: Bypass Ngrok warning page
        }
      })
      .then(r => {
        // FIX: Ensure data is an array before setting state
        if (Array.isArray(r.data)) {
          setMyTrips(r.data);
        } else {
          console.error("Unexpected API response (likely not JSON):", r.data);
          setMyTrips([]); 
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching my trips:", err);
        setMyTrips([]); // Fallback to empty array
        setLoading(false);
      });
  }, [user, nav]);

  const handleCancelTrip = async (tripId) => {
    // Confirm before deleting
    if (!window.confirm("Are you sure you want to cancel this trip?")) {
      return;
    }

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/trips/${tripId}`, {
        headers: {
          "ngrok-skip-browser-warning": "true" // <--- FIX: Bypass Ngrok warning page
        }
      });
      
      // Update the UI by filtering out the cancelled trip
      setMyTrips(prevTrips => prevTrips.filter(trip => trip._id !== tripId));

    } catch (err) {
      console.error("Error cancelling trip:", err);
      alert("Could not cancel the trip. Please try again.");
    }
  };

  return (
    <div>
      <button style={{margin: "10px"}} onClick={() => nav('/dashboard')}>&larr; Back to Dashboard</button>
      <div style={{ padding: "20px" }}>
        <h2>My Posted Trips</h2>
        {loading && <p>Loading your trips...</p>}
        
        {!loading && myTrips.length === 0 && (
          <p>You have not posted any trips yet. <span onClick={() => nav('/post-trip')} style={{color: 'blue', cursor: 'pointer'}}>Post one now!</span></p>
        )}

        {/* FIX: Ensure myTrips is an array before mapping */}
        {Array.isArray(myTrips) && myTrips.map((trip) => (
          <div key={trip._id} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px", borderRadius: "5px" }}>
            <h3>{trip.from} → {trip.to}</h3>
            <p><b>Time:</b> {trip.time}</p>
            <p><b>Seats Remaining: {trip.seats}</b></p>
            <p><b>Fare: {trip.farePerSeat} Rs</b></p>
            {trip.note && (
              <p style={{ fontStyle: 'italic', background: '#f9f9f9', padding: '8px', borderRadius: '4px' }}>
                <b>My Note:</b> {trip.note}
              </p>
            )}
            <hr style={{border: "none", borderTop: "1px solid #eee"}} />
            
            <h4>Booked Passengers:</h4>
            {trip.passengers && trip.passengers.length > 0 ? (
              <ul style={{listStyle: 'none', paddingLeft: 0}}>
                {trip.passengers
                  .filter(p => p) // Filter out null passengers
                  .map((p, index) => (
                  <li key={index} style={{background: '#f9f9f9', padding: '8px', borderRadius: '4px', marginBottom: '5px'}}>
                    <b>Name:</b> {p.name} | <b>Phone:</b> {p.phone}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No passengers have booked this trip yet.</p> // If no passenger has been booked
            )}
            <button  // for canceling trips
              onClick={() => handleCancelTrip(trip._id)}
              style={{ backgroundColor: '#dc3545', marginTop: '10px' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = '#c82333'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc3545'}
            >
              Cancel This Trip
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}