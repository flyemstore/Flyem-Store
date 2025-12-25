import React from "react";
import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">Ordered.</h1>
      <p className="text-lg text-gray-500 max-w-md mb-8">
        Your drop is secured. You will receive an email confirmation shortly.
      </p>
      
      <div className="flex gap-4">
        <Link 
            to="/" 
            className="bg-black text-white px-8 py-4 font-bold uppercase tracking-widest hover:bg-gray-900 transition-colors"
        >
            Back Home
        </Link>
        <Link 
            to="/profile" 
            className="border border-gray-200 px-8 py-4 font-bold uppercase tracking-widest hover:border-black transition-colors"
        >
            View Profile
        </Link>
      </div>
    </div>
  );
}