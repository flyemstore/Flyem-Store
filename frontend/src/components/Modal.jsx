import React from "react";

export default function Modal({ isOpen, onClose, title, message, actionLabel, onAction, isDanger }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white max-w-sm w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <h3 className={`text-2xl font-black uppercase tracking-tighter mb-4 ${isDanger ? 'text-red-600' : 'text-black'}`}>
          {title}
        </h3>
        
        {/* Body */}
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          {message}
        </p>

        {/* Footer / Buttons */}
        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 border border-gray-200 py-3 font-bold uppercase text-xs tracking-wider hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onAction}
            className={`flex-1 py-3 font-bold uppercase text-xs tracking-wider text-white transition-colors
              ${isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-900'}
            `}
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
}