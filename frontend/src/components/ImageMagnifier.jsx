import React, { useState } from "react";

export default function ImageMagnifier({ src, alt, isEnabled = true }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  if (!isEnabled) {
    // If zoom is disabled in Admin, just show normal image
    return <img src={src} alt={alt} className="w-full h-full object-cover" />;
  }

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Calculate Mouse Position relative to the image (0 to 1)
    const x = (e.pageX - left) / width;
    const y = (e.pageY - top) / height; // Note: pageY accounts for scroll
    
    // Calculate cursor position for the lens (optional visual aid)
    setCursorPosition({ x: e.pageX - left, y: e.pageY - top });

    setPosition({ x, y });
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden cursor-crosshair"
      onMouseEnter={() => setShowZoom(true)}
      onMouseLeave={() => setShowZoom(false)}
      onMouseMove={handleMouseMove}
    >
      {/* ORIGINAL IMAGE (Visible when not hovering) */}
      <img 
        src={src} 
        alt={alt} 
        className="w-full h-full object-cover pointer-events-none"
        style={{ opacity: showZoom ? 0 : 1, transition: 'opacity 0.2s' }} 
      />

      {/* ZOOMED IMAGE (Visible on hover) */}
      {showZoom && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('${src}')`,
            backgroundPosition: `${position.x * 100}% ${position.y * 100}%`,
            backgroundSize: "250%", // 2.5x Zoom Level (Adjustable)
            backgroundRepeat: "no-repeat"
          }}
        />
      )}
    </div>
  );
}