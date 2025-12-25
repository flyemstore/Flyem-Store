import React from "react";
import { useCart } from "../context/CartContext";
import { Link, useLocation } from "react-router-dom";

// 👇 1. ADD THIS HELPER FUNCTION
const getImageUrl = (imagePath) => {
  if (!imagePath) return ""; 
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  // ⚠️ Ensure this matches your backend URL
  return `https://flyem-backend.onrender.com${imagePath}`;
};

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("userInfo"));

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Your Bag is Empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't found your vibe yet.</p>
        <Link 
          to="/products" 
          className="btn-primary text-sm hover:scale-105 transition-transform"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-12">Your Cart ({cart.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT: Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {cart.map((item) => (
            <div key={`${item.id || item._id}-${item.size}`} className="flex gap-6 border-b border-gray-100 pb-8">
              <div className="w-24 h-32 bg-gray-100 flex-shrink-0 overflow-hidden rounded-theme">
                {/* 👇 2. USE THE HELPER HERE */}
                <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg uppercase leading-tight">{item.name}</h3>
                    <p className="font-bold">₹{item.price * item.quantity}</p>
                  </div>
                  <div className="text-sm mt-1 mb-3 space-y-1">
                      <p className="text-gray-500 uppercase">Size: <span className="text-black font-bold">{item.size}</span></p>
                      {/* Optional: Show SKU for debugging, or hide it */}
                      {/* <p className="text-[10px] text-gray-400 font-mono">SKU: {item.sku}</p> */}
                  </div>
                  
                  {/* QUANTITY CONTROLS */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item._id || item.id, item.size, -1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 rounded-full disabled:opacity-50"
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id || item.id, item.size, 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 hover:bg-gray-100 rounded-full"
                    >
                      +
                    </button>
                  </div>

                </div>
                <button 
                  onClick={() => removeFromCart(item._id || item.id, item.size)}
                  className="text-xs font-bold uppercase tracking-wider text-red-500 self-start hover:text-red-700 hover:underline mt-4"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT: Order Summary */}
        <div className="bg-gray-50 p-8 h-fit border border-gray-100 rounded-theme">
          <h3 className="font-black uppercase tracking-wider text-lg mb-6">Order Summary</h3>
          
          <div className="space-y-4 mb-8 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{cartTotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Calculated at next step</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-4 border-t border-gray-200">
              <span>Total</span>
              <span>₹{cartTotal}</span>
            </div>
          </div>

          {/* CHECKOUT BUTTON */}
          {user ? (
            <Link 
              to="/checkout" 
              className="btn-primary block w-full text-center hover:opacity-90"
            >
              Checkout
            </Link>
          ) : (
            <Link 
              to="/login" 
              state={{ from: "/cart" }} 
              className="btn-primary block w-full text-center hover:opacity-90"
            >
              Login to Checkout
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}