import React, { useState } from "react";
import api from "../api/index"; // Assuming you have this set up

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    
    // Simulate sending data (replace with actual API call later)
    try {
        // await api.request("/contact", { method: "POST", body: formData }); 
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
    } catch (error) {
        setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-gray-50 py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">Get in Touch</h1>
        <p className="text-gray-500 max-w-xl mx-auto text-lg">
          Have questions about your order, sizing, or shipping? We're here to help.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          
          {/* 2. CONTACT DETAILS (Razorpay Mandatory Info) */}
          <div className="space-y-10">
            <div>
              <h3 className="text-xl font-bold uppercase mb-6 border-b pb-2">Contact Information</h3>
              <p className="text-gray-600 mb-6">
                Fill out the form or reach us directly via email or phone. We usually respond within 24 hours.
              </p>
              
              <div className="space-y-6">
                {/* Address */}
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-sm">Operating Address</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      FLYEM Retail Pvt Ltd<br />
                      123 Fashion Street, Viman Nagar<br />
                      Pune, Maharashtra, 411014
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-sm">Email Support</h4>
                    <p className="text-gray-600 text-sm mt-1">support@flyem.in</p>
                    <p className="text-gray-400 text-xs mt-1">Mon - Fri, 10am - 6pm</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <div className="bg-black text-white p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-sm">Phone</h4>
                    <p className="text-gray-600 text-sm mt-1">+91 98765 43210</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Map Placeholder (Optional) */}
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
               <span className="text-gray-400 text-sm font-bold uppercase">Map Integration (Optional)</span>
            </div>
          </div>

          {/* 3. CONTACT FORM */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold uppercase mb-6">Send a Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Your Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  required 
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition-colors"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  required 
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
                <textarea 
                  name="message" 
                  value={formData.message} 
                  onChange={handleChange}
                  required 
                  rows="5"
                  className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition-colors"
                  placeholder="How can we help you?"
                />
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full bg-black text-white font-bold uppercase py-4 rounded hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <div className="p-4 bg-green-50 text-green-700 text-sm font-bold rounded text-center">
                  ✅ Message sent successfully! We'll get back to you soon.
                </div>
              )}
              {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 text-sm font-bold rounded text-center">
                  ❌ Something went wrong. Please try again.
                </div>
              )}
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}