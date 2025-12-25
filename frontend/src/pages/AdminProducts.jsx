import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/index";

// 👇 SMART URL HELPER
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  return `https://flyem-backend.onrender.com${imagePath}`;
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- BULK ACTION STATE ---
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDate, setBulkDate] = useState("");
  const [processing, setProcessing] = useState(false);

  // Fetch Products
  const fetchProducts = async () => {
    try {
      const data = await api.request("/products");
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // Checkbox Logic
  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p._id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // --- BULK UPDATE FUNCTION ---
  const handleBulkTimer = async (clear = false) => {
    if (selectedIds.length === 0) return alert("Select products first!");
    if (!clear && !bulkDate) return alert("Pick a date first!");

    setProcessing(true);

    try {
      const promises = selectedIds.map(id => 
        // ✅ FIXED: Using object for method and body
        api.request(`/products/${id}`, {
            method: "PUT",
            body: { saleDeadline: clear ? null : bulkDate }
        })
      );

      await Promise.all(promises);
      
      alert(clear ? "Timers Removed!" : "Sale Timers Set!");
      setSelectedIds([]); 
      setBulkDate("");
      fetchProducts(); 

    } catch (error) {
      alert("Failed to update some products.");
    } finally {
      setProcessing(false);
    }
  };

  // Delete Logic
  const handleDelete = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        // ✅ FIXED: Using object for DELETE method
        await api.request(`/products/${id}`, { 
            method: "DELETE" 
        });
        setProducts(products.filter((p) => p._id !== id));
        alert("Product deleted successfully.");
      } catch (error) {
        alert("Failed to delete. Are you Admin?");
      }
    }
  };

  if (loading) return <div className="p-20 text-center uppercase font-bold tracking-widest">Loading Inventory...</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Inventory ({products.length})</h1>
        <Link 
            to="/admin/add" 
            className="bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-gray-800 transition-colors"
        >
            + Add New Product
        </Link>
      </div>

      {/* --- BULK ACTION TOOLBAR --- */}
      <div className="bg-blue-50 border border-blue-100 p-4 mb-8 flex flex-wrap items-center gap-4 rounded">
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase text-blue-800">Set Sale Timer:</span>
            <input 
                type="datetime-local" 
                value={bulkDate} 
                onChange={(e)=>setBulkDate(e.target.value)} 
                className="border p-2 text-sm bg-white rounded"
            />
        </div>
        
        <div className="flex gap-2">
            <button 
                onClick={() => handleBulkTimer(false)}
                disabled={processing || selectedIds.length === 0}
                className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
                {processing ? "Updating..." : `Apply to Selected (${selectedIds.length})`}
            </button>
            
            <button 
                onClick={() => handleBulkTimer(true)}
                disabled={processing || selectedIds.length === 0}
                className="bg-white border border-red-200 text-red-500 px-4 py-2 text-xs font-bold uppercase rounded hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
                Clear Timers
            </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 uppercase text-xs text-gray-500 font-bold">
            <tr>
              <th className="px-6 py-4">
                  <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === products.length && products.length > 0} />
              </th>
              <th className="px-6 py-4">Image</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Color</th> {/* 👈 NEW COLUMN */}
              <th className="px-6 py-4">Variations (SKU)</th>
              <th className="px-6 py-4">Sale Ends</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p._id} className={selectedIds.includes(p._id) ? "bg-blue-50" : "hover:bg-gray-50 transition-colors"}>
                <td className="px-6 py-4">
                    <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleSelectOne(p._id)} />
                </td>
                <td className="px-6 py-4">
                  <img src={getImageUrl(p.image)} alt={p.name} className="w-10 h-10 object-cover rounded border border-gray-200 shadow-sm" />
                </td>
                <td className="px-6 py-4 font-bold">{p.name}</td>
                
                {/* 👇 NEW COLOR CELL */}
                <td className="px-6 py-4 text-xs font-bold uppercase text-gray-500">
                    {p.color || "N/A"}
                </td>

                <td className="px-6 py-4">
                    {p.variants && p.variants.length > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {p.variants.length} Sizes
                        </span>
                    ) : (
                        <span className="font-mono text-gray-500 text-xs">{p.sku || "N/A"}</span>
                    )}
                </td>
                
                <td className="px-6 py-4">
                    {p.saleDeadline ? (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                            {new Date(p.saleDeadline).toLocaleDateString()}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-400">-</span>
                    )}
                </td>

                <td className="px-6 py-4 font-medium">₹{p.price}</td>
                <td className="px-6 py-4 text-right space-x-3">
                   <Link to={`/admin/product/${p._id}/edit`} className="text-blue-600 font-bold uppercase text-xs hover:underline">
                      Edit
                   </Link>
                  <button 
                    onClick={() => handleDelete(p._id)}
                    className="text-red-500 font-bold uppercase text-xs hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
            <div className="text-center py-12 text-gray-400">Inventory is empty.</div>
        )}
      </div>
    </div>
  );
}