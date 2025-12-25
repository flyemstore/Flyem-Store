import React, { useState } from "react";

// 👇 1. BACKEND URL HELPER (Restored)
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const SERVER_URL = isLocal 
  ? "http://localhost:5000" 
  : "https://flyem-backend.onrender.com";

// 👇 2. SMART IMAGE URL HELPER
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  
  // If it's a Cloudinary URL, use it directly
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  
  // If it's a legacy local file, prepend backend URL
  return `${SERVER_URL}${imagePath}`;
};

export default function AdminMedia() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  // Handle New Upload
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      // 👇 3. FIX: Use standard 'fetch' instead of 'api.post'
      const res = await fetch(`${SERVER_URL}/api/upload`, {
        method: "POST",
        body: formData,
        // Note: Do NOT set Content-Type header manually for FormData; fetch does it automatically
      });

      const data = await res.json();
      
      if (res.ok && data.image) {
          // Add the new image to the grid immediately
          const newImage = { 
              name: file.name, 
              url: data.image 
          };
          setImages((prev) => [newImage, ...prev]);
      } else {
          alert("Upload failed: " + (data.message || "Unknown Error"));
      }

    } catch (error) {
      console.error(error);
      alert("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  // Copy to Clipboard
  const copyToClipboard = (url) => {
      const fullPath = getImageUrl(url); 
      navigator.clipboard.writeText(fullPath);
      alert("Link Copied! You can now paste it into a Product.");
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tight">Media Uploader</h1>
            <p className="text-sm text-gray-500 mt-1">Upload images here to generate Cloudinary Links.</p>
        </div>
        
        <div className="relative">
            <input 
                type="file" 
                onChange={uploadFileHandler} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-gray-800 transition-colors">
                {uploading ? "Uploading..." : "+ Upload New Image"}
            </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-400">Upload an image to get its Cloudinary Link.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {images.map((img, index) => (
                <div key={index} className="group relative aspect-square bg-gray-100 border border-gray-200 rounded overflow-hidden">
                    
                    {/* Display Image using Smart URL */}
                    <img 
                        src={getImageUrl(img.url)} 
                        alt={img.name} 
                        className="w-full h-full object-cover" 
                    />
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                        <p className="text-white text-[10px] truncate w-full text-center mb-2">{img.name}</p>
                        
                        <button 
                            onClick={() => copyToClipboard(img.url)}
                            className="bg-white text-black text-xs font-bold px-3 py-2 uppercase rounded w-full hover:bg-gray-200"
                        >
                            Copy Link 📋
                        </button>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}