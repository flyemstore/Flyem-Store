import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/index";

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // verifying, success, error

  useEffect(() => {
    if (token) {
        api.request("/users/verify", {
            method: "POST",
            body: JSON.stringify({ token })
        })
        .then((data) => {
            setStatus("success");
            localStorage.setItem("userInfo", JSON.stringify(data));
            // Redirect to home after 3 seconds
            setTimeout(() => navigate("/"), 3000);
        })
        .catch(() => setStatus("error"));
    }
  }, [token, navigate]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-32">
        {status === "verifying" && (
            <>
                <div className="animate-spin text-4xl mb-4">⏳</div>
                <h1 className="text-2xl font-black uppercase">Verifying Email...</h1>
            </>
        )}

        {status === "success" && (
            <>
                <div className="text-6xl mb-4">✅</div>
                <h1 className="text-2xl font-black uppercase text-green-600">Email Verified!</h1>
                <p className="text-gray-500 mt-2">You are now logged in. Redirecting...</p>
            </>
        )}

        {status === "error" && (
            <>
                <div className="text-6xl mb-4">❌</div>
                <h1 className="text-2xl font-black uppercase text-red-600">Verification Failed</h1>
                <p className="text-gray-500 mt-2">The link is invalid or expired.</p>
                <Link to="/login" className="mt-6 inline-block bg-black text-white px-6 py-3 font-bold uppercase">Go to Login</Link>
            </>
        )}
    </div>
  );
}