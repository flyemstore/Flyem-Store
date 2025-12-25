import React, { useEffect, useState } from "react";
import api from "../api/index";

export default function AdminThemeSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.request("/site").then(data => {
        if (!data.theme) data.theme = {};
        setSettings(data);
    });
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      theme: { ...prev.theme, [field]: value }
    }));
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
      alert("Settings Updated! Refresh to see changes.");
      window.location.reload();
    } catch (error) { alert("Failed to save."); } 
    finally { setLoading(false); }
  };

  if (!settings) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Theme Customizer</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- STYLE PRESETS REMOVED --- */}
        
        {/* 1. COLORS & MODE */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold uppercase border-b pb-2 mb-4">Colors & Mode</h3>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Color Mode</label>
                    <select value={settings.theme.mode || 'light'} onChange={(e)=>handleChange('mode', e.target.value)} className="w-full border p-2 bg-white">
                        <option value="light">Light Mode</option>
                        <option value="dark">Dark Mode</option>
                    </select>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Primary/Text</label>
                        <input type="color" value={settings.theme.primaryColor || "#000000"} onChange={(e)=>handleChange('primaryColor', e.target.value)} className="w-full h-8 cursor-pointer border" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Background</label>
                        <input type="color" value={settings.theme.secondaryColor || "#ffffff"} onChange={(e)=>handleChange('secondaryColor', e.target.value)} className="w-full h-8 cursor-pointer border" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase mb-1">Accent</label>
                        <input type="color" value={settings.theme.accentColor || "#2563eb"} onChange={(e)=>handleChange('accentColor', e.target.value)} className="w-full h-8 cursor-pointer border" />
                    </div>
                </div>
            </div>
        </div>

        {/* 2. SHAPES & BUTTONS */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold uppercase border-b pb-2 mb-4">UI Shapes</h3>
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Button Roundness</label>
                    <div className="flex gap-2">
                        {['none', 'sm', 'md', 'full'].map(r => (
                            <button key={r} type="button" onClick={()=>handleChange('borderRadius', r)} className={`flex-1 py-2 border text-[10px] font-bold uppercase ${settings.theme.borderRadius === r ? 'bg-black text-white' : 'bg-white'}`}>
                                {r}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Button Style</label>
                    <select value={settings.theme.buttonStyle || 'solid'} onChange={(e)=>handleChange('buttonStyle', e.target.value)} className="w-full border p-2 bg-white">
                        <option value="solid">Solid Fill</option>
                        <option value="outline">Outline</option>
                        <option value="shadow">Shadow (Retro)</option>
                    </select>
                </div>
            </div>
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition-colors">
            {loading ? "Saving..." : "Save Settings"}
        </button>

      </form>
    </div>
  );
}