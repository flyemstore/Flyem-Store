import React from "react";

// 👇 Update props to accept 'customChart'
export default function SizeChart({ isOpen, onClose, customChart }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      {/* Increased max-width slightly to accommodate images better */}
      <div className="bg-white max-w-2xl w-full p-8 shadow-2xl relative animate-in fade-in zoom-in duration-300 rounded-lg">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 text-center">
          Size Guide {customChart ? "" : "(Inches)"}
        </h3>

        <div className="overflow-x-auto flex justify-center">
          {/* 👇 LOGIC: If customChart exists, show Image. Else, show Table. */}
          {customChart ? (
            <img 
              src={customChart} 
              alt="Size Chart" 
              className="w-full h-auto max-h-[60vh] object-contain rounded-md border border-gray-100" 
            />
          ) : (
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="text-xs text-black uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Chest</th>
                  <th className="px-6 py-3">Length</th>
                  <th className="px-6 py-3">Shoulder</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">S</td>
                  <td className="px-6 py-4">38</td>
                  <td className="px-6 py-4">27</td>
                  <td className="px-6 py-4">17.5</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">M</td>
                  <td className="px-6 py-4">40</td>
                  <td className="px-6 py-4">28</td>
                  <td className="px-6 py-4">18.5</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">L</td>
                  <td className="px-6 py-4">42</td>
                  <td className="px-6 py-4">29</td>
                  <td className="px-6 py-4">19.5</td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">XL</td>
                  <td className="px-6 py-4">44</td>
                  <td className="px-6 py-4">30</td>
                  <td className="px-6 py-4">20.5</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-bold">XXL</td>
                  <td className="px-6 py-4">46</td>
                  <td className="px-6 py-4">31</td>
                  <td className="px-6 py-4">21.5</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
        
        <div className="mt-6 text-xs text-gray-400 text-center uppercase font-bold tracking-wider">
          {customChart 
            ? "* Specific measurement guide for this item." 
            : "* Measurements may vary by +/- 0.5 inches."
          }
        </div>
      </div>
    </div>
  );
}