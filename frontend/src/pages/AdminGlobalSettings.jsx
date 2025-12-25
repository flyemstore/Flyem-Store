import React, { useEffect, useState } from "react";
import api from "../api/index";
import axios from "axios";

export default function AdminGlobalSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Determine Base URL for uploads (similar to your api/index.js logic)
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const UPLOAD_BASE_URL = isLocal ? "http://localhost:5000" : "https://flyem-backend.onrender.com";

  useEffect(() => {
    api.request("/site").then(data => {
        if (!data.identity) data.identity = { name: "FLYEM", top: 0, left: 0 };
        if (!data.theme) data.theme = { primaryColor: "#000000", backgroundColor: "#ffffff" };
        if (!data.typography) data.typography = { headingFont: "inter", bodyFont: "inter" };
        if (!data.layout) data.layout = { borderRadius: "0px" };
        if (!data.seo) data.seo = { metaTitle: "", metaDescription: "" };
        if (!data.customCode) data.customCode = { headCode: "", bodyCode: "" }; 
        setSettings(data);
    });
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const uploadHandler = async (e, section, field) => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    
    try {
      // 👇 FIX: Dynamic URL for uploads
      const { data } = await axios.post(`${UPLOAD_BASE_URL}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imageUrl = `${UPLOAD_BASE_URL}${data}`;
      handleChange(section, field, imageUrl);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 👇 FIX: Use 'userInfo' key
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));

    if (!savedUser || !savedUser.token) {
        alert("Session expired. Please login again.");
        return;
    }

    const { _id, createdAt, updatedAt, __v, ...dataToSave } = settings;

    try {
      await api.request("/site", {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json"
            // Note: api.request already attaches the token if we configured it in api/index.js
        },
        body: JSON.stringify(dataToSave)
      });
      alert("Settings Saved!");
    } catch (error) {
      alert(error.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (mode) => {
    if (mode === 'light') {
        setSettings(prev => ({ ...prev, theme: { ...prev.theme, backgroundColor: "#ffffff", textColor: "#000000", primaryColor: "#000000", accentColor: "#2563eb", borderColor: "#e5e7eb" } }));
    } else {
        setSettings(prev => ({ ...prev, theme: { ...prev.theme, backgroundColor: "#000000", textColor: "#ffffff", primaryColor: "#ffffff", accentColor: "#fbbf24", borderColor: "#333333" } }));
    }
  };

  if (!settings) return <div className="p-20 text-center">Loading Settings...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black uppercase">Global Settings</h1>
          <div className="flex gap-2">
              <button type="button" onClick={() => applyPreset('light')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold uppercase rounded border">☀️ Light</button>
              <button type="button" onClick={() => applyPreset('dark')} className="px-4 py-2 bg-gray-900 text-white hover:bg-black text-xs font-bold uppercase rounded">🌙 Dark</button>
          </div>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. IDENTITY */}
        <div className="space-y-6 bg-white p-6 border border-gray-200 shadow-sm">
          <h3 className="font-bold uppercase border-b pb-2">Identity</h3>
          <div><label className="text-xs font-bold uppercase block mb-1">Store Name</label><input value={settings.identity.name || ""} onChange={(e) => handleChange("identity", "name", e.target.value)} className="w-full border p-2 font-bold" /></div>
          <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold uppercase block mb-1">Main Logo</label><input type="file" onChange={(e)=>uploadHandler(e,"identity","logo")} className="w-full border p-1 text-xs" />{settings.identity.logo && <img src={settings.identity.logo} alt="logo" className="mt-2 h-8 object-contain bg-gray-100 p-1" />}</div>
              <div><label className="text-xs font-bold uppercase block mb-1">Favicon</label><input type="file" onChange={(e)=>uploadHandler(e,"identity","favicon")} className="w-full border p-1 text-xs" />{settings.identity.favicon && <img src={settings.identity.favicon} alt="favicon" className="mt-2 h-8 w-8 border p-1" />}</div>
          </div>
          <div className="bg-gray-50 p-4 border border-dashed border-gray-300 mt-4">
              <label className="flex items-center gap-2 mb-2">
                  <input type="checkbox" checked={settings.identity.position === "absolute"} onChange={(e) => handleChange("identity", "position", e.target.checked ? "absolute" : "static")} />
                  <span className="text-xs font-bold uppercase">Free Movement Mode</span>
              </label>
              {settings.identity.position === "absolute" && (
                  <div className="grid grid-cols-2 gap-4">
                      <div><span className="text-[10px] font-bold uppercase">Top (px)</span><input type="number" value={settings.identity.top} onChange={(e)=>handleChange("identity","top",e.target.value)} className="w-full border p-1" /></div>
                      <div><span className="text-[10px] font-bold uppercase">Left (%)</span><input type="number" value={settings.identity.left} onChange={(e)=>handleChange("identity","left",e.target.value)} className="w-full border p-1" /></div>
                  </div>
              )}
          </div>
        </div>

        {/* --- SOCIAL MEDIA & CONTACT SECTION --- */}
<div className="bg-white p-6 rounded shadow-sm border border-gray-200 mb-8">
  <h3 className="font-bold text-lg mb-6 uppercase tracking-wider text-gray-700">Social Media & Contact</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* 1. Instagram */}
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Instagram Username</label>
      <div className="flex">
        <span className="bg-gray-100 border border-r-0 border-gray-300 p-3 rounded-l text-gray-500 text-sm">@</span>
        <input 
          type="text" 
          value={settings.contact?.instagram || ""} 
          onChange={(e) => setSettings({ 
            ...settings, 
            contact: { ...settings.contact, instagram: e.target.value } 
          })}
          placeholder="shopatflyem"
          className="w-full border border-gray-300 p-3 rounded-r focus:outline-none focus:border-black transition-colors"
        />
      </div>
    </div>

    {/* 2. Twitter / X */}
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Twitter Handle</label>
      <div className="flex">
        <span className="bg-gray-100 border border-r-0 border-gray-300 p-3 rounded-l text-gray-500 text-sm">@</span>
        <input 
          type="text" 
          value={settings.contact?.twitter || ""} 
          onChange={(e) => setSettings({ 
            ...settings, 
            contact: { ...settings.contact, twitter: e.target.value } 
          })}
          placeholder="flyem_official"
          className="w-full border border-gray-300 p-3 rounded-r focus:outline-none focus:border-black transition-colors"
        />
      </div>
    </div>

    {/* 3. Facebook (NEW) */}
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Facebook Page URL</label>
      <input 
        type="text" 
        value={settings.contact?.facebook || ""} 
        onChange={(e) => setSettings({ 
          ...settings, 
          contact: { ...settings.contact, facebook: e.target.value } 
        })}
        placeholder="https://facebook.com/flyem"
        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition-colors"
      />
    </div>

    {/* 4. YouTube (NEW) */}
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">YouTube Channel</label>
      <input 
        type="text" 
        value={settings.contact?.youtube || ""} 
        onChange={(e) => setSettings({ 
          ...settings, 
          contact: { ...settings.contact, youtube: e.target.value } 
        })}
        placeholder="https://youtube.com/@flyem"
        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition-colors"
      />
    </div>

    {/* 5. Support Email */}
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Support Email</label>
      <input 
        type="email" 
        value={settings.contact?.email || ""} 
        onChange={(e) => setSettings({ 
          ...settings, 
          contact: { ...settings.contact, email: e.target.value } 
        })}
        placeholder="support@flyem.in"
        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition-colors"
      />
    </div>

    {/* 6. Support Phone */}
    <div>
      <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Support Phone</label>
      <input 
        type="text" 
        value={settings.contact?.phone || ""} 
        onChange={(e) => setSettings({ 
          ...settings, 
          contact: { ...settings.contact, phone: e.target.value } 
        })}
        placeholder="+91 98765 43210"
        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-black transition-colors"
      />
    </div>

  </div>
</div>

        {/* 2. SEO */}
        <div className="space-y-6 bg-white p-6 border border-gray-200 shadow-sm">
            <h3 className="font-bold uppercase border-b pb-2">SEO & Metadata</h3>
            <div><label className="text-xs font-bold uppercase block mb-1">Meta Title</label><input value={settings.seo.metaTitle || ""} onChange={(e) => handleChange("seo", "metaTitle", e.target.value)} className="w-full border p-2" /></div>
            <div><label className="text-xs font-bold uppercase block mb-1">Meta Description</label><textarea value={settings.seo.metaDescription || ""} onChange={(e) => handleChange("seo", "metaDescription", e.target.value)} className="w-full border p-2 h-20 text-sm" /></div>
            <div><label className="text-xs font-bold uppercase block mb-1">Social Share Image</label><input type="file" onChange={(e)=>uploadHandler(e,"seo","ogImage")} className="w-full border p-1 text-xs" />{settings.seo.ogImage && <img src={settings.seo.ogImage} alt="Social" className="mt-2 h-20 object-cover border" />}</div>
        </div>

        {/* 3. COLORS */}
        <div className="space-y-6 bg-white p-6 border border-gray-200 shadow-sm">
          <h3 className="font-bold uppercase border-b pb-2">Theme Colors</h3>
          <div className="grid grid-cols-2 gap-4">
            {["primaryColor", "accentColor", "backgroundColor", "textColor"].map(color => (
                <div key={color}><label className="text-xs font-bold uppercase block mb-1">{color.replace("Color","")}</label><div className="flex gap-2"><input type="color" value={settings.theme[color] || "#000000"} onChange={(e)=>handleChange("theme",color,e.target.value)} className="h-8 w-8 border"/><input type="text" value={settings.theme[color] || "#000000"} onChange={(e)=>handleChange("theme",color,e.target.value)} className="w-full border p-1 text-xs"/></div></div>
            ))}
          </div>
          <div>
            <label className="text-xs font-bold uppercase block mb-1">Corner Radius</label>
            <select value={settings.layout.borderRadius || "0px"} onChange={(e)=>handleChange("layout","borderRadius",e.target.value)} className="w-full border p-2"><option value="0px">Sharp (0px)</option><option value="4px">Soft (4px)</option><option value="8px">Rounded (8px)</option><option value="24px">Pill (24px)</option></select>
          </div>
        </div>

        {/* 4. TYPOGRAPHY */}
        <div className="space-y-6 bg-white p-6 border border-gray-200 shadow-sm">
          <h3 className="font-bold uppercase border-b pb-2">Typography</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold uppercase block mb-1">Heading Font</label><select value={settings.typography.headingFont || "inter"} onChange={(e)=>handleChange("typography","headingFont",e.target.value)} className="w-full border p-2"><option value="inter">Inter</option><option value="oswald">Oswald</option><option value="poppins">Poppins</option><option value="playfair">Playfair</option><option value="bebas">Bebas Neue</option></select></div>
            <div><label className="text-xs font-bold uppercase block mb-1">Body Font</label><select value={settings.typography.bodyFont || "inter"} onChange={(e)=>handleChange("typography","bodyFont",e.target.value)} className="w-full border p-2"><option value="inter">Inter</option><option value="roboto">Roboto</option><option value="lato">Lato</option><option value="montserrat">Montserrat</option></select></div>
          </div>
        </div>

        {/* 5. CUSTOM CODE */}
        <div className="lg:col-span-2 bg-gray-900 text-white p-6 border border-gray-700 shadow-sm">
            <h3 className="font-bold uppercase border-b border-gray-700 pb-2 mb-4">👨‍💻 Custom Code Injection</h3>
            <p className="text-xs text-gray-400 mb-4">Paste third-party scripts here (Google Analytics, Pixels, Chatbots). Be careful!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold uppercase block mb-1 text-gray-300">Header Code (&lt;head&gt;)</label>
                    <textarea 
                        value={settings.customCode.headCode || ""} 
                        onChange={(e) => handleChange("customCode", "headCode", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 p-2 h-40 text-xs font-mono text-green-400 focus:outline-none focus:border-green-500"
                        placeholder="<script>...</script> or <style>...</style>"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold uppercase block mb-1 text-gray-300">Footer Code (&lt;body&gt;)</label>
                    <textarea 
                        value={settings.customCode.bodyCode || ""} 
                        onChange={(e) => handleChange("customCode", "bodyCode", e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 p-2 h-40 text-xs font-mono text-green-400 focus:outline-none focus:border-green-500"
                        placeholder="<script>...</script>"
                    />
                </div>
            </div>
        </div>

        <div className="lg:col-span-2">
            <button disabled={loading || uploading} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition-colors shadow-lg disabled:bg-gray-500">
                {loading ? "Saving..." : uploading ? "Uploading Image..." : "Save All Settings"}
            </button>
        </div>

      </form>
    </div>
  );
}