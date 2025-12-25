import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/index'; 

// 👇 1. ADD IMAGE HELPER
const getImageUrl = (imagePath) => {
  if (!imagePath) return ""; 
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  return `https://flyem-backend.onrender.com${imagePath}`;
};

const OrderScreen = () => {
  const { id } = useParams(); 
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.request(`/orders/${id}`);
        // Handle both wrapper styles (direct object or { data })
        setOrder(response.data || response); 
        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to load order");
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-20 text-center text-xl font-bold uppercase">Loading Order...</div>;
  if (error) return <div className="p-20 text-center text-red-500 font-bold uppercase">Error: {error}</div>;
  if (!order) return <div className="p-20 text-center font-bold uppercase">Order not found</div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 animate-fade-up min-h-screen">
      
      {/* HEADER */}
      <div className="bg-gray-50 border border-gray-200 p-8 mb-12 text-center">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-2">Order Confirmed</h1>
        <p className="text-gray-500 font-mono text-sm">ID: {order._id}</p>
        
        {order.qikink_order_id && (
             <div className="mt-4 inline-block bg-black text-white px-4 py-1 text-xs font-bold uppercase tracking-widest">
               Status: {order.qikink_status || "Processing"}
             </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
        
        {/* LEFT: Shipping Info */}
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-6 border-b border-black pb-2">Shipping To</h2>
          <div className="text-sm leading-relaxed text-gray-800">
            <p className="font-bold">{order.shippingAddress.address}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            <p className="mt-4 text-gray-500">{order.user?.email || order.shippingAddress.email}</p>
            <p className="text-gray-500">{order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* RIGHT: Items */}
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wider mb-6 border-b border-black pb-2">Your Items</h2>
          <div className="space-y-6">
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex gap-4">
                {/* 👇 2. USE IMAGE HELPER HERE */}
                <div className="w-16 h-20 bg-gray-200 overflow-hidden flex-shrink-0">
                    <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div>
                   <p className="font-bold uppercase text-sm">{item.name}</p>
                   <p className="text-xs text-gray-500 mt-1">
                     {/* 👇 3. CLEANER SIZE DISPLAY */}
                     Size: <b className="text-black">{item.size}</b> | Qty: {item.quantity}
                   </p>
                   <p className="font-bold text-sm mt-1">₹{item.price * item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
            <span className="text-sm uppercase tracking-widest text-gray-500">Total Paid</span>
            <span className="text-2xl font-black tracking-tighter">₹{order.totalPrice}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <Link to="/" className="inline-block bg-black text-white px-10 py-4 uppercase font-bold tracking-widest hover:bg-gray-800 transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderScreen;