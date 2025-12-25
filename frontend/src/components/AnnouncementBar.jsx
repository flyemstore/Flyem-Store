import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/index";

export default function AnnouncementBar() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We add ?t=Date.now() to ensure we get the latest saved setting immediately
    api.request(`/site?t=${Date.now()}`)
       .then(res => {
          // Safety check: ensure the object exists
          const bar = res.header?.announcementBar || {};
          setData(bar);
       })
       .catch(err => console.error(err))
       .finally(() => setLoading(false));
  }, []);

  // If loading, or data missing, or "show" is false -> Hide it
  if (loading || !data || !data.show) return null;

  return (
    <div 
        className="w-full py-2 px-4 text-center text-xs font-bold uppercase tracking-widest z-[60] relative transition-colors duration-300"
        style={{ 
            backgroundColor: data.backgroundColor || "#000000", 
            color: data.textColor || "#ffffff" 
        }}
    >
      {/* Render Link if URL exists, otherwise just text */}
      {data.link ? (
          <Link to={data.link} className="hover:underline block w-full h-full">
              {data.text}
          </Link>
      ) : (
          <span>{data.text}</span>
      )}
    </div>
  );
}