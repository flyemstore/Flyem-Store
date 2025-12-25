import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/index";

// --- SOCIAL ICONS (Vector SVGs) ---
const Icons = {
  Instagram: (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  ),
  Twitter: (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  Email: (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
  ),
  Phone: (props) => (
    <svg {...props} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
  )
};

export default function Footer() {
  const [settings, setSettings] = useState(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.request("/site").then(data => {
        if (!data.footer) data.footer = { linkGroups: [], decorations: [] };
        if (!data.identity) data.identity = {};
        if (!data.contact) data.contact = {}; 
        setSettings(data);
    }).catch(console.error);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if(!email) return;
    
    setStatus("loading");
    setMsg("Sending...");

    try {
        await api.request("/subscribers", { method: "POST", body: JSON.stringify({ email }) });
        setStatus("success");
        setMsg("You're in! Thanks for subscribing.");
        alert("SUCCESS: Subscriber saved to database!");
        setEmail("");
    } catch (error) {
        setStatus("error");
        setMsg(error.body?.message || "Something went wrong");
    }
  };

  if (!settings) return null;
  const { footer, identity, contact } = settings;

  // 👇 I guessed your Privacy Policy link based on your ID.
  // When Razorpay generates it, it will likely be this URL. 
  const RAZORPAY_ID = "RqhZEF43H5g7eY"; 

  return (
    <footer 
        className="relative pt-20 pb-10 overflow-hidden"
        style={{ 
            backgroundColor: footer.backgroundColor || "#000000", 
            color: footer.textColor || "#ffffff" 
        }}
    >
      {footer.backgroundImage && (
          <div className="absolute inset-0 opacity-20 bg-cover bg-center pointer-events-none" style={{ backgroundImage: `url(${footer.backgroundImage})` }}></div>
      )}

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* 1. BRAND & NEWSLETTER */}
            <div className="lg:col-span-1">
                <Link to="/" className="text-2xl font-black uppercase tracking-tighter mb-6 block font-display">
                    {identity.name || "FLYEM"}
                </Link>
                
                {footer.showNewsletter && (
                    <div>
                        <p className="text-sm font-bold uppercase mb-4 opacity-80">Stay in the loop</p>
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-white/10 border border-white/20 p-3 text-sm rounded focus:outline-none focus:border-white transition-colors text-white placeholder-white/50"
                                required
                            />
                            <button type="submit" disabled={status === 'loading'} className="bg-white text-black font-bold uppercase text-xs py-3 px-6 rounded hover:bg-gray-200 transition-colors">
                                {status === 'loading' ? "Sending..." : "Subscribe"}
                            </button>
                        </form>
                        {msg && <p className={`text-xs mt-2 font-medium ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
                    </div>
                )}
            </div>

            {/* 2. DYNAMIC LINKS */}
            {footer.linkGroups?.map((group, idx) => (
                <div key={idx}>
                    <h4 className="font-bold uppercase mb-6 text-sm tracking-wider">{group.title}</h4>
                    <ul className="space-y-3 text-sm opacity-80">
                        {group.links?.map((link, i) => (
                            <li key={i}><Link to={link.url} className="hover:underline">{link.label}</Link></li>
                        ))}
                    </ul>
                </div>
            ))}

            {/* 3. LEGAL LINKS (FIXED) */}
            <div>
                <h4 className="font-bold uppercase mb-6 text-sm tracking-wider">Legal & Support</h4>
                <ul className="space-y-3 text-sm opacity-80">
                    <li>
                        <a href={`https://merchant.razorpay.com/policy/${RAZORPAY_ID}/terms`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Terms & Conditions
                        </a>
                    </li>
                    <li>
                        <a href={`https://merchant.razorpay.com/policy/${RAZORPAY_ID}/refund`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Refund & Cancellation
                        </a>
                    </li>
                    <li>
                        <a href={`https://merchant.razorpay.com/policy/${RAZORPAY_ID}/shipping`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Shipping Policy
                        </a>
                    </li>
                    <li>
                        {/* 👇 I assumed this pattern. If it breaks later, update this link! */}
                        <a href={`https://merchant.razorpay.com/policy/${RAZORPAY_ID}/privacy`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Privacy Policy
                        </a>
                    </li>
                </ul>
            </div>

            {/* 4. SOCIAL ICONS */}
            <div>
                <h4 className="font-bold uppercase mb-6 text-sm tracking-wider">Connect</h4>
                
                <div className="flex gap-4 mb-6">
                    {/* Instagram */}
                    {contact?.instagram && (
                        <a 
                           href={`https://instagram.com/${contact.instagram}`} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="w-10 h-10 border border-current rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                           title="Instagram"
                        >
                            <Icons.Instagram className="w-5 h-5" />
                        </a>
                    )}

                    {/* Twitter / X */}
                    {contact?.twitter && (
                        <a 
                           href={`https://twitter.com/${contact.twitter}`} 
                           target="_blank" 
                           rel="noreferrer" 
                           className="w-10 h-10 border border-current rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                           title="Twitter"
                        >
                            <Icons.Twitter className="w-5 h-5" />
                        </a>
                    )}

                    {/* Email */}
                    {contact?.email && (
                        <a 
                           href={`mailto:${contact.email}`} 
                           className="w-10 h-10 border border-current rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                           title="Email Us"
                        >
                            <Icons.Email className="w-5 h-5" />
                        </a>
                    )}

                    {/* Phone */}
                    {contact?.phone && (
                        <a 
                           href={`tel:${contact.phone}`} 
                           className="w-10 h-10 border border-current rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all"
                           title="Call Us"
                        >
                            <Icons.Phone className="w-5 h-5" />
                        </a>
                    )}
                </div>

                <div className="opacity-60 text-xs">
                     <p>Follow us for the latest drops.</p>
                </div>
            </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs opacity-60">
            <p>{footer.copyrightText || `© ${new Date().getFullYear()} ${identity.name || "FLYEM"}. All rights reserved.`}</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                <span>Secure Payments by Razorpay</span>
            </div>
        </div>
      </div>
    </footer>
  );
}