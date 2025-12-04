import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Trips from "./Trips";
import Dashboard from "./Dashboard";
import PostTrip from "./PostTrip"; 
import MyTrips from "./MyTrips"; 

// This component protects routes that require a user to be logged in
const ProtectedRoute = ({ children }) => {
  const user = localStorage.getItem("user");
  if (!user) {
    // If no user, redirect to login
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/trips" 
          element={<ProtectedRoute><Trips /></ProtectedRoute>} 
        />
        <Route 
          path="/post-trip" 
          element={<ProtectedRoute><PostTrip /></ProtectedRoute>} 
        />
        <Route 
          path="/my-trips" 
          element={<ProtectedRoute><MyTrips /></ProtectedRoute>} 
        />

      </Routes>
    </BrowserRouter>
  );
}
