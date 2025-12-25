import React, { useEffect, useState } from "react";
import api from "../api/index";
import axios from "axios";

export default function AdminHeaderSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const UPLOAD_BASE_URL = isLocal ? "http://localhost:5000" : "https://flyem-backend.onrender.com";
  
  // Local states
  const [newLink, setNewLink] = useState({ label: "", url: "", color: "#000000" });
  const [editingIndex, setEditingIndex] = useState(null); // Track which link is being edited
  const [activeDropdownIndex, setActiveDropdownIndex] = useState(null);
  const [newDeco, setNewDeco] = useState({ image: "", position: "top-right", animation: "float", size: "60px", opacity: 1 });

  useEffect(() => {
    api.request("/site").then(data => {
        if (!data.header) data.header = {};
        if (!data.header.menu) data.header.menu = [];
        if (!data.header.decorations) data.header.decorations = [];
        if (!data.header.announcementBar) {
            data.header.announcementBar = { 
                show: false, 
                text: "Free Shipping on Orders Over $100", 
                backgroundColor: "#000000", 
                textColor: "#ffffff",
                link: "/products"
            };
        }
        setSettings(data);
    }).catch(console.error);
  }, []);

  const handleHeaderChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      header: { ...prev.header, [field]: value }
    }));
  };
  
  const handleAnnouncementChange = (field, value) => {
      setSettings(prev => ({
          ...prev,
          header: {
              ...prev.header,
              announcementBar: {
                  ...prev.header.announcementBar,
                  [field]: value
              }
          }
      }));
  };

  const handleDecoChange = (index, field, value) => {
    const updatedDecos = settings.header.decorations.map((deco, i) => {
      if (i === index) return { ...deco, [field]: value };
      return deco;
    });
    handleHeaderChange("decorations", updatedDecos);
  };

  const removeImage = () => handleHeaderChange("backgroundImage", "");

  // --- DATABASE SYNC HELPER ---
  const saveHeaderToDB = async (updatedSettings, successMessage) => {
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));
    setLoading(true);
    try {
        await api.request("/site", {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedUser.token}` },
            body: JSON.stringify(updatedSettings)
        });
        alert(successMessage);
        window.location.reload(); 
    } catch (error) {
        alert("Failed to save. Check if you are logged in.");
    } finally {
        setLoading(false);
    }
  }

  // --- UPLOAD HANDLERS ---
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
      handleHeaderChange("backgroundImage", `http://localhost:5000${data}`);
      setUploading(false);
    } catch (error) { alert("Upload failed"); setUploading(false); }
  };
  
  const uploadDecoHandler = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setNewDeco(prev => ({ ...prev, image: `http://localhost:5000${data}` }));
      setUploading(false);
    } catch (error) { alert("Upload failed"); setUploading(false); }
  };

  const addDecoration = async () => {
    if(!newDeco.image) return alert("Upload an image first");
    const updatedDecos = [...(settings.header.decorations || []), newDeco];
    const newSettings = { ...settings, header: { ...settings.header, decorations: updatedDecos } };
    
    setSettings(newSettings);
    setNewDeco({ image: "", position: "top-right", animation: "float", size: "60px", opacity: 1 });
    await saveHeaderToDB(newSettings, "Decoration Added!");
  };

  const removeDecoration = async (index) => {
    const updatedDecos = settings.header.decorations.filter((_, i) => i !== index);
    const newSettings = { ...settings, header: { ...settings.header, decorations: updatedDecos } };
    handleHeaderChange("decorations", updatedDecos);
    await saveHeaderToDB(newSettings, "Decoration Removed!");
  };

  // --- MENU LOGIC ---
  const handleMenuAction = async (newMenu, successMessage) => {
    if (!settings) return;
    const newSettings = { ...settings, header: { ...settings.header, menu: newMenu } };
    setSettings(newSettings);
    await saveHeaderToDB(newSettings, successMessage);
  }
  
  // ADD or UPDATE Link
  const saveMenuLink = () => {
    if(!newLink.label || !newLink.url) return;

    let updatedMenu;
    let message;

    if (editingIndex !== null) {
        // UPDATE EXISTING
        updatedMenu = settings.header.menu.map((item, index) => 
            index === editingIndex ? { ...item, ...newLink } : item
        );
        message = "Link Updated!";
        setEditingIndex(null); // Exit edit mode
    } else {
        // CREATE NEW
        updatedMenu = [...(settings.header.menu || []), { ...newLink, children: [] }];
        message = "Link Added!";
    }

    setNewLink({ label: "", url: "", color: "#000000" });
    handleMenuAction(updatedMenu, message);
  };

  // Populate form with existing data
  const editMenuLink = (index) => {
      const linkToEdit = settings.header.menu[index];
      setNewLink({ 
          label: linkToEdit.label, 
          url: linkToEdit.url, 
          color: linkToEdit.color || "#000000" 
      });
      setEditingIndex(index);
      // Scroll to top of menu builder
      document.getElementById("menu-builder").scrollIntoView({ behavior: 'smooth' });
  };
  
  const removeMenuLink = (index) => {
    if(editingIndex === index) {
        setEditingIndex(null);
        setNewLink({ label: "", url: "", color: "#000000" });
    }
    const updatedMenu = settings.header.menu.filter((_, i) => i !== index);
    handleMenuAction(updatedMenu, "Link Removed!");
  };

  const moveLink = (index, direction) => {
    const newMenu = [...settings.header.menu];
    if (direction === -1 && index > 0) [newMenu[index], newMenu[index - 1]] = [newMenu[index - 1], newMenu[index]];
    else if (direction === 1 && index < newMenu.length - 1) [newMenu[index], newMenu[index + 1]] = [newMenu[index + 1], newMenu[index]];
    handleMenuAction(newMenu, "Order Updated!");
  };

  const addSubLink = (parentIndex, subLink) => {
    const newMenu = settings.header.menu.map((link, i) => {
        if (i === parentIndex) return { ...link, children: [...(link.children || []), subLink] };
        return link;
    });
    handleMenuAction(newMenu, "Sub-link Added!");
  };

  // Final save for Visuals
  const handleVisualSave = async (e) => {
    e.preventDefault();
    await saveHeaderToDB(settings, "Visuals Updated!");
  };

  if (!settings) return <div className="p-20 text-center">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Header Customization</h1>
      
      <form onSubmit={handleVisualSave} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* 1. VISUALS */}
        <div className="space-y-6 bg-white p-6 border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold uppercase border-b pb-2">Visuals</h3>
          
          <div className="bg-blue-50 p-4 border border-blue-100 rounded">
              <h4 className="text-xs font-black uppercase mb-3 text-blue-800">📣 Announcement Bar</h4>
              <div className="space-y-3">
                  <div className="flex items-center gap-2">
                      <input 
                        type="checkbox" 
                        checked={settings.header.announcementBar?.show || false} 
                        onChange={(e) => handleAnnouncementChange("show", e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <label className="text-xs font-bold uppercase">Show Announcement Bar</label>
                  </div>
                  
                  {settings.header.announcementBar?.show && (
                      <>
                          <div>
                              <label className="text-[10px] font-bold uppercase block mb-1">Text Message</label>
                              <input 
                                value={settings.header.announcementBar.text} 
                                onChange={(e) => handleAnnouncementChange("text", e.target.value)}
                                className="w-full border p-2 text-sm" 
                              />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold uppercase block mb-1">Link URL (Optional)</label>
                              <input 
                                value={settings.header.announcementBar.link} 
                                onChange={(e) => handleAnnouncementChange("link", e.target.value)}
                                className="w-full border p-2 text-sm" 
                                placeholder="/products"
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-[10px] font-bold uppercase block mb-1">Background</label>
                                  <input type="color" value={settings.header.announcementBar.backgroundColor} onChange={(e) => handleAnnouncementChange("backgroundColor", e.target.value)} className="w-full h-8" />
                              </div>
                              <div>
                                  <label className="text-[10px] font-bold uppercase block mb-1">Text Color</label>
                                  <input type="color" value={settings.header.announcementBar.textColor} onChange={(e) => handleAnnouncementChange("textColor", e.target.value)} className="w-full h-8" />
                              </div>
                          </div>
                      </>
                  )}
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-xs font-bold uppercase block mb-1">Layout</label>
                 <select value={settings.header.layout} onChange={(e)=>handleHeaderChange("layout", e.target.value)} className="w-full border p-2">
                     <option value="left">Logo Left</option><option value="center">Logo Center</option><option value="minimal">Minimal</option><option value="stacked">Stacked</option>
                 </select>
               </div>
               <div>
                 <label className="text-xs font-bold uppercase block mb-1">Animation</label>
                 <select value={settings.header.animation} onChange={(e)=>handleHeaderChange("animation", e.target.value)} className="w-full border p-2">
                     <option value="none">None</option><option value="fade">Fade</option><option value="shrink">Shrink</option>
                 </select>
               </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="text-xs font-bold uppercase block mb-1">Navbar Bg</label>
               <input type="color" value={settings.header.backgroundColor || '#ffffff'} onChange={(e)=>handleHeaderChange("backgroundColor", e.target.value)} className="w-full h-8 cursor-pointer"/>
             </div>
             <div>
               <label className="text-xs font-bold uppercase block mb-1">Navbar Text</label>
               <input type="color" value={settings.header.textColor || '#000000'} onChange={(e)=>handleHeaderChange("textColor", e.target.value)} className="w-full h-8 cursor-pointer"/>
             </div>
          </div>

          <div className="flex items-center gap-2 mt-4 p-2 bg-gray-50 border">
               <input 
                  type="checkbox" 
                  checked={settings.header.transparency || false} 
                  onChange={(e) => handleHeaderChange("transparency", e.target.checked)}
                  className="w-4 h-4 accent-black"
               />
               <label className="text-xs font-bold uppercase">Glass/Transparent Background</label>
          </div>
          
          <div>
              <label className="text-xs font-bold uppercase block mb-1">Header Background Image</label>
              <div className="flex gap-2 items-center">
                  <input type="file" onChange={uploadHandler} className="w-full border p-2 text-xs" />
                  {settings.header.backgroundImage && (
                      <button type="button" onClick={removeImage} className="text-red-500 border px-3 py-2 text-xs font-bold hover:bg-red-50">Remove</button>
                  )}
              </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-3 font-bold uppercase hover:bg-blue-600">Save Visuals</button>
        </div>

        {/* 3. NAVIGATION MENU */}
        <div id="menu-builder" className="lg:col-span-1 space-y-6 bg-white p-6 border border-gray-200 shadow-sm h-fit">
          <h3 className="font-bold uppercase border-b pb-2">Navigation Menu</h3>
          
          {/* Link Creator */}
          <div className={`flex gap-2 items-end p-3 rounded border border-dashed ${editingIndex !== null ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-300'}`}>
            <div className="flex-1">
                <label className="text-[10px] font-bold uppercase block mb-1">{editingIndex !== null ? "Edit Label" : "Label"}</label>
                <input value={newLink.label} onChange={(e)=>setNewLink({...newLink, label: e.target.value})} className="w-full border p-2 text-sm" placeholder="e.g. SALE" />
            </div>
            <div className="flex-1">
                <label className="text-[10px] font-bold uppercase block mb-1">URL</label>
                <input value={newLink.url} onChange={(e)=>setNewLink({...newLink, url: e.target.value})} className="w-full border p-2 text-sm" placeholder="/products" />
            </div>
            <div>
                <label className="text-[10px] font-bold uppercase block mb-1">Color</label>
                <input type="color" value={newLink.color} onChange={(e)=>setNewLink({...newLink, color: e.target.value})} className="h-9 w-9 cursor-pointer p-0 border-0" />
            </div>
            <div className="flex flex-col gap-1">
                <button type="button" onClick={saveMenuLink} className={`${editingIndex !== null ? 'bg-yellow-500' : 'bg-black'} text-white px-4 py-2 text-sm font-bold uppercase min-w-[70px]`}>
                    {editingIndex !== null ? "Update" : "Add"}
                </button>
                {editingIndex !== null && (
                    <button type="button" onClick={() => { setEditingIndex(null); setNewLink({ label: "", url: "", color: "#000000" }); }} className="text-[10px] underline text-gray-500">Cancel</button>
                )}
            </div>
          </div>

          {/* Links List */}
          <div className="space-y-2">
            {settings.header.menu?.map((link, index) => (
                <div key={index} className={`border ${editingIndex === index ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 bg-white'}`}>
                    <div className="flex justify-between items-center p-3">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col gap-1">
                                <button type="button" onClick={()=>moveLink(index, -1)} className="text-[8px] bg-gray-100 px-1 hover:bg-gray-200">▲</button>
                                <button type="button" onClick={()=>moveLink(index, 1)} className="text-[8px] bg-gray-100 px-1 hover:bg-gray-200">▼</button>
                            </div>
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: link.color || settings.header.textColor }}></div>
                            <span className="font-bold text-sm">{link.label}</span>
                        </div>
                        <div className="flex gap-3 items-center">
                             {/* EDIT BUTTON */}
                             <button type="button" onClick={()=>editMenuLink(index)} className="text-gray-500 hover:text-black" title="Edit Link">
                                ✏️
                             </button>
                             
                             <button type="button" onClick={()=>setActiveDropdownIndex(activeDropdownIndex === index ? null : index)} className="text-xs text-blue-600 underline">
                                {link.children?.length > 0 ? `Sub (${link.children.length})` : "+ Dropdown"}
                             </button>
                             <button type="button" onClick={()=>removeMenuLink(index)} className="text-red-500 font-bold text-xs">✕</button>
                        </div>
                    </div>
                    {/* Submenu Area (unchanged) */}
                    {activeDropdownIndex === index && (
                        <div className="bg-gray-50 p-3 border-t border-gray-100">
                            <div className="flex gap-2 mb-2">
                                <input id={`sub-label-${index}`} className="w-1/2 border p-1 text-xs" placeholder="Label" />
                                <input id={`sub-url-${index}`} className="w-1/2 border p-1 text-xs" placeholder="/url" />
                                <button type="button" onClick={() => {
                                    const l = document.getElementById(`sub-label-${index}`).value;
                                    const u = document.getElementById(`sub-url-${index}`).value;
                                    if(l && u) addSubLink(index, { label: l, url: u });
                                }} className="bg-blue-600 text-white px-2 text-xs">Add</button>
                            </div>
                            <ul className="space-y-1">
                                {link.children?.map((sub, sIdx) => (
                                    <li key={sIdx} className="text-xs text-gray-600 flex justify-between border-b pb-1">
                                        <span>↳ {sub.label}</span>
                                        <span className="font-mono">{sub.url}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            ))}
          </div>
        </div>

      </form>
    </div>
  );
}