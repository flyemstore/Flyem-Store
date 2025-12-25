import React, { useState } from "react";
import api from "../api/index";

// Helper to determine server URL for uploads
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const SERVER_URL = isLocal 
  ? "http://localhost:5000" 
  : "https://flyem-backend.onrender.com";

export default function AdminAddProduct() {
  // 1. FORM STATE
  const [formData, setFormData] = useState({
    name: "", 
    price: "", 
    category: "T-shirt", 
    color: "", // 👈 CHANGED: Removed default "Black" to encourage specific input
    image: "", 
    gallery: [], 
    sizeChart: "", 
    description: "",
    saleDeadline: "" 
  });

  // 2. VARIANTS STATE
  const [variants, setVariants] = useState([
    { size: "M", sku: "", stock: 10 } 
  ]);

  const [uploading, setUploading] = useState(false);

  // --- HANDLERS ---

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Variant Inputs
  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: "L", sku: "", stock: 10 }]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  // --- IMAGE UPLOAD LOGIC ---

  const uploadMainHandler = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append("image", file);
    setUploading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/upload`, {
         method: 'POST',
         body: data,
         credentials: 'include', 
      });
      
      if (!res.ok) throw new Error("Upload failed"); 
      const result = await res.json();
      
      if(result.image) {
          setFormData(prev => ({ ...prev, image: result.image }));
      } else {
          alert("Upload failed: " + (result.message || "Unknown error"));
      }
      setUploading(false);
    } catch (error) { 
        console.error(error);
        alert("Upload failed: Authorization denied."); 
        setUploading(false); 
    }
  };

  const uploadSizeChartHandler = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append("image", file);
    setUploading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/upload`, {
         method: 'POST',
         body: data,
         credentials: 'include',
      });

      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      
      if(result.image) {
          setFormData(prev => ({ ...prev, sizeChart: result.image }));
      }
      setUploading(false);
    } catch (error) { 
        console.error(error);
        alert("Upload failed"); 
        setUploading(false); 
    }
  };

  const uploadGalleryHandler = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const data = new FormData();
    data.append("image", file);
    setUploading(true);
    try {
      const res = await fetch(`${SERVER_URL}/api/upload`, {
         method: 'POST',
         body: data,
         credentials: 'include',
      });

      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();

      if(result.image) {
          setFormData(prev => ({ ...prev, gallery: [...prev.gallery, result.image] }));
      }
      setUploading(false);
    } catch (error) { 
        console.error(error); 
        alert("Upload failed"); 
        setUploading(false); 
    }
  };

  const removeGalleryImage = (index) => {
    setFormData(prev => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));
  };

  // --- SUBMIT ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        variants: variants
      };

      await api.request("/products", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      
      alert("Product Added Successfully!");
      // Reset Form
      setFormData({ name: "", price: "", category: "T-shirt", color: "", image: "", gallery: [], sizeChart: "", description: "", saleDeadline: "" });
      setVariants([{ size: "M", sku: "", stock: 10 }]);
    } catch (error) {
      console.error(error);
      alert("Failed to add product.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-black uppercase mb-8">Add New Drop</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SECTION 1: BASIC INFO */}
        <div>
          <label className="block text-xs font-bold uppercase mb-2">Product Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required className="w-full border p-3" placeholder="FLYEM Zip Hoodie" />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-xs font-bold uppercase mb-2">Category</label>
               <input 
                 type="text" 
                 name="category" 
                 value={formData.category} 
                 onChange={handleChange} 
                 required 
                 className="w-full border p-3" 
                 placeholder="e.g. Pants, Oversized Tees" 
               />
            </div>
             <div>
                <label className="block text-xs font-bold uppercase mb-2">Display Price (₹)</label>
                <input name="price" type="number" value={formData.price} onChange={handleChange} required className="w-full border p-3" placeholder="1999" />
            </div>
        </div>

        {/* 👇 UPDATED COLOR INPUT */}
        <div>
            <label className="block text-xs font-bold uppercase mb-2">Color Name</label>
            <input 
                name="color" 
                type="text" 
                value={formData.color} 
                onChange={handleChange} 
                required 
                className="w-full border p-3" 
                placeholder="e.g. Black, Navy Blue, Off White" 
            />
            <p className="text-[10px] text-gray-400 mt-1">This specific color name will be shown on the product page.</p>
        </div>

        {/* --- SECTION 2: VARIANTS (SIZES & SKUS) --- */}
        <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold uppercase text-sm">Sizes & SKUs</h3>
            <button type="button" onClick={addVariant} className="text-xs bg-black text-white px-3 py-1 rounded uppercase font-bold hover:bg-gray-800">
              + Add Size
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="flex gap-2 mb-2 items-end">
              <div className="w-24">
                <label className="text-[10px] uppercase font-bold text-gray-400">Size</label>
                <select 
                  value={variant.size} 
                  onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                  className="w-full border p-2 text-sm bg-white"
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Store SKU (From Qikink)</label>
                <input 
                  type="text" 
                  value={variant.sku} 
                  placeholder="e.g. FLYEM-ZIP-M"
                  onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                  className="w-full border p-2 text-sm font-mono"
                  required 
                />
              </div>

              <div className="w-20">
                <label className="text-[10px] uppercase font-bold text-gray-400">Stock</label>
                <input 
                  type="number" 
                  value={variant.stock} 
                  onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                  className="w-full border p-2 text-sm text-center"
                />
              </div>

              <button 
                type="button" 
                onClick={() => removeVariant(index)}
                className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200"
              >
                ✕
              </button>
            </div>
          ))}
          <p className="text-[10px] text-gray-400 mt-2">* Copy "Store SKU" from your Qikink Dashboard "View Variations" table.</p>
        </div>

        {/* --- SECTION 3: IMAGES & EXTRAS --- */}
        
        <div className="bg-blue-50 p-4 border border-blue-100">
            <label className="block text-xs font-bold uppercase mb-2 text-blue-800">Specific Sale Timer (Optional)</label>
            <input 
                type="datetime-local" 
                name="saleDeadline" 
                value={formData.saleDeadline} 
                onChange={handleChange} 
                className="w-full border p-3 bg-white text-sm" 
            />
        </div>

        {/* Main Image */}
        <div className="bg-gray-50 p-4 border">
          <label className="block text-xs font-bold uppercase mb-2">Main Image</label>
          <input type="file" onChange={uploadMainHandler} className="w-full border p-1 bg-white text-xs mb-2" />
          {formData.image && <img src={formData.image} alt="Main" className="h-32 object-cover border" />}
        </div>

        {/* Size Chart Upload */}
        <div className="bg-gray-50 p-4 border">
          <label className="block text-xs font-bold uppercase mb-2">Size Chart (Image)</label>
          <p className="text-[10px] text-gray-400 mb-2">Upload a specific size guide for this product.</p>
          
          <input type="file" accept="image/*" onChange={uploadSizeChartHandler} className="w-full border p-1 bg-white text-xs mb-2" />
          
          {formData.sizeChart && (
            <div className="relative w-full max-w-xs border bg-white p-2">
               <p className="text-xs font-bold mb-1 text-center text-gray-400">Preview</p>
               <img src={formData.sizeChart} alt="Size Chart" className="w-full h-auto object-contain" />
               <button 
                 type="button"
                 onClick={() => setFormData({...formData, sizeChart: ""})}
                 className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
               >
                 X
               </button>
            </div>
          )}
        </div>

        {/* Gallery */}
        <div className="bg-gray-50 p-4 border">
          <label className="block text-xs font-bold uppercase mb-2">Gallery Images</label>
          <input type="file" onChange={uploadGalleryHandler} className="w-full border p-1 bg-white text-xs mb-2" />
          <div className="flex gap-2 flex-wrap">
            {formData.gallery.map((url, idx) => (
                <div key={idx} className="relative h-20 w-20">
                    <img src={url} className="h-full w-full object-cover border" alt="gallery"/>
                    <button type="button" onClick={()=>removeGalleryImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">X</button>
                </div>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase mb-2">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-3" rows="3"></textarea>
        </div>

        <button className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition-colors">
            {uploading ? "Uploading..." : "Publish Product"}
        </button>
      </form>
    </div>
  );
}