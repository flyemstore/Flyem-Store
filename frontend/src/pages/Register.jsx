import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/index";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // New State for success view
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already logged in with valid data
  useEffect(() => {
    const user = localStorage.getItem("userInfo");
    if (user) {
        navigate("/");
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      // 1. Send Registration Request
      await api.request("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      // 2. DO NOT SET LOCALSTORAGE HERE!
      // The user is not verified yet. We just show the success message.
      setSuccess(true);
      
    } catch (err) {
      console.error("Registration Error:", err);
      setError(err.message || "Registration failed");
    } finally {
        setLoading(false);
    }
  };

  // ✅ IF REGISTRATION SUCCESSFUL, SHOW THIS SCREEN
  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-lg rounded-lg text-center">
                <div className="text-green-500 text-5xl mb-4">📩</div>
                <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
                <p className="text-gray-600 mb-6">
                    We have sent a verification link to <strong>{email}</strong>.<br/>
                    Please check your inbox (and spam folder) to activate your account.
                </p>
                <Link to="/login" className="text-blue-600 hover:underline font-bold">
                    Back to Sign In
                </Link>
            </div>
        </div>
      );
  }

  // STANDARD FORM VIEW
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 shadow-lg rounded-lg">
        
        <div className="text-center">
          <h2 className="text-3xl font-black uppercase tracking-tighter">
            Join the Club
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create an account to track orders & get exclusive drops.
          </p>
        </div>

        {/* ERROR MESSAGE */}
        {error && (
            <div className="bg-red-50 text-red-500 p-3 text-sm font-bold text-center border border-red-100 rounded">
                {error}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={submitHandler}>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <input
                type="email"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold uppercase rounded-md text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:bg-gray-400"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </div>
        </form>

        <div className="text-center text-xs uppercase font-bold text-gray-400 mt-4">
            Already have an account? <Link to="/login" className="text-black underline">Login</Link>
        </div>
      </div>
    </div>
  );
}