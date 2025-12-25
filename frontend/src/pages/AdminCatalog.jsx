import React, { useEffect, useState } from "react";
import api from "../api/index"; // Ensure this path is correct for your folder structure

export default function AdminCatalog() {
  const [settings, setSettings] = useState({
    gridColumns: 3,
    showFilters: true,
    showSidebar: true,
    sidebarPosition: 'left',
    defaultSort: 'newest',
    itemsPerPage: 12,
    customFilters: [] // New State for Custom Filters
  });
  
  // State for the "Add New Filter" form
  const [newFilterName, setNewFilterName] = useState("");
  const [newFilterOptions, setNewFilterOptions] = useState("");

  const [loading, setLoading] = useState(false);

  // Load current settings
  useEffect(() => {
    const loadData = async () => {
      try {
        const siteData = await api.request("/site");
        if (siteData.catalogPage) {
          // Ensure customFilters exists in state even if DB is empty
          setSettings({ 
            ...siteData.catalogPage, 
            customFilters: siteData.catalogPage.customFilters || [] 
          });
        }
      } catch (error) { console.error(error); }
    };
    loadData();
  }, []);

  // Handle Basic Input Change
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // --- CUSTOM FILTER LOGIC ---
  
  const addFilter = () => {
    if (!newFilterName.trim() || !newFilterOptions.trim()) {
        alert("Please enter a filter name and at least one option.");
        return;
    }

    // Convert comma-separated string to array (e.g., "Red, Blue" -> ["Red", "Blue"])
    const optionsArray = newFilterOptions.split(',').map(s => s.trim()).filter(Boolean);

    const newFilter = {
        label: newFilterName,
        options: optionsArray
    };

    setSettings(prev => ({
        ...prev,
        customFilters: [...prev.customFilters, newFilter]
    }));

    // Reset Form
    setNewFilterName("");
    setNewFilterOptions("");
  };

  const removeFilter = (index) => {
    if(window.confirm("Remove this filter?")) {
        const updated = [...settings.customFilters];
        updated.splice(index, 1);
        setSettings(prev => ({ ...prev, customFilters: updated }));
    }
  };

  // Save Changes
  const handleSave = async () => {
    setLoading(true);
    try {
      const currentSite = await api.request("/site");
      
      const payload = {
        ...currentSite,
        catalogPage: settings
      };

      await api.request("/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      alert("Catalog Settings Saved!");
    } catch (error) {
      alert("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 py-4 z-20 border-b border-gray-200">
         <h1 className="text-3xl font-black uppercase">Shop & Filter Settings</h1>
         <button 
            onClick={handleSave} 
            disabled={loading} 
            className="bg-black text-white px-6 py-3 font-bold uppercase text-xs hover:bg-gray-800 shadow-md transition-colors"
         >
            {loading ? "Saving..." : "Save Settings"}
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* --- 1. LAYOUT SETTINGS --- */}
        <div className="bg-white p-6 border border-gray-200 shadow-sm">
            <h2 className="text-sm font-black uppercase mb-6 border-b pb-2">Layout Configuration</h2>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Products Per Row (Desktop)</label>
                    <div className="flex gap-2">
                        {[2, 3, 4].map(num => (
                            <button 
                                key={num}
                                onClick={() => handleChange("gridColumns", num)}
                                className={`flex-1 py-2 border text-sm font-bold ${settings.gridColumns === num ? 'bg-black text-white border-black' : 'bg-white text-gray-500 hover:border-black'}`}
                            >
                                {num} Columns
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Items Per Page</label>
                    <input 
                        type="number" 
                        value={settings.itemsPerPage} 
                        onChange={(e) => handleChange("itemsPerPage", Number(e.target.value))}
                        className="w-full border p-2 text-sm font-bold"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Default Sorting</label>
                    <select 
                        value={settings.defaultSort} 
                        onChange={(e) => handleChange("defaultSort", e.target.value)}
                        className="w-full border p-2 text-sm bg-white"
                    >
                        <option value="newest">Newest First</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                    </select>
                </div>
            </div>
        </div>

        {/* --- 2. SIDEBAR & FILTERS --- */}
        <div className="space-y-8">
            
            {/* Sidebar Visibility */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
                <h2 className="text-sm font-black uppercase mb-6 border-b pb-2">Sidebar Settings</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded bg-gray-50">
                        <div>
                            <span className="block text-sm font-bold uppercase">Enable Sidebar</span>
                        </div>
                        <input 
                            type="checkbox" 
                            checked={settings.showSidebar} 
                            onChange={(e) => handleChange("showSidebar", e.target.checked)}
                            className="w-5 h-5 accent-black"
                        />
                    </div>

                    <div className={`space-y-4 transition-opacity ${!settings.showSidebar ? 'opacity-50 pointer-events-none' : ''}`}>
                         <div>
                            <label className="block text-xs font-bold uppercase mb-2 text-gray-500">Sidebar Position</label>
                            <div className="flex gap-2">
                                <button onClick={() => handleChange("sidebarPosition", "left")} className={`flex-1 py-2 border text-sm font-bold ${settings.sidebarPosition === 'left' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 hover:border-black'}`}>Left</button>
                                <button onClick={() => handleChange("sidebarPosition", "right")} className={`flex-1 py-2 border text-sm font-bold ${settings.sidebarPosition === 'right' ? 'bg-black text-white border-black' : 'bg-white text-gray-500 hover:border-black'}`}>Right</button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded">
                            <div>
                                <span className="block text-sm font-bold uppercase">Show Standard Filters</span>
                                <span className="text-xs text-gray-400">Color, Size, Price</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={settings.showFilters} 
                                onChange={(e) => handleChange("showFilters", e.target.checked)}
                                className="w-5 h-5 accent-black"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. CUSTOM FILTERS --- */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
                <h2 className="text-sm font-black uppercase mb-6 border-b pb-2">Custom Filters</h2>
                
                {/* List Existing Filters */}
                <div className="space-y-3 mb-6">
                    {settings.customFilters && settings.customFilters.map((filter, index) => (
                        <div key={index} className="flex justify-between items-start p-3 bg-gray-50 border border-gray-100 rounded">
                            <div>
                                <span className="block text-xs font-bold uppercase">{filter.label}</span>
                                <p className="text-xs text-gray-500 mt-1">{filter.options.join(", ")}</p>
                            </div>
                            <button onClick={() => removeFilter(index)} className="text-red-500 text-xs font-bold uppercase hover:underline">Remove</button>
                        </div>
                    ))}
                    {(!settings.customFilters || settings.customFilters.length === 0) && (
                        <div className="text-center py-4 text-xs text-gray-400 italic">No custom filters added yet.</div>
                    )}
                </div>

                {/* Add New Filter Form */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                    <h3 className="text-xs font-bold uppercase mb-3 text-black">Add New Filter</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1 text-gray-500">Filter Name (e.g. Fabric)</label>
                            <input 
                                value={newFilterName}
                                onChange={(e) => setNewFilterName(e.target.value)}
                                className="w-full border p-2 text-sm"
                                placeholder="Material"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold uppercase mb-1 text-gray-500">Options (Comma separated)</label>
                            <input 
                                value={newFilterOptions}
                                onChange={(e) => setNewFilterOptions(e.target.value)}
                                className="w-full border p-2 text-sm"
                                placeholder="Cotton, Wool, Polyester"
                            />
                        </div>
                        <button onClick={addFilter} className="w-full bg-black text-white py-2 text-xs font-bold uppercase hover:bg-gray-800">
                            + Add Filter
                        </button>
                    </div>
                </div>

            </div>

        </div>
      </div>
    </div>
  );
}