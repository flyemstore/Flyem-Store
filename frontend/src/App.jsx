import React from "react";
import { Routes, Route, Outlet, useLocation, Navigate } from "react-router-dom"; 
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import ThemeController from "./components/ThemeController";
import NewsletterPopup from "./components/NewsletterPopup";
import LegalPages from "./pages/LegalPages";

// Public Pages
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ThankYou from "./pages/ThankYou";
import PageViewer from "./pages/PageViewer";
import VerifyEmail from "./pages/VerifyEmail"; 
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Order History
import OrderScreen from "./pages/OrderScreen"; 

// Admin Pages
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProduct from "./pages/AdminAddProduct";
import AdminProducts from "./pages/AdminProducts";
import AdminCoupons from "./pages/AdminCoupons";
import AdminGlobalSettings from "./pages/AdminGlobalSettings";
import AdminHeaderSettings from "./pages/AdminHeaderSettings";
import AdminFooterSettings from "./pages/AdminFooterSettings";
import AdminHomepage from "./pages/AdminHomepage";
import AdminPages from "./pages/AdminPages";
import AdminProductSettings from "./pages/AdminProductSettings";
import AdminThemeSettings from "./pages/AdminThemeSettings";
import AdminMedia from "./pages/AdminMedia";
import AdminOrders from "./pages/AdminOrders";
import AdminPageEditor from "./pages/AdminPageEditor";
import AdminPopupSettings from "./pages/AdminPopupSettings";
import AdminUsers from "./pages/AdminUsers"; 
import AdminCatalog from "./pages/AdminCatalog";
import AdminProductEdit from "./pages/AdminProductEdit";

// 👇 FIX: Relaxed Security Check (Supports Cookie-based Auth)
const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("userInfo"));
  
  // Only check if 'user' exists. We don't check 'user.token' 
  // because the token might be hidden in an HTTP-Only Cookie.
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const location = useLocation();
  
  const isCheckout = location.pathname === "/checkout";
  const isAdmin = location.pathname.startsWith("/admin"); 
  const isHomePage = location.pathname === "/";
  const showPublicNav = !isCheckout && !isAdmin;
  const spacingClass = (isHomePage || isAdmin) ? "pt-0" : "pt-32";

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-color)] text-[var(--text-color)] transition-colors duration-300">
      
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route element={
          <ThemeController>
            {showPublicNav && <Navbar />}
            {!isAdmin && <NewsletterPopup />}
            <div className={`flex-grow ${spacingClass}`}>
              <Outlet />
            </div>
            {showPublicNav && <Footer />}
          </ThemeController>
        }>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          
          {/* 👇 PROTECTED CHECKOUT ROUTE */}
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } 
          />
          
          {/* Success Page */}
          <Route path="/thankyou" element={<ThankYou />} />

          {/* Order Details Page */}
          <Route path="/order/:id" element={<OrderScreen />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          
          <Route path="/:slug" element={<PageViewer />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/legal/:type" element={<LegalPages />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<div className="min-h-[50vh] flex items-center justify-center">Page Not Found</div>} />
        </Route>

        {/* --- ADMIN ROUTES --- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="add" element={<AdminAddProduct />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="media" element={<AdminMedia />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="global" element={<AdminGlobalSettings />} />
            <Route path="theme" element={<AdminThemeSettings />} />
            <Route path="homepage" element={<AdminHomepage />} />
            <Route path="header" element={<AdminHeaderSettings />} />
            <Route path="footer" element={<AdminFooterSettings />} />
            <Route path="product-layout" element={<AdminProductSettings />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="pages/new" element={<AdminPageEditor />} />
            <Route path="pages/edit/:slug" element={<AdminPageEditor />} />
            <Route path="popup" element={<AdminPopupSettings />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="catalog" element={<AdminCatalog />} />
            
            {/* Relative path fix for consistency */}
            <Route path="product/:id/edit" element={<AdminProductEdit />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;