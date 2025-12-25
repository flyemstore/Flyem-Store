import React, { useEffect, useState } from "react";
import api from "../api/index";
import axios from "axios";

export default function AdminPopupSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.request("/site").then(data => {
        if (!data.popup) {
            data.popup = {
                show: false,
                title: "Join the Club",
                text: "Get 10% off your first order when you subscribe.",
                image: "",
                delay: 5,
                buttonText: "Subscribe"
            };
        }
        setSettings(data);
    });
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      popup: { ...prev.popup, [field]: value }
    }));
  };

  const uploadHandler = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      handleChange("image", `http://localhost:5000${data}`);
      setUploading(false);
    } catch (error) { 
        alert("Upload failed"); 
        setUploading(false); 
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));
    try {
      await api.request("/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedUser.token}` },
        body: JSON.stringify(settings)
      });
      alert("Popup Settings Saved!");
      window.location.reload();
    } catch (error) { 
        alert("Failed to save."); 
    } 
    finally { setLoading(false); }
  };

  if (!settings) return <div className="p-20 text-center">Loading...</div>;
  const { popup } = settings;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Newsletter Popup</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-200 shadow-sm space-y-6">
        
        {/* Toggle Switch */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 border">
            <input 
                type="checkbox" 
                id="showPopup"
                checked={popup.show} 
                onChange={(e) => handleChange("show", e.target.checked)}
                className="w-5 h-5 accent-black cursor-pointer"
            />
            <label htmlFor="showPopup" className="font-bold uppercase cursor-pointer select-none">
                Enable Homepage Popup
            </label>
        </div>

        {/* Text Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold uppercase mb-2">Headline</label>
                <input 
                    value={popup.title} 
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="w-full border p-3"
                    placeholder="Unlock 10% Off"
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase mb-2">Delay (Seconds)</label>
                <input 
                    type="number" 
                    value={popup.delay} 
                    onChange={(e) => handleChange("delay", Number(e.target.value))}
                    className="w-full border p-3"
                />
            </div>
            <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase mb-2">Message</label>
                <textarea 
                    value={popup.text} 
                    onChange={(e) => handleChange("text", e.target.value)}
                    className="w-full border p-3 h-24"
                    placeholder="Sign up for updates..."
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase mb-2">Button Text</label>
                <input 
                    value={popup.buttonText} 
                    onChange={(e) => handleChange("buttonText", e.target.value)}
                    className="w-full border p-3"
                    placeholder="Subscribe"
                />
            </div>
        </div>

        {/* Image Upload */}
        <div>
             <label className="block text-xs font-bold uppercase mb-2">Popup Image (Optional)</label>
             <div className="flex gap-4 items-center">
                 <input type="file" onChange={uploadHandler} className="border p-2 text-sm w-full" />
                 {popup.image && <img src={popup.image} alt="Preview" className="h-16 w-16 object-cover border" />}
                 {popup.image && (
                     <button type="button" onClick={() => handleChange("image", "")} className="text-red-500 text-xs font-bold uppercase underline">Remove</button>
                 )}
             </div>
             {uploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition-colors">
            {loading ? "Saving..." : "Save Popup Settings"}
        </button>
      </form>
    </div>
  );
}