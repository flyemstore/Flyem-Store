import React, { useEffect, useState } from "react";
import api from "../api/index";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(""); // Store error here

  const roles = [
      { value: 'customer', label: 'Customer' },
      { value: 'superadmin', label: '👑 Super Admin' },
      { value: 'catalog', label: '👕 Catalog Manager' },
      { value: 'orders', label: '📦 Order Manager' },
      { value: 'marketing', label: '📢 Marketing' },
      { value: 'content', label: '🎨 Content Editor' },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

 // Replace your existing fetchUsers function with this:

const fetchUsers = async () => {
  try {
      console.log("Fetching users...");
      const data = await api.request("/users");
      console.log("Users loaded:", data);

      // 👇 FIX: Safely handle different data formats
      if (Array.isArray(data)) {
          setUsers(data); // Perfect, it's a list
      } else if (data && Array.isArray(data.users)) {
          setUsers(data.users); // It's wrapped in an object { users: [...] }
      } else {
          console.error("Unexpected data format:", data);
          setUsers([]); // Fallback to empty list to prevent crash
          setErrorMsg("Received invalid data from server.");
      }

  } catch (error) {
      console.error("User Fetch Error:", error);
      setErrorMsg(error.message || "Unknown Error"); 
      setUsers([]); // Ensure users is always an array on error
  } finally { 
      setLoading(false); 
  }
};

  const handleRoleChange = async (userId, newRole) => {
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      try {
          await api.request(`/users/${userId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ role: newRole })
          });
      } catch (error) {
          alert("Failed to update role");
          fetchUsers();
      }
  };

  const handleDelete = async (userId) => {
      if(!window.confirm("Are you sure?")) return;
      try {
          await api.request(`/users/${userId}`, { method: "DELETE" });
          setUsers(prev => prev.filter(u => u._id !== userId));
      } catch (error) { alert("Delete failed"); }
  };

  if(loading) return <div className="p-10 text-center font-bold">Loading...</div>;

  // 🔴 ERROR DISPLAY
  if(errorMsg) return (
    <div className="p-10 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">❌ Error Loading Users</h2>
        <p className="font-mono bg-gray-100 p-4 rounded inline-block text-red-500">
            {errorMsg}
        </p>
        <button onClick={fetchUsers} className="block mx-auto mt-4 px-4 py-2 bg-black text-white rounded">Retry</button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Team & Users</h1>
      <div className="bg-white border border-gray-200 shadow-sm overflow-hidden rounded-lg">
          <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 uppercase text-xs font-bold text-gray-500">
                  <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-bold">
                              {user.name} <br/>
                              <span className="text-xs font-normal text-gray-400">{user.email}</span>
                          </td>
                          <td className="px-6 py-4">
                              <select 
                                value={user.role || 'customer'} 
                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                className="border rounded px-2 py-1 text-xs font-bold uppercase"
                              >
                                  {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                              </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                              <button onClick={() => handleDelete(user._id)} className="text-red-500 text-xs font-bold uppercase">Remove</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
    </div>
  );
}