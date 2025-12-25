import React, { useEffect, useState } from "react";
import api from "../api/index";
import { format } from "date-fns";
import OrderModal from "../components/OrderModal";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.request("/orders"); 
      setOrders(data);
    } catch (err) {
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
        await api.request(`/orders/${orderId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        alert(`Order updated to ${newStatus}`);
        setSelectedOrder(null); 
        fetchOrders(); 
    } catch (err) {
        alert("Failed to update status");
    }
  };

  const getUserName = (order) => {
      if (order.user && order.user.name) return order.user.name;
      if (order.customerName) return order.customerName;
      return "Guest / Deleted User";
  };

  // 👇 UPDATED: NOW INCLUDES SIZE IN CSV
  const exportToCSV = () => {
    if (orders.length === 0) {
        alert("No orders to export!");
        return;
    }
    const headers = ["Order ID", "Date", "Customer Name", "Email", "Phone", "Items (Size)", "Total Price", "Payment Status", "Order Status", "Payment Method", "Address", "Qikink ID"];
    
    const rows = orders.map(order => {
        const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A";
        const name = getUserName(order);
        const email = order.user?.email || order.customerEmail || "N/A";
        const phone = order.shippingAddress?.phone || "N/A";
        
        // ✅ FIX: Added 'i.size' here so you know what to ship
        const items = order.orderItems.map(i => `${i.name} [${i.size}] (x${i.quantity})`).join("; ");
        
        const address = `"${order.shippingAddress?.address || ''}, ${order.shippingAddress?.city || ''}"`; 
        const isPaid = order.isPaid ? "PAID" : "UNPAID";
        const qikinkId = order.qikink_order_id || "N/A";

        return [order._id, date, name, email, phone, items, order.totalPrice, isPaid, order.status, order.paymentMethod, address, qikinkId].join(",");
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Orders...</div>;
  if (error) return <div className="p-10 text-center text-red-500 font-bold">Error: {error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black uppercase">Order Management</h1>
          <button 
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold uppercase px-6 py-3 rounded shadow-md flex items-center gap-2 transition-colors"
          >
            📊 Download Excel
          </button>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 border-b uppercase text-xs font-bold text-gray-500">
            <tr>
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Items</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">
                    {order._id.slice(-6).toUpperCase()}
                    {/* Show Qikink Icon if synced */}
                    {order.qikink_order_id && <span className="block text-[9px] text-blue-600 mt-1">Synced ✅</span>}
                </td>
                <td className="px-6 py-4">{order.createdAt ? format(new Date(order.createdAt), "MMM d, yyyy") : "N/A"}</td>
                <td className="px-6 py-4 font-bold">
                    {getUserName(order)}
                    <div className="text-xs font-normal text-gray-400">{order.user?.email || order.customerEmail || "No Email"}</div>
                </td>
                <td className="px-6 py-4 text-xs text-gray-500">
                    <span className="font-bold">{order.orderItems.length} Items</span>
                    {/* ✅ FIX: Display Item Name AND Size */}
                    <div className="truncate max-w-[150px] italic">
                        {order.orderItems[0]?.name} <b className="text-black">({order.orderItems[0]?.size})</b>
                    </div>
                </td>
                <td className="px-6 py-4 font-bold">₹{order.totalPrice}</td>
                <td className="px-6 py-4">
                    {order.isPaid ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-green-200">Paid</span>
                    ) : (
                        <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-bold uppercase border border-red-200">Unpaid</span>
                    )}
                    <div className="text-[10px] text-gray-400 mt-1">{order.paymentMethod || "Unknown"}</div>
                </td>
                <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase 
                        ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 
                          order.status.includes('Delivered') ? 'bg-green-100 text-green-600' : 
                          'bg-blue-100 text-blue-600'}`}>
                        {order.status}
                      </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:underline font-bold text-xs uppercase">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="p-10 text-center text-gray-400">No orders found.</div>}
      </div>

      {selectedOrder && (
        <OrderModal 
            order={selectedOrder} 
            onClose={() => setSelectedOrder(null)} 
            onUpdateStatus={handleUpdateStatus} 
        />
      )}
    </div>
  );
}