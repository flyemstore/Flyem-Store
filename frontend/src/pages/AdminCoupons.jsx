import React, { useEffect, useState } from "react";
import api from "../api/index";
import { format } from 'date-fns';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: 0, expirationDate: '', usageLimit: 1000 });
  const [error, setError] = useState(null);

  // --- FETCHING LOGIC ---
  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.request("/coupons");
      setCoupons(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FORM HANDLING ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue || !form.expirationDate) {
        setError("Please fill in all required fields.");
        return;
    }
    
    // Convert to proper types for API
    const dataToSend = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: Number(form.minOrderAmount),
        usageLimit: Number(form.usageLimit),
        // Expiration date needs to be sent in UTC format
        expirationDate: new Date(form.expirationDate).toISOString() 
    };

    try {
      const newCoupon = await api.request("/coupons", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      alert(`Coupon ${newCoupon.code} created successfully!`);
      setForm({ code: '', discountType: 'percentage', discountValue: '', minOrderAmount: 0, expirationDate: '', usageLimit: 1000 });
      fetchCoupons(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  // --- DELETION LOGIC ---
  const handleDelete = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete coupon ${code}?`)) {
        try {
            await api.request(`/coupons/${id}`, { method: 'DELETE' });
            fetchCoupons(); // Refresh list
        } catch (err) {
            alert("Failed to delete coupon.");
        }
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Coupons...</div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">🎟️ Coupon Manager</h1>

      {/* --- 1. CREATE NEW COUPON FORM --- */}
      <div className="bg-white p-6 border border-gray-200 shadow-lg mb-10">
        <h2 className="text-xl font-bold border-b pb-2 mb-4">Create New Coupon</h2>
        
        {error && <div className="bg-red-50 text-red-700 p-3 mb-4 border border-red-200">{error}</div>}

        <form onSubmit={handleCreateCoupon} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            <div><label className="text-xs font-bold uppercase block mb-1">Code (E.g., WELCOME10)</label><input type="text" name="code" value={form.code} onChange={handleFormChange} placeholder="NEWCODE10" required className="w-full border p-2 uppercase" /></div>
            
            <div><label className="text-xs font-bold uppercase block mb-1">Type</label><select name="discountType" value={form.discountType} onChange={handleFormChange} className="w-full border p-2">
                <option value="percentage">% Percentage</option>
                <option value="fixed">₹ Fixed Amount</option>
            </select></div>
            
            <div><label className="text-xs font-bold uppercase block mb-1">Value (10 or 500)</label><input type="number" name="discountValue" value={form.discountValue} onChange={handleFormChange} required min="1" className="w-full border p-2" /></div>
            
            <div><label className="text-xs font-bold uppercase block mb-1">Expiration Date</label><input type="date" name="expirationDate" value={form.expirationDate} onChange={handleFormChange} required className="w-full border p-2" /></div>

            <div><label className="text-xs font-bold uppercase block mb-1">Min Order Amount (₹)</label><input type="number" name="minOrderAmount" value={form.minOrderAmount} onChange={handleFormChange} min="0" className="w-full border p-2" /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div><label className="text-xs font-bold uppercase block mb-1">Usage Limit</label><input type="number" name="usageLimit" value={form.usageLimit} onChange={handleFormChange} min="1" className="w-full border p-2" /></div>
            <div className="col-span-2 flex items-end">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 font-bold uppercase hover:bg-blue-700 transition-colors">Create Coupon</button>
            </div>
          </div>
        </form>
      </div>

      {/* --- 2. COUPON LIST --- */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 border-b uppercase text-xs font-bold text-gray-500">
            <tr>
              <th className="px-6 py-3">Code</th>
              <th className="px-6 py-3">Discount</th>
              <th className="px-6 py-3">Min Order</th>
              <th className="px-6 py-3">Expires</th>
              <th className="px-6 py-3">Usage</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((coupon) => (
              <tr key={coupon._id} className="hover:bg-gray-50">
                <td className={`px-6 py-4 font-bold ${!coupon.isActive ? 'text-gray-400 line-through' : ''}`}>
                    {coupon.code}
                </td>
                <td className="px-6 py-4 font-bold">
                    {coupon.discountValue} {coupon.discountType === 'percentage' ? '%' : '₹'} OFF
                </td>
                <td className="px-6 py-4">₹{coupon.minOrderAmount}</td>
                <td className="px-6 py-4 text-xs">{format(new Date(coupon.expirationDate), 'MMM d, yyyy')}</td>
                <td className="px-6 py-4 text-xs">{coupon.usedCount} / {coupon.usageLimit}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleDelete(coupon._id, coupon.code)} className="text-red-500 hover:text-red-700 text-xs font-bold uppercase">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {coupons.length === 0 && <div className="p-10 text-center text-gray-400">No coupons created yet.</div>}
      </div>
    </div>
  );
}