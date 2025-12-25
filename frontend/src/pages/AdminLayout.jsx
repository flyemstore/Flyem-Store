import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 👇 FIX: Load user from the CORRECT key "userInfo"
  const user = JSON.parse(localStorage.getItem("userInfo") || "{}");
  
  // 2. Helper: Check Permissions
  const canAccess = (requiredRole) => {
      // If user is Admin or Superadmin, they can see EVERYTHING
      if (user.isAdmin || user.role === 'superadmin') return true;
      
      // Otherwise check specific role
      return user.role === requiredRole;
  };

  const handleLogout = () => {
    // 👇 FIX: Remove correct key
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const isActive = (path) => {
      if (path === "/admin") return location.pathname === "/admin";
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const linkClass = (path) => `
      flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase transition-colors rounded
      ${isActive(path) ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'}
  `;

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
            
            <div className="h-20 flex items-center px-6 border-b border-gray-100">
                <Link to="/admin" className="text-2xl font-black tracking-tighter uppercase">Admin Panel</Link>
            </div>

            {/* Scrollable Links Area */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
                
                {/* GROUP: STORE MANAGEMENT */}
                <div>
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 px-4 tracking-wider">Store</h3>
                    <div className="space-y-1">
                        <Link to="/admin" className={linkClass("/admin")}>📊 Dashboard</Link>
                        
                        {/* 👇 ALWAYS SHOW THESE FOR ADMINS */}
                        {(user.isAdmin || canAccess('orders')) && (
                            <Link to="/admin/orders" className={linkClass("/admin/orders")}>📦 Orders</Link>
                        )}

                        {(user.isAdmin || canAccess('catalog')) && (
                            <>
                                <Link to="/admin/products" className={linkClass("/admin/products")}>👕 Products</Link>
                                <Link to="/admin/add" className={linkClass("/admin/add")}>➕ Add Product</Link>
                            </>
                        )}

                        {(user.isAdmin || canAccess('marketing')) && (
                            <Link to="/admin/coupons" className={linkClass("/admin/coupons")}>🎟️ Coupons</Link>
                        )}
                    </div>
                </div>

                {/* GROUP: DESIGN */}
                {(user.isAdmin || canAccess('content')) && (
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 px-4 tracking-wider">Design</h3>
                        <div className="space-y-1">
                            <Link to="/admin/global" className={linkClass("/admin/global")}>🌍 Global Settings</Link>
                            <Link to="/admin/header" className={linkClass("/admin/header")}>🧭 Header & Nav</Link>
                            <Link to="/admin/homepage" className={linkClass("/admin/homepage")}>🏠 Homepage</Link>
                            <Link to="/admin/footer" className={linkClass("/admin/footer")}>🦶 Footer</Link>
                            <Link to="/admin/pages" className={linkClass("/admin/pages")}>📄 Custom Pages</Link>
                            <Link to="/admin/media" className={linkClass("/admin/media")}>🖼️ Media Gallery</Link>
                            <Link to="/admin/catalog" className={linkClass("/admin/catalog")}>🛍️ Shop Settings</Link>
                        </div>
                    </div>
                )}

                {/* GROUP: MARKETING */}
                {(user.isAdmin || canAccess('marketing')) && (
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 px-4 tracking-wider">Marketing</h3>
                        <div className="space-y-1">
                            <Link to="/admin/popup" className={linkClass("/admin/popup")}>💬 Popups & Alerts</Link>
                        </div>
                    </div>
                )}

                {/* GROUP: SYSTEM (Super Admin Only) */}
                {(user.isAdmin || user.role === 'superadmin') && (
                    <div>
                        <h3 className="text-[10px] font-black uppercase text-gray-400 mb-2 px-4 tracking-wider">System</h3>
                        <div className="space-y-1">
                            <Link to="/admin/users" className={linkClass("/admin/users")}>
                               👥 Team & Users
                            </Link>
                        </div>
                    </div>
                )}

            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-gray-100">
                <div className="mb-4 px-4">
                    <p className="text-xs font-bold text-gray-400 uppercase">Logged in as:</p>
                    <p className="text-sm font-bold truncate">{user.name}</p>
                    <p className="text-[10px] text-blue-600 uppercase font-black">{user.role === 'superadmin' || user.isAdmin ? 'Super Admin' : user.role}</p>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase text-red-500 hover:bg-red-50 rounded transition-colors">
                    🚪 Logout
                </button>
            </div>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-64 min-h-screen">
          <div className="md:hidden h-16 bg-white border-b flex items-center justify-between px-4 sticky top-0 z-30">
              <span className="font-bold uppercase">Admin Menu</span>
              <button onClick={() => setMobileMenuOpen(true)} className="text-xl">☰</button>
          </div>
          <div className="p-0">
              <Outlet />
          </div>
      </main>

    </div>
  );
}