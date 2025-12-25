import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // To get the slug from URL
import api from "../api/index";

export default function PageViewer() {
  const { slug } = useParams(); // Get "contact-us" from the URL
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      try {
        setLoading(true);
        // We assume your backend has a route like GET /api/pages/:slug
        const data = await api.request(`/pages/${slug}`);
        setPage(data);
      } catch (error) {
        console.error("Page not found:", error);
        setPage(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-400 uppercase tracking-widest text-sm font-bold">Loading Page...</p>
      </div>
    );
  }

  // If page doesn't exist in DB, show a simple 404 message (or generic 404 component)
  if (!page) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-4xl font-black uppercase mb-4">404</h1>
        <p className="text-gray-500 mb-6">We couldn't find the page "{slug}".</p>
        <button onClick={() => navigate("/")} className="bg-black text-white px-6 py-3 uppercase text-xs font-bold rounded">
          Back Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
        {/* Render the Page Content */}
        <div className="max-w-4xl mx-auto px-6 py-20">
            <h1 className="text-4xl md:text-5xl font-black uppercase mb-8">{page.title}</h1>
            
            {/* Render HTML Content safely */}
            <div 
              className="prose max-w-none text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: page.content }} 
            />
        </div>
    </div>
  );
}