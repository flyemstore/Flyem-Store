import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/index";

export default function AdminPageEditor() {
  const { slug } = useParams(); // If we have a slug, we are EDITING
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    isVisible: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      // Load existing page data
      api.request(`/pages/${slug}`).then((data) => {
        setFormData(data);
      }).catch(console.error);
    }
  }, [slug, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Auto-generate slug from title if creating new
  const handleTitleChange = (e) => {
      const val = e.target.value;
      setFormData(prev => ({
          ...prev,
          title: val,
          slug: !isEditMode ? val.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "") : prev.slug
      }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.request("/pages", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      alert("Page Saved Successfully!");
      navigate("/admin/pages");
    } catch (error) {
      alert("Failed to save page. Slug might be duplicate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tight">{isEditMode ? "Edit Page" : "New Page"}</h1>
        <button type="button" onClick={() => navigate("/admin/pages")} className="text-gray-500 font-bold uppercase text-xs underline">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 border border-gray-200 shadow-sm space-y-6">
        
        {/* Title & Slug */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-xs font-bold uppercase mb-2">Page Title</label>
                <input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleTitleChange}
                    className="w-full border p-3 rounded text-sm focus:outline-none focus:border-black"
                    placeholder="e.g. About Us"
                    required 
                />
            </div>
            <div>
                <label className="block text-xs font-bold uppercase mb-2">URL Slug</label>
                <div className="flex items-center">
                    <span className="bg-gray-100 p-3 text-sm text-gray-500 border border-r-0 rounded-l">/pages/</span>
                    <input 
                        name="slug" 
                        value={formData.slug} 
                        onChange={handleChange}
                        className="w-full border p-3 rounded-r text-sm focus:outline-none focus:border-black"
                        placeholder="about-us"
                        required 
                    />
                </div>
            </div>
        </div>

        {/* Visibility Toggle */}
        <div className="flex items-center gap-2">
            <input 
                type="checkbox" 
                name="isVisible" 
                id="isVisible"
                checked={formData.isVisible} 
                onChange={handleChange}
                className="w-4 h-4 accent-black"
            />
            <label htmlFor="isVisible" className="text-sm font-bold uppercase cursor-pointer select-none">Publish Immediately</label>
        </div>

        {/* Content Area */}
        <div>
            <label className="block text-xs font-bold uppercase mb-2">Content (HTML or Text)</label>
            <textarea 
                name="content" 
                value={formData.content} 
                onChange={handleChange}
                rows="15"
                className="w-full border p-4 rounded text-sm font-mono leading-relaxed focus:outline-none focus:border-black"
                placeholder="<p>Write your page content here...</p>"
                required
            />
            <p className="text-[10px] text-gray-400 mt-2">Tip: You can use HTML tags like &lt;h1&gt;, &lt;p&gt;, &lt;b&gt; for formatting.</p>
        </div>

        <button disabled={loading} className="w-full bg-black text-white py-4 font-bold uppercase hover:bg-gray-800 transition-colors">
            {loading ? "Saving..." : "Save Page"}
        </button>

      </form>
    </div>
  );
}