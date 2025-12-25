import React, { useEffect, useState } from "react";
import api from "../api/index";

export default function NewsletterPopup() {
  const [config, setConfig] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, already
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // 1. Check if user already closed it (Recommended for Production)
    const isClosed = localStorage.getItem("flyem_popup_closed");
    if (isClosed) return;

    // 2. Fetch Settings
    api.request(`/site?t=${Date.now()}`).then(data => {
        const popup = data.popup;
        if (popup && popup.show) {
            setConfig(popup);
            // 3. Start Timer
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, (popup.delay || 5) * 1000); 
            return () => clearTimeout(timer);
        }
    }).catch(err => console.error(err));
  }, []);

  const handleClose = () => {
      setIsVisible(false);
      localStorage.setItem("flyem_popup_closed", "true");
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setStatus("loading");
      setErrorMessage("");

      try {
          await api.request("/subscribers", {
              method: "POST",
              body: JSON.stringify({ email })
          });
          setStatus("success");
      } catch (error) {
          // 👇 FIX: Handle the "Already Subscribed" 400 error gracefully
          if (error.message && error.message.toLowerCase().includes("already")) {
              setStatus("already");
          } else {
              console.error(error);
              setStatus("error");
              setErrorMessage("Something went wrong. Please try again.");
          }
      }
  };

  if (!isVisible || !config) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade" onClick={handleClose}></div>
        
        {/* Modal Window */}
        <div className="bg-white relative z-10 w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 overflow-hidden shadow-2xl animate-zoom rounded-lg">
            
            {/* Close Button */}
            <button onClick={handleClose} className="absolute top-4 right-4 z-20 text-gray-400 hover:text-black font-bold text-xl">✕</button>

            {/* Image Side */}
            <div className="hidden md:block h-full min-h-[400px]">
                {config.image ? (
                    <img src={config.image} alt="Newsletter" className="w-full h-full object-cover" />
                ) : (
                    <div className="bg-gray-100 h-full flex items-center justify-center p-10">
                        <span className="text-6xl">✉️</span>
                    </div>
                )}
            </div>

            {/* Content Side */}
            <div className="p-8 md:p-12 flex flex-col justify-center text-center md:text-left">
                
                {/* --- SUCCESS OR ALREADY SUBSCRIBED STATES --- */}
                {status === "success" || status === "already" ? (
                    <div className="py-10 text-center animate-fade">
                        <h3 className="text-2xl font-black uppercase text-green-600 mb-2">
                            {status === "success" ? "You're on the list!" : "Welcome Back!"}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {status === "success" 
                                ? "Use this code at checkout for your discount:" 
                                : "You are already a subscriber! Here is the code again:"}
                        </p>
                        
                        {/* COUPON BOX */}
                        <div className="bg-gray-100 border-dashed border-2 border-gray-300 p-4 inline-block mb-4 rounded">
                            <span className="text-3xl font-black tracking-widest select-all text-black">WELCOME10</span>
                        </div>
                        
                        <p className="text-[10px] text-gray-400 mb-6 uppercase font-bold">Valid on all items</p>
                        
                        <button onClick={handleClose} className="w-full bg-black text-white font-bold uppercase py-3 hover:bg-gray-800 transition-colors">
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 className="text-3xl font-black uppercase mb-4 leading-none">{config.title}</h2>
                        <p className="text-gray-600 mb-8 leading-relaxed">{config.text}</p>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                className="w-full border p-3 bg-gray-50 focus:bg-white transition-colors outline-none focus:border-black"
                            />
                            <button disabled={status === 'loading'} className="w-full bg-black text-white font-bold uppercase py-4 hover:bg-gray-800 transition-colors disabled:bg-gray-400">
                                {status === 'loading' ? "Joining..." : config.buttonText || "Subscribe"}
                            </button>
                            {status === "error" && (
                                <p className="text-xs text-red-500 text-center font-bold">{errorMessage}</p>
                            )}
                        </form>
                        <p className="text-[10px] text-gray-400 mt-4 text-center">We respect your privacy. Unsubscribe anytime.</p>
                    </>
                )}
            </div>
        </div>
    </div>
  );
}