import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/index";
import { format } from "date-fns"; 

export default function Profile() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // --- 1. Load User & Orders ---
  useEffect(() => {
    // 👇 FIX: Change 'flyem_user' to 'userInfo'
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));
    
    if (!savedUser) {
        navigate("/login");
        return;
    }
    setUser(savedUser);
    fetchOrders();
  }, [navigate]);

  const fetchOrders = async () => {
    try {
      const data = await api.request("/orders/myorders");
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // --- 2. Action Handlers ---
  const handleLogout = () => {
    // 👇 FIX: Remove correct key 'userInfo'
    localStorage.removeItem("userInfo");
    localStorage.removeItem("flyem_cart");
    // Reload page to clear Redux state automatically
    window.location.href = "/login";
  };

  const handleDeleteAccount = () => {
    if(!window.confirm("Are you sure? This cannot be undone.")) return;
    alert("Please contact support to delete account for security reasons.");
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
        await api.request(`/orders/${orderId}/cancel`, { method: "PUT" });
        alert("Order Cancelled Successfully");
        fetchOrders(); 
    } catch (error) {
        alert(error.message || "Failed to cancel order");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center uppercase tracking-widest">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex justify-between items-end mb-12">
        <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">My Account</h1>
            <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.name}</p>
        </div>
        <button onClick={handleLogout} className="text-xs font-bold uppercase underline hover:opacity-60">Log Out</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* PROFILE CARD */}
        <div className="md:col-span-1 card-base text-center h-fit p-8 border border-gray-200 rounded-lg">
            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-6 uppercase">
                {user?.name?.[0] || "U"}
            </div>
            <h2 className="text-xl font-bold uppercase mb-1">{user?.name}</h2>
            <p className="text-sm opacity-60 mb-6">{user?.email}</p>
            
            {user?.isAdmin && (
                <span className="bg-black text-white text-[10px] font-bold px-3 py-1 uppercase rounded">Admin</span>
            )}

            <div className="mt-12 pt-8 border-t border-gray-100">
                <button onClick={handleDeleteAccount} className="text-red-500 text-xs font-bold uppercase hover:underline">Delete Account</button>
            </div>
        </div>

        {/* ORDER HISTORY */}
        <div className="md:col-span-2">
            <h2 className="font-bold uppercase mb-6 tracking-wide border-b border-gray-200 pb-2">Order History</h2>
            
            <div className="space-y-6">
                {orders.length === 0 && (
                    <div className="opacity-50 italic py-10 text-center bg-gray-50 rounded">No orders found.</div>
                )}

                {orders.map(order => (
                    <div key={order._id} className="card-base p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                        
                        {/* Order Header */}
                        <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
                            <div className="flex gap-6 text-xs font-bold uppercase opacity-60">
                                <div>
                                    <span className="block text-[10px] text-gray-400">Placed On</span>
                                    <span>{format(new Date(order.createdAt), "MMM d, yyyy")}</span>
                                </div>
                                <div>
                                    <span className="block text-[10px] text-gray-400">Order #</span>
                                    <span>{order._id.slice(-6).toUpperCase()}</span>
                                </div>
                            </div>
                            
                            {/* STATUS BADGE */}
                            <div>
                                <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase 
                                    ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                                      order.status.includes('Delivered') ? 'bg-green-100 text-green-600' : 
                                      'bg-blue-100 text-blue-600'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                        
                        {/* Order Items */}
                        <div className="mb-4 space-y-3">
                            {order.orderItems.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-gray-400">x{item.quantity}</span>
                                        <span className="font-bold uppercase">{item.name}</span>
                                    </div>
                                    <span className="font-mono">₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        {/* Footer: Totals & Actions */}
                        <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                             {/* Left: Discount Info */}
                             <div className="text-xs">
                                {order.couponCode && (
                                    <p className="text-green-600 font-bold mb-1">
                                        🏷️ {order.couponCode} applied (-₹{order.discountAmount})
                                    </p>
                                )}
                                <p className="text-gray-400">Payment: {order.paymentMethod}</p>
                             </div>

                             {/* Right: Total & Cancel */}
                             <div className="text-right">
                                <div className="text-xl font-black mb-2">₹{order.totalPrice}</div>
                                
                                {(order.status.includes("Processing") || order.status.includes("Pending")) && (
                                    <button 
                                        onClick={() => handleCancelOrder(order._id)}
                                        className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                                    >
                                        Cancel Order
                                    </button>
                                )}
                             </div>
                        </div>

                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}