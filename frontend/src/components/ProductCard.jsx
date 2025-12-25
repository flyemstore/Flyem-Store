import React from "react";
import { Link } from "react-router-dom";

// 👇 1. ADD IMAGE HELPER
const getImageUrl = (imagePath) => {
  if (!imagePath) return ""; 
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  return `https://flyem-backend.onrender.com${imagePath}`;
};

export default function ProductCard({ product }) {
  
  const isNew = (dateString) => {
    if (!dateString) return false;
    const productDate = new Date(dateString);
    const today = new Date();
    const differenceInDays = (today - productDate) / (1000 * 3600 * 24);
    return differenceInDays <= 7;
  };

  return (
    <Link to={`/product/${product._id}`} className="group block">
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
        
        {/* NEW DROP BADGE */}
        {isNew(product.createdAt) && (
            <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-10 shadow-sm">
                New Drop
            </span>
        )}

        {/* 👇 2. USE HELPER HERE */}
        <img 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out" 
        />

        {product.countInStock === 0 && (
             <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                <span className="bg-white text-black text-xs font-bold px-3 py-1 uppercase border border-black">Sold Out</span>
             </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="font-bold text-sm uppercase tracking-wide group-hover:underline decoration-1 underline-offset-4">
            {product.name}
        </h3>
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-900">₹{product.price}</p>
             {product.rating > 0 && (
                <span className="text-[10px] text-gray-500 font-bold">★ {product.rating.toFixed(1)}</span>
            )}
        </div>
      </div>
    </Link>
  );
}