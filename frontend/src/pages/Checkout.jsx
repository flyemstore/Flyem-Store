import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../api/index";

// 1. Helper to Load Razorpay Script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // ✅ Default to Razorpay since COD is removed
  const [paymentMethod, setPaymentMethod] = useState("Razorpay");
  
  // Flag to stop auto-redirect when order is placed
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("India");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("Maharashtra");

  // Auth Check
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo) {
      navigate("/login?redirect=checkout");
    } else {
      setUser(userInfo);
    }
  }, [navigate]);

  // Redirect Logic
  useEffect(() => {
    // Only redirect to cart if cart is empty AND we haven't just placed an order
    if (!isSuccess && cart.length === 0) {
        navigate("/cart");
    }
  }, [cart, navigate, isSuccess]);

  // --- 🚀 MAIN HANDLER ---
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Directly call Razorpay since COD is disabled
    await handleRazorpayOrder();
  };

  // --- 🔵 RAZORPAY HANDLER ---
  const handleRazorpayOrder = async () => {
    setLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load.");
        setLoading(false);
        return;
      }

      const keyResponse = await api.request("/payment/key", { method: "GET" });
      const keyId = keyResponse.data ? keyResponse.data.keyId : keyResponse.keyId;
      if (!keyId) throw new Error("Could not retrieve Payment Key.");

      const orderResponse = await api.request("/payment/create-order", {
        method: "POST",
        body: { amount: cartTotal }
      });
      
      const orderData = orderResponse.data ? orderResponse.data : orderResponse;
      if (!orderData || !orderData.id) throw new Error("Order creation failed on backend.");

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "FLYEM Store",
        description: "Premium Streetwear",
        order_id: orderData.id, 
        handler: async function (response) {
          try {
             await api.request("/payment/verify", {
               method: "POST",
               body: {
                 razorpay_order_id: response.razorpay_order_id,
                 razorpay_payment_id: response.razorpay_payment_id,
                 razorpay_signature: response.razorpay_signature
               }
             });
             await finalizeOrder(response);
          } catch (err) {
             console.error(err);
             alert("Payment Verification Failed.");
             setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: phone,
        },
        theme: { color: "#000000" },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false); 

    } catch (error) {
      console.error(error);
      if(error.response && (error.response.status === 401 || error.response.status === 403)) {
          alert("Your session has expired. Please Log In again.");
          localStorage.removeItem("userInfo");
          navigate('/login');
      } else {
          alert("Payment Failed: " + (error.message || "Unknown Error"));
      }
      setLoading(false);
    }
  };

  // --- 🏁 FINALIZATION FUNCTION ---
  const finalizeOrder = async (paymentResult) => {
    try {
      const orderItems = cart.map((item) => ({
        product: item._id || item.id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        sku: item.sku 
      }));

      const orderData = {
        orderItems,
        shippingAddress: { 
            address, 
            city, 
            zip: postalCode, 
            country, 
            phone, 
            state 
        },
        paymentMethod: paymentMethod,
        itemsPrice: cartTotal,
        totalPrice: cartTotal,
        taxPrice: 0,
        shippingPrice: 0, 
        customerName: user.name,
        customerEmail: user.email,
        
        paymentResult: {
          id: paymentResult.razorpay_payment_id || paymentResult.id,
          status: paymentResult.status || "completed",
          email_address: user.email,
        }
      };

      const response = await api.request("/orders", {
        method: "POST",
        body: orderData
      });
      
      const createdOrder = response.data || response;
      
      if (!createdOrder._id) {
          throw new Error("Backend did not return an Order ID.");
      }

      // Success
      setIsSuccess(true);
      clearCart();
      navigate(`/order/${createdOrder._id}`);
      
    } catch (error) {
      console.error(error);
      alert("Order Creation Failed: " + (error.response?.data?.message || error.message));
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <form id="checkout-form" onSubmit={handleFormSubmit} className="space-y-6">
            
            {/* Contact Info */}
            <div className="bg-gray-50 p-6 rounded-theme border border-gray-200">
               <h3 className="font-bold uppercase text-sm mb-4">Contact Info</h3>
               <div className="grid grid-cols-1 gap-4">
                 <div>
                   <label className="block text-xs font-bold uppercase mb-1">Phone Number (Required)</label>
                   <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 border rounded text-sm" placeholder="+91 98765 43210" />
                 </div>
               </div>
            </div>

            {/* Address */}
             <div className="bg-gray-50 p-6 rounded-theme border border-gray-200">
               <h3 className="font-bold uppercase text-sm mb-4">Shipping Address</h3>
               <div className="space-y-4">
                 <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required className="w-full p-3 border rounded text-sm" placeholder="Address" />
                 <div className="grid grid-cols-2 gap-4">
                   <input type="text" value={city} onChange={(e) => setCity(e.target.value)} required className="w-full p-3 border rounded text-sm" placeholder="City" />
                   <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required className="w-full p-3 border rounded text-sm" placeholder="Pincode" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <select value={state} onChange={(e) => setState(e.target.value)} className="w-full p-3 border rounded text-sm bg-white">
                      <option value="andhra-pradesh">Andhra Pradesh</option>
                      <option value="arunachal-pradesh">Arunachal Pradesh</option>
                      <option value="assam">Assam</option>
                      <option value="bihar">Bihar</option>
                      <option value="chhattisgarh">Chhattisgarh</option>
                      <option value="goa">Goa</option>
                      <option value="gujarat">Gujarat</option>
                      <option value="haryana">Haryana</option>
                      <option value="himachal-pradesh">Himachal Pradesh</option>
                      <option value="jharkhand">Jharkhand</option>
                      <option value="karnataka">Karnataka</option>
                      <option value="kerala">Kerala</option>
                      <option value="madhya-pradesh">Madhya Pradesh</option>
                      <option value="maharashtra">Maharashtra</option>
                      <option value="manipur">Manipur</option>
                      <option value="meghalaya">Meghalaya</option>
                      <option value="mizoram">Mizoram</option>
                      <option value="nagaland">Nagaland</option>
                      <option value="odisha">Odisha</option>
                      <option value="punjab">Punjab</option>
                      <option value="rajasthan">Rajasthan</option>
                      <option value="sikkim">Sikkim</option>
                      <option value="tamil-nadu">Tamil Nadu</option>
                      <option value="telangana">Telangana</option>
                      <option value="tripura">Tripura</option>
                      <option value="uttar-pradesh">Uttar Pradesh</option>
                      <option value="uttarakhand">Uttarakhand</option>
                      <option value="west-bengal">West Bengal</option>
                    </select>
                    <input type="text" value={country} disabled className="w-full p-3 border rounded text-sm bg-gray-100" />
                 </div>
               </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 p-6 rounded-theme border border-gray-200">
              <h3 className="font-bold uppercase text-sm mb-4">Payment Method</h3>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-3 border rounded cursor-pointer transition-colors ${paymentMethod === "Razorpay" ? "border-black bg-white ring-1 ring-black" : "bg-white border-gray-200"}`}>
                  <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === "Razorpay"} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span className="font-bold text-sm">UPI / Cards / NetBanking (Razorpay)</span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-4 uppercase font-black tracking-widest text-sm hover:scale-[1.01] transition-transform">
              {loading ? "Processing..." : `Pay ₹${cartTotal} & Place Order`}
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="h-fit bg-gray-50 border border-gray-200 p-8 rounded-theme sticky top-24">
             <h3 className="font-black uppercase tracking-wider text-lg mb-6 border-b border-gray-200 pb-4">Order Summary</h3>
             <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
               {cart.map((item) => (
                 <div key={`${item.id || item._id}-${item.size}`} className="flex gap-4 items-center">
                   <div className="w-16 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                     <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                     <h4 className="text-sm font-bold uppercase line-clamp-1">{item.name}</h4>
                     <p className="text-xs text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                     <p className="text-sm font-bold mt-1">₹{item.price * item.quantity}</p>
                   </div>
                 </div>
               ))}
             </div>
             <div className="border-t border-gray-200 pt-4 text-sm space-y-2">
               <div className="flex justify-between font-black text-lg">
                 <span>Total</span>
                 <span>₹{cartTotal}</span>
               </div>
             </div>
        </div>

      </div>
    </div>
  );
}