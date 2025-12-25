import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/index";

// 👇 1. ADD IMAGE HELPER
const getImageUrl = (imagePath) => {
  if (!imagePath) return ""; 
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  return `https://flyem-backend.onrender.com${imagePath}`;
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.request("/orders/myorders"); // Matches backend route
        setOrders(data);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center font-bold uppercase tracking-wider">Loading Orders...</div>;

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">No Orders Yet</h2>
        <p className="text-gray-500 mb-8">You haven't purchased any gear yet.</p>
        <Link 
          to="/products" 
          className="bg-black text-white px-8 py-4 font-bold uppercase text-sm hover:scale-105 transition-transform"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            
            {/* HEADER: ID, Date, Total, Status */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-gray-100 gap-4">
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Order ID</p>
                  <p className="font-mono text-sm font-bold">#{order._id.slice(-6).toUpperCase()}</p>
               </div>
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Date</p>
                  <p className="text-sm font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
               </div>
               <div>
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Total Amount</p>
                  <p className="text-sm font-black">₹{order.totalPrice}</p>
               </div>
               <div>
                  <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase 
                    ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                      order.status.includes('Delivered') ? 'bg-green-100 text-green-600' : 
                      'bg-blue-100 text-blue-600'}`}>
                    {order.status}
                  </span>
               </div>
               <Link 
                 to={`/order/${order._id}`} 
                 className="hidden md:block bg-gray-900 text-white px-4 py-2 text-xs font-bold uppercase rounded hover:bg-black transition-colors"
               >
                 View Details
               </Link>
            </div>

            {/* BODY: Items List */}
            <div className="space-y-4">
                {order.orderItems.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                        <div className="w-16 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0 border border-gray-200">
                             {/* 👇 2. USE IMAGE HELPER */}
                             <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-sm uppercase">{item.name}</h4>
                            <div className="flex gap-4 mt-1 text-xs text-gray-500">
                                {/* 👇 3. DISPLAY SIZE HERE */}
                                <p>Size: <b className="text-black">{item.size}</b></p>
                                <p>Qty: {item.quantity}</p>
                            </div>
                        </div>
                        <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                    </div>
                ))}
            </div>
            
            {/* MOBILE ONLY BUTTON */}
            <div className="mt-6 md:hidden">
                <Link 
                 to={`/order/${order._id}`} 
                 className="block w-full text-center bg-gray-100 text-black border border-gray-300 px-4 py-3 text-xs font-bold uppercase rounded hover:bg-gray-200"
               >
                 View Full Order
               </Link>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}