import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { fetchProductById, fetchCatalog } from "../api/products";
import { useCart } from "../context/CartContext";
import SizeChart from "../components/SizeChart";
import ImageMagnifier from "../components/ImageMagnifier"; 
import api from "../api/index";

// ----------------------------------------------------------------------
// 1. HELPER: SMART IMAGE URL
// ----------------------------------------------------------------------
const getImageUrl = (imagePath) => {
  if (!imagePath) return ""; 
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  return `https://flyem-backend.onrender.com${imagePath}`;
};

// --- HELPER: FIXED DATE TIMER ---
const CountdownTimer = ({ label, targetDate }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    if (difference > 0) {
      return {
        hours: Math.floor((difference / (1000 * 60 * 60))),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return null;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="mb-8 p-4 bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30 rounded-lg flex items-center gap-4 animate-pulse">
       <span className="text-xl text-[var(--accent-color)]">⚡</span> 
       <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)]">{label}</span>
          <div className="flex items-baseline gap-1 font-black font-mono text-xl leading-none mt-1">
            <span>{timeLeft.hours.toString().padStart(2, '0')}</span><span className="text-xs">H</span>
            <span>:</span>
            <span>{timeLeft.minutes.toString().padStart(2, '0')}</span><span className="text-xs">M</span>
            <span>:</span>
            <span>{timeLeft.seconds.toString().padStart(2, '0')}</span><span className="text-xs">S</span>
          </div>
       </div>
    </div>
  );
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [settings, setSettings] = useState({}); 
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); 
  
  const [activeMedia, setActiveMedia] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showSizeChart, setShowSizeChart] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Dynamic Options
  const [sizeOptions, setSizeOptions] = useState(["S", "M", "L", "XL", "XXL"]);
  const [colorOptions, setColorOptions] = useState([{ name: "Black", hex: "#000000" }]);

  // Load Data & Check User
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
        setUser(JSON.parse(storedUser));
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const prodData = await fetchProductById(id);
        setProduct(prodData);
        setActiveMedia(prodData.image);
        
        // Initial set if available, but logic below refines it
        if (prodData.color) setSelectedColor(prodData.color);
        
        let siteData = {};
        try { siteData = await api.request("/site"); } catch (e) {}
        const pageSettings = siteData.productPage || {};
        setSettings(pageSettings);

        // ✅ HANDLE VARIANTS vs GLOBAL SETTINGS
        if (prodData.variants && prodData.variants.length > 0) {
            const variantSizes = prodData.variants.map(v => v.size);
            setSizeOptions(variantSizes);
            
            if(variantSizes.includes("M")) setSelectedSize("M");
            else setSelectedSize(variantSizes[0]);

        } else if (pageSettings.availableSizes?.length > 0) {
            setSizeOptions(pageSettings.availableSizes);
            if(!pageSettings.availableSizes.includes("M")) setSelectedSize(pageSettings.availableSizes[0]);
            else setSelectedSize("M");
        }

        // 👇 FIX: Prioritize Product Specific Color over Global List
        if (prodData.color) {
            // If the product has a specific color, ONLY show that one.
            const matchingGlobal = pageSettings.availableColors?.find(c => c.name === prodData.color);
            setColorOptions([{
                name: prodData.color,
                hex: matchingGlobal ? matchingGlobal.hex : "#000000" // Use global hex or default to black
            }]);
            setSelectedColor(prodData.color);
        } 
        else if (pageSettings.availableColors?.length > 0) {
            // Fallback: Only show the global list (Black/White) if product has NO specific color
            setColorOptions(pageSettings.availableColors);
            setSelectedColor(pageSettings.availableColors[0].name);
        }

        if (pageSettings.showRelated !== false && prodData) {
              try {
                  const allProds = await fetchCatalog();
                  if (Array.isArray(allProds)) {
                      const related = allProds.filter(p => p.category === prodData.category && p._id !== prodData._id).slice(0, 4);
                      setRelatedProducts(related);
                  }
              } catch (e) {}
        }
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    loadData();
  }, [id]);

  // ✅ LOGIC UPDATE: Find the correct SKU for the size + LOGS
  const handleAddToCart = () => {
    if (!product) return;

    // 🕵️‍♂️ LOG 1: Start
    console.log("🛒 ADD TO CART CLICKED");
    console.log("🔢 Selected Size:", selectedSize);
    console.log("📋 Available Variants:", product.variants);

    let selectedSku = product.sku; // Default to parent SKU
    let stockAvailable = true;

    // If product has variants, find the specific SKU for the selected size
    if (product.variants && product.variants.length > 0) {
        const variant = product.variants.find(v => v.size === selectedSize);
        
        if (variant) {
            // 🕵️‍♂️ LOG 2: Found Match
            console.log("✅ MATCHING VARIANT FOUND:", variant);
            console.log(`🔁 Swapping SKU: ${selectedSku} -> ${variant.sku}`);
            
            selectedSku = variant.sku; // <--- Capture the Specific SKU
            
            if(variant.stock !== undefined && variant.stock <= 0) stockAvailable = false;
        } else {
            console.warn("⚠️ No matching variant found for size:", selectedSize);
        }
    } else {
        console.log("ℹ️ No variants array found. Using default SKU.");
    }

    if(!stockAvailable) {
        alert(`Size ${selectedSize} is currently out of stock.`);
        return;
    }

    // 🕵️‍♂️ LOG 3: Final Payload
    console.log("🚀 FINAL ITEM SENT TO CART:", {
        name: product.name,
        size: selectedSize,
        sku: selectedSku // <--- CHECK THIS IN CONSOLE
    });

    addToCart({ 
        ...product, 
        image: product.image, 
        selectedColor,
        sku: selectedSku 
    }, selectedSize);
    
    navigate("/cart");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (!savedUser) return navigate("/login");

    setReviewLoading(true);
    try {
      await api.request(`/products/${id}/reviews`, {
        method: "POST",
        headers: { Authorization: `Bearer ${savedUser.token}` },
        body: JSON.stringify({ rating, comment })
      });
      alert("Review Submitted!");
      window.location.reload();
    } catch (error) { alert(error.message); } 
    finally { setReviewLoading(false); }
  };

  const deleteReviewHandler = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    
    const savedUser = JSON.parse(localStorage.getItem("userInfo"));
    if (!savedUser) return;

    try {
      await api.request(`/products/${id}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${savedUser.token}` } 
      });
      alert("Review Deleted");
      window.location.reload(); 
    } catch (error) {
      alert(error.message || "Failed to delete");
    }
  };


  if (loading) return <div className="h-screen flex items-center justify-center uppercase">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center text-red-500">Not Found</div>;

  const isZoomEnabled = settings?.showZoom !== false;
  
  let badgeLabel = "";
  if (settings?.badgeType === "sale") badgeLabel = "SALE";
  if (settings?.badgeType === "new") badgeLabel = "NEW ARRIVAL";
  if (settings?.badgeType === "limited") badgeLabel = "LIMITED";
  if (settings?.badgeType === "custom") badgeLabel = settings.badgeCustomText;

  const reviews = product.reviews || [];
  const numReviews = product.numReviews || reviews.length || 0;
  
  const allImages = [product.image, ...(product.gallery || [])].filter(Boolean);
  if (product.video) allImages.push(product.video);

  const hasProductTimer = !!product.saleDeadline && new Date(product.saleDeadline) > new Date();
  const showGlobalTimer = settings?.showCountdown && settings?.fixedDate && new Date(settings.fixedDate) > new Date() && !hasProductTimer;

  const isVideo = (url) => url?.endsWith(".mp4") || url?.endsWith(".webm");

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
         
         {/* GALLERY */}
         <div className="relative h-fit md:sticky top-20">
            {badgeLabel && <span className="absolute top-4 left-4 bg-[var(--primary-color)] text-[var(--bg-color)] text-xs font-bold px-3 py-1 z-10 uppercase tracking-wider rounded-sm shadow-md">{badgeLabel}</span>}
            
            <div className="bg-[var(--border-color)]/10 aspect-[4/5] overflow-hidden rounded-theme relative mb-4 border border-[var(--border-color)] flex items-center justify-center">
                {isVideo(activeMedia) ? (
                    <video 
                        src={getImageUrl(activeMedia)} 
                        className="w-full h-full object-cover" 
                        controls 
                        autoPlay 
                        muted 
                        loop
                    />
                ) : (
                    <ImageMagnifier src={getImageUrl(activeMedia)} alt={product.name} isEnabled={isZoomEnabled} />
                )}
            </div>

            {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {allImages.map((url, idx) => (
                        <div 
                            key={idx} 
                            onClick={() => setActiveMedia(url)} 
                            className={`aspect-square overflow-hidden rounded-theme cursor-pointer border-2 transition-all relative ${activeMedia === url ? 'border-[var(--primary-color)] opacity-100' : 'border-[var(--border-color)] opacity-60 hover:opacity-100'}`}
                        >
                            {isVideo(url) ? (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                    <span className="text-white text-[10px] font-bold">▶ VIDEO</span>
                                </div>
                            ) : (
                                <img src={getImageUrl(url)} className="w-full h-full object-cover" alt="thumb"/>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* INFO */}
        <div className="flex flex-col justify-center">
            <span className="text-[var(--muted-color)] text-sm uppercase tracking-widest mb-4">{product.category}</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4 leading-none">{product.name}</h1>
            
            <div className="flex items-center gap-2 mb-6">
                <div className="text-yellow-500 text-lg">
                    {"★".repeat(Math.round(product.rating || 0)) + "☆".repeat(5 - Math.round(product.rating || 0))}
                </div>
                <span className="text-xs font-bold text-[var(--muted-color)]">({numReviews} Reviews)</span>
            </div>

            <p className="text-2xl font-medium mb-6">₹{product.price}</p>

            {settings?.showStock !== false && (
                <div className="mb-6 inline-block"><span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">In Stock</span></div>
            )}

            {/* TIMERS */}
            {hasProductTimer && <CountdownTimer label="Special Offer Ends In:" targetDate={product.saleDeadline} />}
            {showGlobalTimer && <CountdownTimer label={settings.countdownText} targetDate={settings.fixedDate} />}

            <div className="mb-8 space-y-6">
                {/* Dynamic Color Selector */}
                {settings?.showColors !== false && colorOptions.length > 0 && (
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider mb-3">Select Color: <span className="text-[var(--muted-color)]">{selectedColor}</span></p>
                        <div className="flex gap-3 flex-wrap">
                            {colorOptions.map(c => (
                                <button 
                                    key={c.name}
                                    onClick={() => setSelectedColor(c.name)}
                                    className={`w-8 h-8 rounded-full border border-[var(--border-color)] flex items-center justify-center transition-all ${selectedColor === c.name ? 'ring-2 ring-offset-2 ring-[var(--primary-color)]' : 'hover:border-[var(--primary-color)]'}`}
                                    style={{ backgroundColor: c.hex }}
                                    title={c.name}
                                >
                                    {selectedColor === c.name && (c.hex.toLowerCase() === '#ffffff' || c.hex === '#fff') && <span className="text-black text-[10px]">✓</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dynamic Size Selector */}
                {settings?.showSizes !== false && sizeOptions.length > 0 && (
                    <div>
                        <div className="flex justify-between items-end mb-3">
                        <p className="text-xs font-bold uppercase tracking-wider">Select Size</p>
                        <button onClick={() => setShowSizeChart(true)} className="text-xs text-[var(--muted-color)] underline hover:text-[var(--text-color)]">Size Guide</button>
                        </div>
                        <div className="flex gap-3 flex-wrap">
                        {sizeOptions.map((size) => (
                            <button 
                                key={size} 
                                onClick={() => setSelectedSize(size)} 
                                className={`w-12 h-12 flex items-center justify-center border font-bold text-sm transition-all rounded-theme ${
                                    selectedSize === size 
                                    ? "btn-primary" 
                                    : "bg-transparent text-[var(--muted-color)] border-[var(--border-color)] hover:border-[var(--text-color)] hover:text-[var(--text-color)]"
                                }`}
                            >
                                {size}
                            </button>
                        ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 mb-8">
                <button onClick={handleAddToCart} className="flex-1 btn-primary py-4">Add to Cart</button>
            </div>

            {settings?.showTrustBadges !== false && (
                <div className="grid grid-cols-3 gap-4 border-t border-b border-[var(--border-color)]/20 py-6 mb-6 text-center">
                    <div><span className="block text-xl mb-1">💯</span><span className="text-[10px] font-bold uppercase text-[var(--muted-color)]">Quality</span></div>
                    <div><span className="block text-xl mb-1">🔒</span><span className="text-[10px] font-bold uppercase text-[var(--muted-color)]">Secure</span></div>
                    <div><span className="block text-xl mb-1">🚚</span><span className="text-[10px] font-bold uppercase text-[var(--muted-color)]">Fast Ship</span></div>
                </div>
            )}

            <div className="pt-2 space-y-6">
                <div><h3 className="text-xs font-bold uppercase tracking-wider mb-2">Description</h3><p className="text-[var(--muted-color)] text-sm leading-relaxed">{product.description || "Premium heavyweight cotton."}</p></div>
                {settings?.showExtraSection && (
                    <div><h3 className="text-xs font-bold uppercase tracking-wider mb-2">{settings.extraSectionTitle}</h3><p className="text-[var(--muted-color)] text-sm leading-relaxed">{settings.extraSectionContent}</p></div>
                )}
            </div>
        </div>
      </div>

      {/* --- REVIEWS SECTION --- */}
      <div className="border-t border-[var(--border-color)]/20 pt-16 mt-12" id="reviews">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* 1. Review List */}
            <div>
                <h3 className="text-2xl font-black uppercase tracking-tight mb-8">Customer Reviews</h3>
                {reviews.length === 0 ? (
                    <div className="p-8 border border-dashed border-[var(--border-color)] rounded-theme text-center">
                        <p className="text-[var(--muted-color)] mb-2">No reviews yet.</p>
                        <p className="text-sm font-bold">Be the first to share your thoughts!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {reviews.map((rev, i) => (
                            <div key={i} className="border-b border-[var(--border-color)]/20 pb-6 last:border-0">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-bold text-sm uppercase">{rev.name}</span>
                                    <span className="text-xs text-[var(--muted-color)]">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-yellow-500 text-sm mb-2">
                                    {"★".repeat(rev.rating) + "☆".repeat(5 - rev.rating)}
                                </div>
                                <p className="text-sm text-[var(--text-color)] opacity-80 leading-relaxed">{rev.comment}</p>
                                
                                {user && user.isAdmin && (
                                    <button 
                                        onClick={() => deleteReviewHandler(rev._id)}
                                        className="text-red-500 text-xs font-bold uppercase mt-2 hover:underline block"
                                    >
                                        🗑️ Remove Comment
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. Write Review Form */}
            <div className="bg-[var(--border-color)]/5 p-8 rounded-theme border border-[var(--border-color)]/20 h-fit">
                <h3 className="text-xl font-bold uppercase mb-6">Write a Review</h3>
                <form onSubmit={submitReview} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`text-2xl transition-colors ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase mb-2">Review</label>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            rows="4"
                            className="w-full p-3 bg-white border border-[var(--border-color)] rounded-theme text-sm focus:outline-none focus:border-[var(--primary-color)]"
                            placeholder="Share your experience..."
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={reviewLoading}
                        className="w-full btn-primary py-3 text-sm"
                    >
                        {reviewLoading ? "Submitting..." : "Submit Review"}
                    </button>
                </form>
            </div>
        </div>
      </div>

      {/* --- RELATED PRODUCTS --- */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-[var(--border-color)]/20">
            <h2 className="text-2xl font-black uppercase mb-8 tracking-tight">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                    <Link to={`/product/${p._id}`} key={p._id} className="group block">
                        <div className="aspect-[3/4] bg-gray-100 rounded-theme overflow-hidden mb-3 relative">
                            <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <h4 className="font-bold text-sm uppercase group-hover:underline">{p.name}</h4>
                        <p className="text-sm opacity-60">₹{p.price}</p>
                    </Link>
                ))}
            </div>
        </div>
      )}

      {/* SIZE CHART MODAL */}
      {showSizeChart && (
        <SizeChart 
            isOpen={true} 
            onClose={() => setShowSizeChart(false)} 
            customChart={product.sizeChart ? getImageUrl(product.sizeChart) : null} 
        />
      )}
    </div>
  );
}