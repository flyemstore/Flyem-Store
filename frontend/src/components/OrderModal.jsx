import React from "react";
import { format } from "date-fns";

// 👇 1. ADD IMAGE HELPER
const getImageUrl = (imagePath) => {
  if (!imagePath) return ""; 
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  return `https://flyem-backend.onrender.com${imagePath}`;
};

export default function OrderModal({ order, onClose, onUpdateStatus }) {
  if (!order) return null;

  // Helper to determine badge color
  const getStatusColor = (s) => {
    if (s === "Cancelled") return "bg-red-100 text-red-600";
    if (s.includes("Delivered")) return "bg-green-100 text-green-600";
    if (s.includes("Shipped")) return "bg-blue-100 text-blue-600";
    return "bg-yellow-100 text-yellow-700";
  };

  // Check if order is locked
  const isCancelled = order.status === "Cancelled";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-up">
        
        {/* HEADER */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Order Details</h2>
            <div className="flex gap-2 items-center">
                <p className="text-xs text-gray-500 font-mono">ID: {order._id}</p>
                {/* Show Qikink ID if present */}
                {order.qikink_order_id && <span className="text-[10px] bg-blue-100 text-blue-600 px-1 rounded font-bold">Qikink: {order.qikink_order_id}</span>}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-black font-bold text-xl">✕</button>
        </div>

        {/* BODY */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {/* STATUS SECTION */}
          <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded border border-gray-100">
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">Current Status</p>
              <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            {/* ACTION BUTTONS */}
            {!isCancelled ? (
              <div className="flex gap-2">
                {/* 1. Mark Shipped */}
                {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                  <button 
                    onClick={() => onUpdateStatus(order._id, 'Shipped')}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase px-4 py-2 rounded shadow transition-colors"
                  >
                    Mark Shipped
                  </button>
                )}
                
                {/* 2. Mark Delivered */}
                {order.status !== 'Delivered' && (
                  <button 
                    onClick={() => onUpdateStatus(order._id, 'Delivered')}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase px-4 py-2 rounded shadow transition-colors"
                  >
                    Mark Delivered
                  </button>
                )}

                {/* 3. Cancel Button */}
                {order.status !== 'Shipped' && order.status !== 'Delivered' && (
                  <button 
                    onClick={() => {
                        if(window.confirm("Are you sure? This will cancel the order immediately.")) {
                            onUpdateStatus(order._id, 'Cancelled');
                        }
                    }}
                    className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold uppercase px-4 py-2 rounded shadow transition-colors border border-red-200"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ) : (
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase opacity-70 border border-red-200 px-3 py-1 rounded bg-red-50">
                    🔒 Order Locked
                </div>
            )}
          </div>

          {/* CUSTOMER & SHIPPING GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div>
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Customer</h3>
                <p className="font-bold">{order.user?.name || order.customerName || "Guest"}</p>
                <p className="text-sm text-gray-600">{order.user?.email || order.customerEmail}</p>
                <p className="text-xs text-gray-400 mt-1">Placed: {order.createdAt ? format(new Date(order.createdAt), "PPP p") : "N/A"}</p>
             </div>
             <div>
                <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Shipping Address</h3>
                <p className="text-sm font-medium">{order.shippingAddress?.address}</p>
                <p className="text-sm text-gray-600">
                  {/* 👇 2. ADDED STATE HERE */}
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.zip}
                </p>
                <p className="text-sm font-bold mt-1">📞 {order.shippingAddress?.phone}</p>
             </div>
          </div>

          {/* ORDER ITEMS TABLE */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-xs font-bold uppercase text-gray-500">Item</th>
                  <th className="p-3 text-xs font-bold uppercase text-gray-500">Size / SKU</th>
                  <th className="p-3 text-xs font-bold uppercase text-gray-500 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.orderItems.map((item, i) => (
                  <tr key={i}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                           {/* 👇 3. USE IMAGE HELPER */}
                           <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover"/>
                        </div>
                        <span className="font-bold">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600">
                      {/* 👇 4. FIXED VARIABLE NAME (size instead of selectedSize) */}
                      <span className="font-bold text-black">{item.size}</span>
                      <div className="text-[10px] text-gray-400 font-mono">SKU: {item.sku || "N/A"}</div>
                    </td>
                    <td className="p-3 font-bold text-right">
                      {item.quantity} x ₹{item.price}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                 <tr>
                    <td colSpan="2" className="p-3 text-right text-xs font-bold uppercase">Total Amount</td>
                    <td className="p-3 text-right font-black text-lg">₹{order.totalPrice}</td>
                 </tr>
              </tfoot>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}