import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/index"; // Import API utility

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  // 1. Core Cart State
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("flyem_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  // 2. Coupon State (NEW)
  const [coupon, setCoupon] = useState(null);
  const [discountPrice, setDiscountPrice] = useState(0);
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  const [couponMessage, setCouponMessage] = useState({ success: null, message: '' });

  // 3. Persist Cart to Local Storage
  useEffect(() => {
    localStorage.setItem("flyem_cart", JSON.stringify(cart));
    // When cart changes (item added/removed), re-validate coupon to check MinOrderAmount
    // Re-check only if a coupon is already applied
    if (coupon) {
        const currentSubtotal = calculateSubtotal(cart);
        // Re-calculate discount based on new cart total
        calculateDiscountedTotal(coupon.code, currentSubtotal); 
    }
  }, [cart]);


  // --- CALCULATION HELPERS ---

  // Calculates subtotal (pre-discount)
  const calculateSubtotal = (items) => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const subtotal = calculateSubtotal(cart); // Use 'subtotal' instead of 'cartTotal' for pre-discount price

  // Calculates final total (subtotal - discount)
  const finalTotal = Math.max(0, subtotal - discountPrice);

  // --- COUPON LOGIC (NEW) ---

  const calculateDiscountedTotal = async (code, currentSubtotal) => {
    if (!code) {
        setCoupon(null);
        setDiscountPrice(0);
        setCouponMessage({ success: true, message: "Coupon removed." });
        return { success: true, message: "Coupon removed." };
    }

    setLoadingCoupon(true);
    try {
        // 1. Validate the code against the API
        const couponData = await api.request("/coupons/validate", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, cartTotal: currentSubtotal })
        });
        
        let discount = 0;
        
        // 2. Calculate the discount based on the type
        if (couponData.discountType === 'percentage') {
            discount = currentSubtotal * (couponData.discountValue / 100);
            // Cap percentage discount at subtotal if necessary, though Math.max in finalTotal handles large discounts
        } else if (couponData.discountType === 'fixed') {
            discount = couponData.discountValue;
        }

        setCoupon(couponData);
        setDiscountPrice(discount);
        
        const successMessage = `Coupon ${couponData.code} applied! Saved ₹${discount.toFixed(2)}`;
        setCouponMessage({ success: true, message: successMessage });
        return { success: true, message: successMessage };

    } catch (error) {
        setCoupon(null);
        setDiscountPrice(0);
        const errorMessage = error.message || "Invalid or expired coupon.";
        setCouponMessage({ success: false, message: errorMessage });
        return { success: false, message: errorMessage };
    } finally {
        setLoadingCoupon(false);
    }
  };


  // --- CART MUTATION FUNCTIONS ---

  const addToCart = (product, size) => {
    // ... existing addToCart logic ...
    setCart((prev) => {
        const productId = product._id || product.id;
        const existing = prev.find((item) => {
          const itemId = item._id || item.id;
          return itemId === productId && item.size === size;
        });
  
        if (existing) {
          return prev.map((item) => {
            const itemId = item._id || item.id;
            return itemId === productId && item.size === size
              ? { ...item, quantity: item.quantity + 1 }
              : item;
          });
        }
        return [...prev, { ...product, size, quantity: 1 }];
    });
  };

  const removeFromCart = (productId, size) => {
    // ... existing removeFromCart logic ...
    setCart((prev) => prev.filter((item) => {
        const itemId = item._id || item.id;
        return !(itemId === productId && item.size === size);
    }));
  };

  const updateQuantity = (productId, size, delta) => {
    // ... existing updateQuantity logic ...
    setCart((prev) => {
        return prev.map((item) => {
          const itemId = item._id || item.id;
          if (itemId === productId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : item;
          }
          return item;
        });
    });
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null); // Clear coupon on cart clear
    setDiscountPrice(0);
    localStorage.removeItem("flyem_cart");
  };


  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        
        // --- Totals ---
        subtotal, // The new pre-discount total
        finalTotal, // The new post-discount total
        cartTotal: finalTotal,
        
        // --- Coupon State & Logic (NEW) ---
        coupon,
        discountPrice,
        loadingCoupon,
        couponMessage,
        calculateDiscountedTotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}