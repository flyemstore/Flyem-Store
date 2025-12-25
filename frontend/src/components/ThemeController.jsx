import React, { useEffect, useState } from "react";
import api from "../api/index";

export default function ThemeController({ children }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const applyTheme = async () => {
      try {
        // 1. Fetch Settings (Cache Busting to force update)
        const data = await api.request(`/site?t=${Date.now()}`);
        
        // Destructure all sections (Default to empty objects if missing)
        const theme = data.theme || {};
        const typo = data.typography || {};
        const layout = data.layout || {};

        const root = document.documentElement;

        // Helper function
        const setVar = (name, val) => {
            if (val) root.style.setProperty(name, val);
        };

        // 2. Apply Colors
        setVar('--bg-color', theme.backgroundColor || '#ffffff');
        setVar('--text-color', theme.textColor || '#000000');
        setVar('--primary-color', theme.primaryColor || '#000000');
        setVar('--accent-color', theme.accentColor || '#2563eb');
        
        // Smart Border Color (Darker for light mode, lighter for dark mode)
        const bgColor = theme.backgroundColor || '#ffffff';
        const isDark = bgColor.toLowerCase() === '#000000';
        setVar('--border-color', isDark ? '#333333' : 'rgba(0,0,0,0.1)');
        setVar('--muted-color', isDark ? '#888888' : '#9ca3af');

        // 3. Apply Layout (Corner Radius)
        // Check if it has 'px' already or needs it added
        const radius = layout.borderRadius || '0px';
        setVar('--radius', radius);

        // 4. Apply Fonts
        const fontMap = {
            "sans": "system-ui, -apple-system, sans-serif",
            "inter": "'Inter', sans-serif",
            "roboto": "'Roboto', sans-serif",
            "poppins": "'Poppins', sans-serif",
            "playfair": "'Playfair Display', serif",
            "montserrat": "'Montserrat', sans-serif",
            "lato": "'Lato', sans-serif",
            "oswald": "'Oswald', sans-serif",
            "merriweather": "'Merriweather', serif",
            "mono": "'Space Mono', monospace",
            "bebas": "'Bebas Neue', sans-serif"
        };

        const hFont = typo.headingFont || "inter";
        const bFont = typo.bodyFont || "inter";

        setVar('--font-heading', fontMap[hFont] || fontMap["inter"]);
        setVar('--font-body', fontMap[bFont] || fontMap["inter"]);

        // 5. Load Google Fonts
        // Filter out system fonts that don't need loading
        const googleFonts = [hFont, bFont].filter(f => f !== 'sans');
        const uniqueFonts = [...new Set(googleFonts)];
        
        if (uniqueFonts.length > 0) {
            const fontQuery = uniqueFonts.map(f => {
                // Formatting names for Google Fonts API (e.g., "open sans" -> "Open+Sans")
                const name = f === 'playfair' ? 'Playfair+Display' 
                           : f === 'space mono' ? 'Space+Mono'
                           : f === 'bebas' ? 'Bebas+Neue'
                           : f.charAt(0).toUpperCase() + f.slice(1);
                return `family=${name}:wght@300;400;700;900`;
            }).join("&");

            let link = document.getElementById("dynamic-fonts");
            if (!link) {
                link = document.createElement("link");
                link.id = "dynamic-fonts";
                link.rel = "stylesheet";
                document.head.appendChild(link);
            }
            link.href = `https://fonts.googleapis.com/css2?${fontQuery}&display=swap`;
        }

      } catch (error) {
        console.error("Theme Load Error:", error);
      } finally {
        setLoaded(true);
      }
    };

    applyTheme();
  }, []);

  // Prevent flash of unstyled content
  if (!loaded) return <div className="min-h-screen bg-white"></div>;

  return <>{children}</>;
}