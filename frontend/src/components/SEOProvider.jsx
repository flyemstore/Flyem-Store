import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import api from "../api/index";

export default function SEOProvider({ children }) {
  const [seo, setSeo] = useState(null); // Start as null to detect loading

  useEffect(() => {
    // ?t=... forces a fresh fetch from the server
    api.request(`/site?t=${Date.now()}`).then(data => {
        console.log("📢 SEO DATA RECEIVED FROM BACKEND:", data); // Check Console for this!
        
        if (data) {
            setSeo({
                title: data.seo?.metaTitle || data.identity?.name || "FLYEM",
                description: data.seo?.metaDescription || "Official Store",
                favicon: data.identity?.favicon || "",
                image: data.seo?.ogImage || ""
            });
        }
    }).catch(err => console.error("SEO Error:", err));
  }, []);

  // If loading, render children but don't mess with Head yet
  if (!seo) return <HelmetProvider>{children}</HelmetProvider>;

  return (
    <HelmetProvider>
      <Helmet>
        <title>{seo.title}</title>
        <meta name="description" content={seo.description} />
        {seo.favicon && <link rel="icon" type="image/png" href={seo.favicon} />}
        
        {/* Social Tags */}
        <meta property="og:title" content={seo.title} />
        <meta property="og:description" content={seo.description} />
        {seo.image && <meta property="og:image" content={seo.image} />}
      </Helmet>
      {children}
    </HelmetProvider>
  );
}