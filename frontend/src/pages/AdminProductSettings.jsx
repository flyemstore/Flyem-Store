import React, { useEffect, useState } from "react";
import api from "../api/index";

export default function AdminProductSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('product'); 

  // Local state for adding new variants
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState({ name: "", hex: "#000000" });

  useEffect(() => {
    api.request("/site").then(data => {
        if (!data.productPage) data.productPage = {};
        if (!data.catalogPage) data.catalogPage = {};
        
        // Defaults
        if (!data.productPage.availableSizes) data.productPage.availableSizes = ["S", "M", "L", "XL", "XXL"];
        if (!data.productPage.availableColors) data.productPage.availableColors = [{ name: "Black", hex: "#000000" }, { name: "White", hex: "#ffffff" }];
        
        setSettings(data);
    });
  }, []);

  const handleChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  // --- VARIANT LOGIC ---
  const addSize = () => {
      if(!newSize) return;
      const updated = [...(settings.productPage.availableSizes || []), newSize.toUpperCase()];
      handleChange("productPage", "availableSizes", updated);
      setNewSize("");
  };
  const removeSize = (s) => handleChange("productPage", "availableSizes", settings.productPage.availableSizes.filter(x => x !== s));

  const addColor = () => {
      if(!newColor.name) return;
      const updated = [...(settings.productPage.availableColors || []), newColor];
      handleChange("productPage", "availableColors", updated);
      setNewColor({ name: "", hex: "#000000" });
  };
  const removeColor = (n) => handleChange("productPage", "availableColors", settings.productPage.availableColors.filter(x => x.name !== n));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const savedUser = JSON.parse(localStorage.getItem("userInfo")); 
    
    // Clean Payload
    const { evergreenMinutes, ...productPagePayload } = settings.productPage;

    const payload = {
        ...settings,
        productPage: productPagePayload
    };

    try {
      await api.request("/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedUser.token}` },
        body: JSON.stringify(payload)
      });
      alert("Settings Saved!");
      window.location.reload();
    } catch (error) { 
      console.error(error);
      alert("Failed to save."); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!settings) return <div className="p-20 text-center">Loading...</div>;

  const { productPage, catalogPage } = settings;

  const TabButton = ({ tabId, children }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tabId)}
      className={`px-6 py-3 font-bold uppercase text-sm transition-colors ${
        activeTab === tabId ? 'bg-white border-b-2 border-black text-black' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Layout & Settings</h1>
      
      <div className="flex border-b border-gray-200 mb-8">
        <TabButton tabId="product">Product Page</TabButton>
        <TabButton tabId="catalog">Catalog / Shop</TabButton>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- PRODUCT PAGE TAB --- */}
        {activeTab === 'product' && (
          <div className="space-y-8">
            {/* 1. VARIANTS MANAGER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 border border-gray-200 shadow-sm h-fit">
                    <h3 className="font-bold uppercase border-b pb-2 mb-4">Sizes</h3>
                    <div className="flex gap-2 mb-4">
                        <input value={newSize} onChange={(e)=>setNewSize(e.target.value)} className="w-full border p-2 text-sm" placeholder="e.g. 3XL" />
                        <button type="button" onClick={addSize} className="bg-black text-white px-4 text-xs font-bold uppercase">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {productPage.availableSizes?.map((s, idx) => (
                            <div key={idx} className="border px-3 py-1 text-sm font-bold flex items-center gap-2 bg-gray-50 rounded">{s} <button type="button" onClick={()=>removeSize(s)} className="text-red-500 font-black">×</button></div>
                        ))}
                    </div>
                </div>
                <div className="bg-white p-6 border border-gray-200 shadow-sm h-fit">
                    <h3 className="font-bold uppercase border-b pb-2 mb-4">Colors</h3>
                    <div className="flex gap-2 mb-4 items-center">
                        <input value={newColor.name} onChange={(e)=>setNewColor({...newColor, name: e.target.value})} className="flex-1 border p-2 text-sm" placeholder="Name" />
                        <input type="color" value={newColor.hex} onChange={(e)=>setNewColor({...newColor, hex: e.target.value})} className="h-9 w-9 cursor-pointer border p-0.5" />
                        <button type="button" onClick={addColor} className="bg-black text-white px-4 h-9 text-xs font-bold uppercase">Add</button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                        {productPage.availableColors?.map((c, idx) => (
                            <div key={idx} className="flex justify-between items-center border-b pb-2 last:border-0">
                                <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: c.hex }}></div><span className="text-sm">{c.name}</span></div>
                                <button type="button" onClick={()=>removeColor(c.name)} className="text-red-500 font-bold text-xs uppercase">Remove</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. MARKETING TOOLS */}
            <div className="bg-white p-6 border border-gray-200 shadow-sm">
                <h3 className="font-bold uppercase border-b pb-2 mb-4">Marketing Tools</h3>
                <div className="bg-gray-50 p-4 border border-dashed mb-6">
                    <div className="flex justify-between mb-4">
                        <label className="block text-xs font-bold uppercase">Global Sale Timer</label>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 accent-black" checked={productPage.showCountdown !== false} onChange={(e)=>handleChange("productPage", "showCountdown", e.target.checked)} />
                            <span className="text-xs uppercase font-bold">Enable</span>
                        </div>
                    </div>
                    {productPage.showCountdown && (
                        <>
                            <div className="mb-4"><label className="block text-[10px] font-bold uppercase mb-1">Label Text</label><input value={productPage.countdownText || ""} onChange={(e)=>handleChange("productPage", "countdownText", e.target.value)} className="w-full border p-2 text-sm" placeholder="Flash Sale Ends In:" /></div>
                            <div><label className="block text-[10px] font-bold uppercase mb-1">Sale End Date</label><input type="datetime-local" value={productPage.fixedDate ? new Date(productPage.fixedDate).toISOString().slice(0, 16) : ""} onChange={(e)=>handleChange("productPage", "fixedDate", e.target.value)} className="w-full border p-2 bg-white" /></div>
                        </>
                    )}
                </div>
                <div className="pt-4 border-t mt-4">
                     <div className="flex justify-between items-center mb-2"><label className="text-xs font-bold uppercase">Extra Description</label><div className="flex items-center gap-2"><input type="checkbox" className="w-4 h-4 accent-black" checked={productPage.showExtraSection !== false} onChange={(e)=>handleChange("productPage", "showExtraSection", e.target.checked)} /></div></div>
                     <input value={productPage.extraSectionTitle || ""} onChange={(e)=>handleChange("productPage", "extraSectionTitle", e.target.value)} className="w-full border p-2 mb-2" placeholder="Title" />
                     <textarea value={productPage.extraSectionContent || ""} onChange={(e)=>handleChange("productPage", "extraSectionContent", e.target.value)} className="w-full border p-2" rows="2" placeholder="Content..." />
                </div>
            </div>
          </div>
        )}

        {/* --- CATALOG PAGE TAB (With Visual Grid Controller) --- */}
        {activeTab === 'catalog' && (
          <div className="bg-white p-6 border border-gray-200 shadow-sm">
             <h3 className="font-bold uppercase border-b pb-2 mb-4">Catalog Options</h3>
             <p className="text-sm mb-4">Manage product grid size and sidebar filters.</p>
             
             {/* Sidebar Toggle */}
             <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="sidebarToggle"
                        className="w-4 h-4 cursor-pointer accent-black flex-shrink-0"
                        checked={catalogPage.showSidebar !== false} 
                        onChange={(e)=>handleChange("catalogPage", "showSidebar", e.target.checked)} 
                    />
                    <label htmlFor="sidebarToggle" className="text-sm font-bold uppercase cursor-pointer select-none m-0">
                        Show Filter Sidebar
                    </label>
                </div>
                <p className="text-xs text-gray-500 mt-2 pl-6">Uncheck this to hide the filters on the Shop page.</p>
             </div>

             <div className="grid grid-cols-2 gap-8">
                {/* VISUAL GRID SIZE CONTROLLER */}
                <div>
                    <label className="block text-xs font-bold uppercase mb-3">Grid Size (Columns)</label>
                    <div className="flex gap-2">
                        {[2, 3, 4].map((num) => (
                            <button
                                key={num}
                                type="button"
                                onClick={() => handleChange("catalogPage", "gridColumns", num)}
                                className={`flex-1 py-3 border text-sm font-bold transition-all ${
                                    (catalogPage.gridColumns || 3) === num 
                                    ? 'bg-black text-white border-black' 
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                                }`}
                            >
                                {num} Col
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase mb-3">Sidebar Position</label>
                    <div className="flex gap-4 items-center h-10 border border-gray-100 px-4 bg-gray-50 rounded">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                                type="radio" 
                                checked={catalogPage.sidebarPosition === 'left'} 
                                onChange={(e)=>handleChange("catalogPage", "sidebarPosition", 'left')} 
                                className="accent-black"
                            /> Left
                        </label>
                        <div className="w-px h-4 bg-gray-300 mx-2"></div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                                type="radio" 
                                checked={catalogPage.sidebarPosition === 'right'} 
                                onChange={(e)=>handleChange("catalogPage", "sidebarPosition", 'right')} 
                                className="accent-black"
                            /> Right
                        </label>
                    </div>
                </div>
             </div>
          </div>
        )}

        <button disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition-colors">
            {loading ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}