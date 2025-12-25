import React, { useEffect, useState } from "react";
import api from "../api/index";

export default function AdminFooterSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load existing settings
  useEffect(() => {
    api.request("/site").then((data) => {
      // Ensure structure exists
      if (!data.footer) data.footer = {};
      if (!data.footer.linkGroups) data.footer.linkGroups = [];
      setSettings(data);
    });
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      footer: { ...prev.footer, [field]: value },
    }));
  };

  // --- COLUMN MANAGEMENT ---
  const addColumn = () => {
    const newGroup = { title: "New Column", links: [] };
    handleChange("linkGroups", [...(settings.footer.linkGroups || []), newGroup]);
  };

  const removeColumn = (index) => {
    const updated = settings.footer.linkGroups.filter((_, i) => i !== index);
    handleChange("linkGroups", updated);
  };

  const updateColumnTitle = (index, val) => {
    const updated = [...settings.footer.linkGroups];
    updated[index].title = val;
    handleChange("linkGroups", updated);
  };

  // --- LINK MANAGEMENT ---
  const addLink = (colIndex) => {
    const updated = [...settings.footer.linkGroups];
    updated[colIndex].links.push({ label: "New Link", url: "/" });
    handleChange("linkGroups", updated);
  };

  const removeLink = (colIndex, linkIndex) => {
    const updated = [...settings.footer.linkGroups];
    updated[colIndex].links = updated[colIndex].links.filter((_, i) => i !== linkIndex);
    handleChange("linkGroups", updated);
  };

  const updateLink = (colIndex, linkIndex, field, val) => {
    const updated = [...settings.footer.linkGroups];
    updated[colIndex].links[linkIndex][field] = val;
    handleChange("linkGroups", updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.request("/site", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      alert("Footer Settings Saved!");
      window.location.reload();
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  if (!settings) return <div className="p-20 text-center">Loading...</div>;
  const { footer } = settings;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Footer Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-12">
        
        {/* 1. VISUAL STYLES */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
          <h3 className="font-bold uppercase border-b pb-2 mb-4">Visual Styles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase mb-2">Background Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={footer.backgroundColor || "#000000"} 
                  onChange={(e) => handleChange("backgroundColor", e.target.value)} 
                  className="h-10 w-10 cursor-pointer border p-1"
                />
                <input 
                  type="text" 
                  value={footer.backgroundColor || "#000000"} 
                  onChange={(e) => handleChange("backgroundColor", e.target.value)} 
                  className="flex-1 border p-2 text-sm uppercase"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-2">Text Color</label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={footer.textColor || "#ffffff"} 
                  onChange={(e) => handleChange("textColor", e.target.value)} 
                  className="h-10 w-10 cursor-pointer border p-1"
                />
                <input 
                  type="text" 
                  value={footer.textColor || "#ffffff"} 
                  onChange={(e) => handleChange("textColor", e.target.value)} 
                  className="flex-1 border p-2 text-sm uppercase"
                />
              </div>
            </div>
            <div className="md:col-span-2">
               <label className="block text-xs font-bold uppercase mb-2">Copyright Text</label>
               <input 
                  value={footer.copyrightText || ""} 
                  onChange={(e) => handleChange("copyrightText", e.target.value)}
                  className="w-full border p-3 text-sm"
                  placeholder="© 2024 FLYEM Store. All rights reserved."
               />
            </div>
          </div>
        </div>

        {/* 2. TOGGLES */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
           <h3 className="font-bold uppercase border-b pb-2 mb-4">Features</h3>
           <div className="flex gap-8">
              <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={footer.showNewsletter !== false} onChange={(e) => handleChange("showNewsletter", e.target.checked)} className="accent-black" />
                  <span className="text-sm font-bold uppercase">Show Newsletter</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={footer.showPaymentIcons !== false} onChange={(e) => handleChange("showPaymentIcons", e.target.checked)} className="accent-black" />
                  <span className="text-sm font-bold uppercase">Show Payment Icons</span>
              </label>
           </div>
        </div>

        {/* 3. LINK COLUMNS MANAGER */}
        <div className="space-y-4">
           <div className="flex justify-between items-end">
              <h3 className="text-xl font-bold uppercase">Menu Columns</h3>
              <button type="button" onClick={addColumn} className="bg-black text-white px-4 py-2 text-xs font-bold uppercase">
                + Add Column
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {footer.linkGroups?.map((group, colIndex) => (
                 <div key={colIndex} className="bg-gray-50 p-4 border border-gray-200 relative group">
                    {/* Delete Column Button */}
                    <button 
                        type="button" 
                        onClick={() => removeColumn(colIndex)}
                        className="absolute top-2 right-2 text-red-500 font-bold text-xs uppercase opacity-50 hover:opacity-100"
                    >
                        Remove Column
                    </button>

                    <div className="mb-4">
                       <label className="block text-[10px] font-bold uppercase mb-1">Column Title</label>
                       <input 
                          value={group.title} 
                          onChange={(e) => updateColumnTitle(colIndex, e.target.value)}
                          className="w-full border p-2 font-bold text-sm"
                          placeholder="e.g. Help"
                       />
                    </div>

                    <div className="space-y-2">
                       {group.links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex gap-2 items-center bg-white p-2 border">
                             <div className="flex-1 grid gap-1">
                                <input 
                                   value={link.label} 
                                   onChange={(e) => updateLink(colIndex, linkIndex, "label", e.target.value)}
                                   className="w-full text-xs font-bold border-b border-gray-100 focus:outline-none"
                                   placeholder="Label"
                                />
                                <input 
                                   value={link.url} 
                                   onChange={(e) => updateLink(colIndex, linkIndex, "url", e.target.value)}
                                   className="w-full text-[10px] text-blue-600 focus:outline-none"
                                   placeholder="/url"
                                />
                             </div>
                             <button type="button" onClick={() => removeLink(colIndex, linkIndex)} className="text-red-400 font-bold px-2">×</button>
                          </div>
                       ))}
                       <button type="button" onClick={() => addLink(colIndex)} className="w-full py-2 text-xs font-bold uppercase border border-dashed border-gray-300 hover:bg-gray-100 mt-2">
                          + Add Link
                       </button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition-colors text-lg">
           {loading ? "Saving..." : "Save Footer Settings"}
        </button>

      </form>
    </div>
  );
}