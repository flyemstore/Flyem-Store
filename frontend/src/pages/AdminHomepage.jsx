import React, { useEffect, useState } from "react";
import api from "../api/index";
import axios from "axios";

export default function AdminHomepage() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null); 

  useEffect(() => {
    api.request("/site").then(data => {
        setSections(data.homepage?.sections || []);
    });
  }, []);

  // --- ADD BLOCK LOGIC ---
  const addSection = (type) => {
    const newSection = {
        id: Date.now().toString(),
        type,
        title: type === "marquee" ? "FREE SHIPPING" : "New Section",
        subtitle: "",
        content: "",
        html: "<div>Custom HTML</div>",
        image: "",
        video: "",
        buttonText: "",
        buttonLink: "",
        align: "center",
        backgroundColor: "#ffffff",
        textColor: "#000000",
        padding: "py-20",
        animation: "none",
        productCount: 4,
        textSize: "medium",   // Default Size
        buttonSize: "medium"  // Default Size
    };
    
    // Smart Defaults
    if (type === 'carousel') newSection.title = "Trending Now";
    if (type === 'categories') newSection.title = "Shop by Category";
    if (type === 'newsletter') newSection.buttonText = "Subscribe";
    if (type === 'hero') newSection.buttonText = "Shop Now";

    setSections([...sections, newSection]);
    setExpanded(sections.length); // Auto-open the new section
  };

  const updateSection = (index, field, value) => {
    const updated = [...sections];
    updated[index][field] = value;
    setSections(updated);
  };

  const removeSection = (index) => {
    if(window.confirm("Delete this section?")) {
        setSections(sections.filter((_, i) => i !== index));
    }
  };

  const moveSection = (index, direction) => {
    const updated = [...sections];
    if (direction === -1 && index > 0) [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    else if (direction === 1 && index < updated.length - 1) [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setSections(updated);
  };

  const uploadHandler = async (e, index, field = "image") => {
    const file = e.target.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      const { data } = await axios.post("http://localhost:5000/api/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      updateSection(index, field, `http://localhost:5000${data}`);
    } catch (error) { alert("Upload failed"); }
  };

  // --- SAVE LOGIC ---
  const handleSubmit = async () => {
    setLoading(true);
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));
    try {
      // Preserve existing settings, only update homepage sections
      const currentData = await api.request("/site");
      const payload = { ...currentData, homepage: { sections } };

      await api.request("/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${savedUser.token}` },
        body: JSON.stringify(payload)
      });
      alert("Homepage Saved!");
    } catch (error) { alert("Failed to save."); } 
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8 sticky top-0 bg-gray-50 py-4 z-20 border-b border-gray-200">
         <h1 className="text-3xl font-black uppercase">Homepage Builder</h1>
         <button onClick={handleSubmit} disabled={loading} className="bg-black text-white px-6 py-3 font-bold uppercase text-xs hover:bg-gray-800 shadow-md">
            {loading ? "Saving..." : "Save Page"}
         </button>
      </div>

      {/* --- TOOLBAR --- */}
      <div className="flex flex-wrap gap-2 mb-8 p-4 bg-white border border-gray-200 shadow-sm rounded">
        <span className="text-xs font-bold uppercase self-center mr-2 text-gray-400 w-full mb-2">Add Content Block:</span>
        
        {/* Basic Blocks */}
        <button onClick={()=>addSection('hero')} className="bg-gray-100 px-3 py-2 text-[10px] font-bold uppercase hover:bg-black hover:text-white border transition-colors">+ Hero</button>
        <button onClick={()=>addSection('promo')} className="bg-gray-100 px-3 py-2 text-[10px] font-bold uppercase hover:bg-black hover:text-white border transition-colors">+ Promo</button>
        <button onClick={()=>addSection('text')} className="bg-gray-100 px-3 py-2 text-[10px] font-bold uppercase hover:bg-black hover:text-white border transition-colors">+ Text</button>
        <button onClick={()=>addSection('marquee')} className="bg-gray-100 px-3 py-2 text-[10px] font-bold uppercase hover:bg-black hover:text-white border transition-colors">+ Marquee</button>
        <button onClick={()=>addSection('categories')} className="bg-gray-100 px-3 py-2 text-[10px] font-bold uppercase hover:bg-black hover:text-white border transition-colors">+ Categories</button>
        
        <div className="w-full h-px bg-gray-100 my-1"></div>
        
        {/* Product Grids */}
        <button onClick={()=>addSection('featured')} className="bg-blue-50 text-blue-700 px-3 py-2 text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white border border-blue-100 transition-colors">+ Featured</button>
        <button onClick={()=>addSection('new-arrivals')} className="bg-blue-50 text-blue-700 px-3 py-2 text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white border border-blue-100 transition-colors">+ New Arrivals</button>
        <button onClick={()=>addSection('best-sellers')} className="bg-blue-50 text-blue-700 px-3 py-2 text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white border border-blue-100 transition-colors">+ Best Sellers</button>
        <button onClick={()=>addSection('carousel')} className="bg-blue-50 text-blue-700 px-3 py-2 text-[10px] font-bold uppercase hover:bg-blue-600 hover:text-white border border-blue-100 transition-colors">+ Carousel</button>
        
        <div className="w-full h-px bg-gray-100 my-1"></div>
        
        {/* Social/Misc */}
        <button onClick={()=>addSection('newsletter')} className="bg-green-50 text-green-700 px-3 py-2 text-[10px] font-bold uppercase hover:bg-green-600 hover:text-white border border-green-100 transition-colors">+ Newsletter</button>
        <button onClick={()=>addSection('testimonials')} className="bg-yellow-50 text-yellow-700 px-3 py-2 text-[10px] font-bold uppercase hover:bg-yellow-500 hover:text-white border border-yellow-100 transition-colors">+ Reviews</button>
        <button onClick={()=>addSection('html')} className="bg-purple-50 text-purple-700 px-3 py-2 text-[10px] font-bold uppercase hover:bg-purple-600 hover:text-white border border-purple-100 transition-colors">+ HTML</button>
      </div>

      {/* --- SECTIONS LIST --- */}
      <div className="space-y-4 pb-20">
        {sections.map((section, idx) => (
            <div key={section.id} className="border border-gray-300 bg-white shadow-sm transition-all">
                
                {/* HEADER ROW */}
                <div className="flex justify-between items-center p-3 bg-gray-50 border-b cursor-pointer hover:bg-gray-100" onClick={()=>setExpanded(expanded === idx ? null : idx)}>
                    <div className="flex items-center gap-3">
                        <span className="bg-black text-white text-[10px] px-2 py-0.5 uppercase rounded font-mono">{section.type}</span>
                        <span className="font-bold text-sm truncate max-w-[150px]">{section.title || "Untitled"}</span>
                    </div>
                    <div className="flex gap-1 items-center" onClick={(e)=>e.stopPropagation()}>
                        <button onClick={()=>moveSection(idx, -1)} className="px-2 text-gray-400 hover:text-black text-xs font-bold">▲</button>
                        <button onClick={()=>moveSection(idx, 1)} className="px-2 text-gray-400 hover:text-black text-xs font-bold">▼</button>
                        
                        <button onClick={()=>setExpanded(expanded === idx ? null : idx)} className="text-xs font-bold uppercase text-blue-600 px-2 border-l border-gray-300 ml-1 hover:underline">
                            {expanded === idx ? "Close" : "Edit"}
                        </button>
                        
                        <button onClick={()=>removeSection(idx)} className="text-xs font-bold uppercase text-red-600 px-2 hover:text-red-800">X</button>
                    </div>
                </div>

                {/* EDITOR FORM */}
                {expanded === idx && (
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border-t animate-in slide-in-from-top-1">
                        
                        {/* LEFT: Content Fields */}
                        <div className="space-y-4">
                            <div><label className="block text-xs font-bold uppercase mb-1">Title</label><textarea value={section.title} onChange={(e)=>updateSection(idx, "title", e.target.value)} className="w-full border p-2 text-sm" /></div>
                            
                            {!['html', 'marquee', 'categories'].includes(section.type) && (
                                <div><label className="block text-xs font-bold uppercase mb-1">Subtitle / Body</label><textarea value={section.subtitle} onChange={(e)=>updateSection(idx, "subtitle", e.target.value)} className="w-full border p-2 text-sm" rows="3" /></div>
                            )}

                            {section.type === 'html' && (
                                <div><label className="block text-xs font-bold uppercase mb-1">Custom HTML</label><textarea value={section.html} onChange={(e)=>updateSection(idx, "html", e.target.value)} className="w-full border p-2 text-xs font-mono bg-gray-50" rows="6" /></div>
                            )}

                            {(['hero','promo','text','newsletter'].includes(section.type)) && (
                                <div className="grid grid-cols-2 gap-2">
                                    <div><label className="block text-xs font-bold uppercase mb-1">Button Text</label><input value={section.buttonText} onChange={(e)=>updateSection(idx, "buttonText", e.target.value)} className="w-full border p-2 text-sm" /></div>
                                    <div><label className="block text-xs font-bold uppercase mb-1">Link URL</label><input value={section.buttonLink} onChange={(e)=>updateSection(idx, "buttonLink", e.target.value)} className="w-full border p-2 text-sm" placeholder="/products" /></div>
                                </div>
                            )}

                            {/* --- NEW: SIZE OPTIONS (Correctly Placed) --- */}
                            {(['hero', 'promo', 'text'].includes(section.type)) && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Headline Size</label>
                                        <select value={section.textSize || 'medium'} onChange={(e)=>updateSection(idx, "textSize", e.target.value)} className="w-full border p-2 text-sm bg-white">
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                            <option value="xl">Extra Large</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-1">Button Size</label>
                                        <select value={section.buttonSize || 'medium'} onChange={(e)=>updateSection(idx, "buttonSize", e.target.value)} className="w-full border p-2 text-sm bg-white">
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {(['new-arrivals','best-sellers','featured','carousel'].includes(section.type)) && (
                                <div><label className="block text-xs font-bold uppercase mb-1">Product Count</label><input type="number" value={section.productCount} onChange={(e)=>updateSection(idx, "productCount", e.target.value)} className="w-full border p-2 text-sm" /></div>
                            )}
                        </div>

                        {/* RIGHT: Styling & Media */}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-xs font-bold uppercase mb-1">Background</label><input type="color" value={section.backgroundColor} onChange={(e)=>updateSection(idx, "backgroundColor", e.target.value)} className="w-full h-8 cursor-pointer border p-1" /></div>
                                <div><label className="block text-xs font-bold uppercase mb-1">Text Color</label><input type="color" value={section.textColor} onChange={(e)=>updateSection(idx, "textColor", e.target.value)} className="w-full h-8 cursor-pointer border p-1" /></div>
                            </div>

                            {/* IMAGE UPLOAD */}
                            {(['hero','promo'].includes(section.type)) && (
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1">Image</label>
                                    <input type="file" onChange={(e)=>uploadHandler(e, idx, "image")} className="w-full border p-1 text-xs mb-1" />
                                    {section.image && (
                                        <div className="relative h-24 w-full">
                                            <img src={section.image} className="h-full w-full object-cover border" alt="preview" />
                                            <button onClick={()=>updateSection(idx, "image", "")} className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-1">Remove</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* VIDEO UPLOAD */}
                            {(section.type === 'hero') && (
                                <div className="mt-2">
                                    <label className="block text-xs font-bold uppercase mb-1">Video (MP4)</label>
                                    <input type="file" onChange={(e)=>uploadHandler(e, idx, "video")} className="w-full border p-1 text-xs mb-1" />
                                    {section.video && (
                                        <div className="relative h-8 w-full bg-gray-100 flex items-center justify-between px-2 border">
                                            <span className="text-[10px] text-green-600 font-bold">Video Active</span>
                                            <button onClick={()=>updateSection(idx, "video", "")} className="text-red-500 font-bold text-xs">X</button>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className="block text-xs font-bold uppercase mb-1">Alignment</label><select value={section.align} onChange={(e)=>updateSection(idx, "align", e.target.value)} className="w-full border p-2 text-sm bg-white"><option value="left">Left</option><option value="center">Center</option><option value="right">Right</option></select></div>
                                <div><label className="block text-xs font-bold uppercase mb-1">Padding</label><input value={section.padding} onChange={(e)=>updateSection(idx, "padding", e.target.value)} className="w-full border p-2 text-sm" placeholder="py-20" /></div>
                            </div>

                            <div><label className="block text-xs font-bold uppercase mb-1">Animation</label><select value={section.animation} onChange={(e)=>updateSection(idx, "animation", e.target.value)} className="w-full border p-2 text-sm bg-white"><option value="none">None</option><option value="fade">Fade In</option><option value="slide">Slide Up</option><option value="zoom">Zoom In</option></select></div>
                        </div>

                    </div>
                )}
            </div>
        ))}
        {sections.length === 0 && <div className="text-center py-20 text-gray-400 italic border-2 border-dashed">Homepage is empty. Add a block from above.</div>}
      </div>
    </div>
  );
}