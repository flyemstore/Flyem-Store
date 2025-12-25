import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useCart } from "../context/CartContext";
import api from "../api/index";
import AnnouncementBar from "./AnnouncementBar";

export default function Navbar() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const [config, setConfig] = useState({
    identity: { name: "FLYEM", logo: "", position: "static", top: 0, left: 0 },
    header: {
      backgroundColor: "",
      textColor: "",
      borderColor: "",
      transparency: false,
      animation: "none",
      layout: "left", // Default layout
    },
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.request(`/site?t=${Date.now()}`).then((data) => {
      const identity = data.identity || {};
      const header = data.header || {};

      setConfig({
        identity: {
          ...identity,
          top: Number(identity.top) || 0,
          left: Number(identity.left) || 0,
        },
        header: header,
      });
    });

    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    window.location.reload();
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const { header, identity } = config;
  const isFree = identity.position === "absolute";

  const baseBg = header.backgroundColor || "var(--bg-color)";
  const baseText = header.textColor || "var(--text-color)";
  const baseBorder = header.borderColor || "var(--border-color)";

  let navHeight = "h-20";
  let navBg = baseBg;
  let navBorder = baseBorder;

  if (header.animation === "shrink") {
    navHeight = scrolled ? "h-14" : "h-20";
  } else if (header.animation === "fade") {
    navBg = scrolled ? "transparent" : baseBg;
    navBorder = scrolled ? "transparent" : baseBorder;
  } else if (header.transparency) {
    navBg = scrolled ? baseBg : `${baseBg}DD`;
  }

  const navStyle = {
    backgroundColor: navBg,
    color: baseText,
    borderColor: navBorder,
    backdropFilter: header.transparency ? "blur(10px)" : "none",
  };

  // Logic for Free Movement vs Standard Center
  const logoStyle = isFree
    ? {
        position: "absolute",
        top: `${identity.top}px`,
        left: `${identity.left}%`,
        transform: identity.left === 50 ? "translateX(-50%)" : "none",
        zIndex: 60,
        whiteSpace: "nowrap",
      }
    : {};

  return (
    <div className="fixed w-full top-0 z-50 flex flex-col transition-all">
      <AnnouncementBar />

      <nav
        className={`w-full transition-all duration-300 border-b flex items-center ${navHeight}`}
        style={navStyle}
      >
        <div
          className={`max-w-7xl mx-auto px-6 w-full relative flex items-center h-full ${
            header.layout === "center" ? "justify-between" : ""
          }`}
        >
          {/* LOGO - Positioned based on Layout Setting */}
          <Link
            to="/"
            className={`font-black uppercase tracking-tighter text-2xl flex items-center gap-2 z-50 hover:opacity-80 transition-opacity ${
              header.layout === "center" && !isFree
                ? "absolute left-1/2 transform -translate-x-1/2"
                : "mr-auto"
            }`}
            style={{ ...logoStyle, fontFamily: "var(--font-heading)" }}
          >
            {identity.logo ? (
              <img
                src={identity.logo}
                alt={identity.name}
                className={`object-contain transition-all duration-300 ${
                  scrolled && header.animation === "shrink"
                    ? "h-6 md:h-8"
                    : "h-8 md:h-10"
                }`}
              />
            ) : (
              <span style={{ color: baseText }}>{identity.name}</span>
            )}
          </Link>

          {/* DESKTOP MENU - Balanced for Center Layout */}
          <div
            className={`hidden md:flex items-center gap-8 z-40 ${
              header.layout === "center"
                ? "flex-1" // Allows menu to sit on the left while logo is centered
                : "absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
            }`}
          >
            {header.menu && header.menu.length > 0 ? (
              header.menu.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url}
                  className="text-sm font-bold uppercase hover-underline hover:opacity-70 transition-all duration-300"
                  style={{
                    color: item.color || baseText,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  to="/"
                  className="text-sm font-bold uppercase hover-underline"
                  style={{ color: baseText }}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="text-sm font-bold uppercase hover-underline"
                  style={{ color: baseText }}
                >
                  Shop
                </Link>
              </>
            )}
          </div>

          {/* ICONS - Pushed to right */}
          <div className="flex items-center gap-6 ml-auto z-50">
            {userInfo && userInfo.isAdmin && (
              <Link
                to="/admin"
                className="text-xs font-bold uppercase bg-black text-white px-2 py-1 rounded hidden md:block hover:scale-105 transition-transform"
              >
                Admin
              </Link>
            )}

            {userInfo ? (
              <div className="relative group">
                <Link
                  to="/profile"
                  className="text-xl hover:scale-110 transition-transform block"
                  style={{ color: baseText }}
                >
                  👤
                </Link>
                <div className="absolute right-0 pt-2 w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
                  <div className="bg-white border border-gray-200 shadow-xl rounded overflow-hidden">
                    <Link
                      to="/profile"
                      className="block px-4 py-3 text-xs font-bold uppercase hover:bg-gray-50 text-black"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-xs font-bold uppercase hover:bg-red-50 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-bold uppercase hover:opacity-70 transition-opacity"
                style={{ color: baseText }}
              >
                Login
              </Link>
            )}

            <Link
              to="/cart"
              className="relative text-xl hover:scale-110 transition-transform"
              style={{ color: baseText }}
            >
              🛒
              {cartCount > 0 && (
                <span
                  className="absolute -top-2 -right-2 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-bounce"
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--bg-color)",
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-xl hover:scale-110 transition-transform"
              style={{ color: baseText }}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div
            className="md:hidden border-b px-6 py-6 space-y-6 shadow-xl absolute w-full left-0 top-full z-40 animate-slide-down"
            style={{ backgroundColor: baseBg, borderColor: baseBorder }}
          >
            {header.menu && header.menu.length > 0 ? (
              header.menu.map((item, idx) => (
                <Link
                  key={idx}
                  to={item.url}
                  className="block text-xl font-bold uppercase hover:pl-2 transition-all"
                  style={{ color: item.color || baseText }}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))
            ) : (
              <>
                <Link
                  to="/"
                  className="block text-xl font-bold uppercase hover:pl-2 transition-all"
                  style={{ color: baseText }}
                  onClick={() => setMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="block text-xl font-bold uppercase hover:pl-2 transition-all"
                  style={{ color: baseText }}
                  onClick={() => setMenuOpen(false)}
                >
                  Shop
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </div>
  );
}