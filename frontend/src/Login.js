import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [data, setData] = useState({ email: "", password: "", name: "", phone: "" }); // <-- Added phone
  const [error, setError] = useState(""); // For showing errors
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setError(""); // Clear previous errors
    const mode = isLogin ? "login" : "register";
    
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/auth`, { ...data, mode });
      // Save the *entire* user object, which includes _id and phone
      localStorage.setItem("user", JSON.stringify(res.data.user));
      nav("/dashboard"); // <-- Navigate to dashboard
    } catch (err) {
      console.error("Auth error", err.response);
      setError(err.response?.data?.message || "An error occurred");
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={submit}>
        {!isLogin && (
          <input 
            placeholder="Name" 
            required
            onChange={e => setData({...data, name: e.target.value})}
          />
        )}
        <input 
          placeholder="Email" 
          type="email" 
          required
          onChange={e => setData({...data, email: e.target.value})}
        />
        {/* Show Phone input only on Register form */}
        {!isLogin && (
          <input 
            placeholder="Phone Number (e.g., 03001234567)" 
            type="tel"
            required
            pattern="[0-9]{11}"
            title="Please enter an 11-digit phone number"
            onChange={e => setData({...data, phone: e.target.value})}
          />
        )}
        <input 
          placeholder="Password" 
          type="password" 
          required
          onChange={e => setData({...data, password: e.target.value})}
        />
        {error && <p style={{color: "red"}}>{error}</p>}
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{cursor:"pointer",color:"blue"}}>
        {isLogin ? "No account? Register" : "Have one? Login"}
      </p>
    </div>
  );
}
