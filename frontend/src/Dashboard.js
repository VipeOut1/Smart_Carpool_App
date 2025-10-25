import React from 'react';
import { useNavigate }  from 'react-router-dom';

// Simple component to get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export default function Dashboard() {
  const nav = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem("user");
    nav("/");
  };

  // Styles for the dashboard
  const styles = {
    container: {
      textAlign: 'center',
      padding: '40px',
    },
    header: {
      fontSize: '2.5rem',
      color: '#333',
    },
    subHeader: {
      fontSize: '1.2rem',
      color: '#555',
      marginBottom: '40px',
    },
    buttonContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '400px',
      margin: '0 auto',
    },
    button: {
      padding: '20px',
      fontSize: '1.2rem',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.3s',
    },
    logoutButton: {
      marginTop: '40px',
      backgroundColor: '#dc3545',
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Welcome, {user?.name}!</h1>
      <p style={styles.subHeader}>What would you like to do today?</p>
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.button} 
          onClick={() => nav('/trips')}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Book a Ride
        </button>
        
        <button 
          style={styles.button} 
          onClick={() => nav('/post-trip')}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          Post a Ride
        </button>

        <button 
          style={styles.button} 
          onClick={() => nav('/my-trips')}
          onMouseOver={e => e.currentTarget.style.backgroundColor = '#0056b3'}
          onMouseOut={e => e.currentTarget.style.backgroundColor = '#007bff'}
        >
          View My Posted Trips
        </button>
      </div>

      <button 
        style={{...styles.button, ...styles.logoutButton}} 
        onClick={handleLogout}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#c82333'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#dc3545'}
      >
        Logout
      </button>
    </div>
  );
}
