import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/index";

export default function AdminPages() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPages = async () => {
    try {
      const data = await api.request("/pages");
      setPages(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this page?")) return;
    try {
      await api.request(`/pages/${id}`, { method: "DELETE" });
      setPages(pages.filter((p) => p._id !== id));
    } catch (error) {
      alert("Failed to delete page");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">Pages CMS</h1>
        <Link to="/admin/pages/new" className="bg-black text-white px-6 py-3 font-bold uppercase text-sm hover:bg-gray-800 transition-colors">
          + Create New Page
        </Link>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="bg-white border border-gray-200 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold uppercase text-gray-500">
                <th className="p-4">Title</th>
                <th className="p-4">URL Slug</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold">{page.title}</td>
                  <td className="p-4 text-sm text-gray-500">/{page.slug}</td>
                  <td className="p-4">
                    {page.isVisible ? (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase">Published</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded uppercase">Draft</span>
                    )}
                  </td>
                  <td className="p-4 text-right space-x-4">
                    <Link to={`/admin/pages/edit/${page.slug}`} className="text-blue-600 font-bold text-xs uppercase hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(page._id)} className="text-red-500 font-bold text-xs uppercase hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">No pages found. Create one!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}