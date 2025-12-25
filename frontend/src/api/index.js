import axios from "axios";

// Determine the base URL based on where the app is running
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const BASE_URL = isLocal 
  ? "http://localhost:5000/api"  // Local backend
  : "https://flyem-backend.onrender.com/api"; // Live backend

const api = {
  request: async (endpoint, options = {}) => {
    // 1. Prepare Headers
    const headers = { 
      "Content-Type": "application/json", 
      ...options.headers 
    };

    // 👇 FIX: Get token from 'userInfo' instead of 'flyem_user'
    const userInfo = localStorage.getItem("userInfo"); 
    
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      // Ensure we attach the token if it exists
      if (parsedUser.token) {
        headers["Authorization"] = `Bearer ${parsedUser.token}`;
      }
    }

    // 2. Configure the Request
    const config = {
      url: `${BASE_URL}${endpoint}`,
      method: options.method || "GET",
      headers,
    };

    if (options.body) {
      config.data = options.body;
    }

    // 3. Send Request
    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      // Handle Token Expiry (Optional but good practice)
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized! Token might be invalid.");
        // Optional: Logout user if token is dead
        // localStorage.removeItem("userInfo");
        // window.location.href = "/login";
      }

      const errorMessage =
        error.response?.data?.message || error.message || "Something went wrong";
      throw new Error(errorMessage);
    }
  },
};

export default api;