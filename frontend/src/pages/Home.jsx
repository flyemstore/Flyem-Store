import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/index";

export default function Home() {
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const siteData = await api.request("/site");
        setSections(siteData.homepage?.sections || []);
        const productData = await api.request("/products");
        setProducts(productData || []);
      } catch (error) { console.error("Failed to load"); } 
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  if (loading) return <div className="h-screen bg-white flex items-center justify-center">Loading...</div>;

  // --- ANIMATION HELPER ---
  const getAnimClass = (animType) => {
      if (animType === 'fade') return "animate-fade";
      if (animType === 'slide') return "animate-slide";
      if (animType === 'zoom') return "animate-zoom";
      return "";
  };

  // --- 1. HERO BLOCK ---
  const HeroBlock = ({ data }) => {
    const getTextSizeClass = (size) => {
      if (size === 'small') return "text-4xl md:text-5xl";
      if (size === 'large') return "text-7xl md:text-8xl";
      if (size === 'xl')    return "text-8xl md:text-9xl";
      return "text-6xl"; 
    };
    const getBtnSizeClass = (size) => {
      if (size === 'small') return "px-5 py-2 text-sm";
      if (size === 'large') return "px-10 py-4 text-xl";
      return "px-8 py-3 text-base"; 
    };

    return (
      <section className={`${data.padding} px-6 relative flex flex-col justify-center min-h-[85vh] overflow-hidden ${getAnimClass(data.animation)}`} style={{ backgroundColor: data.backgroundColor, color: data.textColor, textAlign: data.align }}>
        {data.video ? (
          <div className="absolute inset-0 z-0"><video src={data.video} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-90" /><div className="absolute inset-0 bg-black/30"></div></div>
        ) : data.image && (
          <div className="absolute inset-0 z-0"><img src={data.image} className="w-full h-full object-cover opacity-90" alt="hero"/><div className="absolute inset-0 bg-black/20"></div></div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <h1 className={`${getTextSizeClass(data.textSize)} font-black uppercase`} style={{ color: data.textColor, whiteSpace: "pre-line" }}>{data.title}</h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-8 leading-relaxed" style={{ margin: data.align === 'center' ? '0 auto' : undefined }}>{data.subtitle}</p>
          {data.buttonText && <Link to={data.buttonLink || '/products'} className={`btn-primary shadow-xl inline-block ${getBtnSizeClass(data.buttonSize)}`}>{data.buttonText}</Link>}
        </div>
      </section>
    );
  };

  // --- 2. CATEGORY BLOCK ---
  const CategoryBlock = ({ data }) => {
      const cats = [...new Set(products.map(p => p.category))];
      return (
        <section className={`${data.padding} px-6 ${getAnimClass(data.animation)}`} style={{ backgroundColor: data.backgroundColor }}>
             <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-black uppercase mb-12" style={{ color: data.textColor }}>{data.title}</h2>
                <div className="flex flex-wrap justify-center gap-6">
                    {cats.map(cat => (
                        <Link to={`/products?cat=${cat}`} key={cat} className="group">
                            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-2 border-transparent group-hover:border-current transition-all overflow-hidden relative">
                                <img src={products.find(p => p.category === cat)?.image} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={cat} />
                            </div>
                            <span className="font-bold uppercase tracking-wider text-sm" style={{ color: data.textColor }}>{cat}</span>
                        </Link>
                    ))}
                </div>
             </div>
        </section>
      );
  };

  // --- 3. PRODUCT GRID ---
  const ProductBlock = ({ data, sortType, isCarousel }) => {
      let displayProducts = [...products];
      if (sortType === 'new') displayProducts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sortType === 'best') displayProducts.sort((a,b) => b.price - a.price); 
      const items = displayProducts.slice(0, data.productCount || 4);

      return (
        <section className={`${data.padding} px-6 ${getAnimClass(data.animation)}`} style={{ backgroundColor: data.backgroundColor }}>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-4xl font-black uppercase tracking-tighter" style={{ color: data.textColor }}>{data.title}</h2>
                    <Link to="/products" className="text-sm font-bold uppercase underline" style={{ color: data.textColor }}>View All</Link>
                </div>
                <div className={`${isCarousel ? 'flex overflow-x-auto gap-6 pb-8 snap-x' : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'}`}>
                    {items.map(p => (
                        <Link to={`/product/${p._id}`} key={p._id} className={`group cursor-pointer ${isCarousel ? 'min-w-[280px] snap-start' : ''}`}>
                            <div className="aspect-[3/4] overflow-hidden bg-gray-100 mb-4 rounded relative">
                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={p.name} />
                                <button className="absolute bottom-4 left-4 right-4 bg-white text-black text-xs font-bold py-3 uppercase opacity-0 group-hover:opacity-100 transition-opacity">View</button>
                            </div>
                            <h3 className="font-bold text-sm uppercase" style={{ color: data.textColor }}>{p.name}</h3>
                            <p className="text-sm opacity-60" style={{ color: data.textColor }}>₹{p.price}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
      );
  };

  // --- 4. TESTIMONIALS ---
  const TestimonialsBlock = ({ data }) => {
    const reviews = data.subtitle ? data.subtitle.split("|") : ["Best purchase ever.", "Love the quality.", "Fast shipping."];
    return (
        <section className={`${data.padding} px-6 border-t border-gray-100 ${getAnimClass(data.animation)}`} style={{ backgroundColor: data.backgroundColor, color: data.textColor }}>
           <div className="max-w-7xl mx-auto text-center">
               <h2 className="text-3xl font-black uppercase mb-12 text-center">{data.title}</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {reviews.slice(0,3).map((text, i) => (
                       <div key={i} className="p-8 border border-current opacity-80 text-center">
                           <div className="text-yellow-400 mb-4">★★★★★</div>
                           <p className="italic mb-4">"{text.trim()}"</p>
                           <p className="text-xs font-bold uppercase">— Customer</p>
                       </div>
                   ))}
               </div>
           </div>
        </section>
    );
  };

  // --- HELPERS FOR PROMO/TEXT ---
  const getTextSizeClass = (size) => {
      if (size === 'small') return "text-4xl md:text-5xl";
      if (size === 'large') return "text-7xl md:text-8xl";
      if (size === 'xl')    return "text-8xl md:text-9xl";
      return "text-5xl md:text-6xl";
  };
  const getBtnSizeClass = (size) => {
      if (size === 'small') return "px-5 py-2 text-sm";
      if (size === 'large') return "px-10 py-4 text-xl";
      return "px-8 py-3 text-base";
  };

  // --- 5. PROMO BLOCK ---
  const PromoBlock = ({ data }) => (
    <section className={`${data.padding} px-6 ${getAnimClass(data.animation)}`} style={{ backgroundColor: data.backgroundColor, color: data.textColor }}>
       <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
           <div className={`order-${data.align === 'right' ? '2' : '1'} ${data.align === 'center' ? 'md:col-span-2 text-center' : ''}`}>
               <h2 className={`${getTextSizeClass(data.textSize)} font-black uppercase mb-6 leading-none`}>{data.title}</h2>
               <p className="text-lg opacity-80 mb-8">{data.subtitle}</p>
               {data.buttonText && <Link to={data.buttonLink} className={`btn-primary inline-block ${getBtnSizeClass(data.buttonSize)}`}>{data.buttonText}</Link>}
           </div>
           {data.image && (
               <div className={`order-${data.align === 'right' ? '1' : '2'} ${data.align === 'center' ? 'md:col-span-2' : ''} aspect-square md:aspect-video overflow-hidden rounded`}>
                   <img src={data.image} className="w-full h-full object-cover" alt="promo" />
               </div>
           )}
       </div>
    </section>
  );

  // --- 6. TEXT BLOCK ---
  const TextBlock = ({ data }) => (
    <section className={`${data.padding} px-6 ${getAnimClass(data.animation)}`} style={{ backgroundColor: data.backgroundColor, color: data.textColor, textAlign: data.align }}>
       <div className="max-w-4xl mx-auto">
           <h2 className={`${getTextSizeClass(data.textSize)} font-black uppercase mb-6`}>{data.title}</h2>
           <div className="text-lg opacity-80 whitespace-pre-wrap">{data.subtitle}</div>
           {data.buttonText && <Link to={data.buttonLink} className={`inline-block mt-8 border-b-2 border-current font-bold uppercase pb-1 hover:opacity-60 ${data.buttonSize === 'large' ? 'text-xl' : 'text-sm'}`}>{data.buttonText}</Link>}
       </div>
    </section>
  );

  // --- 7. NEWSLETTER BLOCK ---
  const NewsletterBlock = ({ data }) => {
      const [email, setEmail] = useState("");
      const [status, setStatus] = useState("idle");
      const [msg, setMsg] = useState("");

      const handleSubscribe = async (e) => {
          e.preventDefault();
          if(!email) return;
          setStatus("loading");
          try {
              await api.request("/subscribers", { method: "POST", body: JSON.stringify({ email }) });
              setStatus("success");
              setMsg("Thanks for subscribing!");
              setEmail("");
          } catch (error) {
              setStatus("error");
              setMsg(error.body?.message || "Something went wrong.");
          }
      };

      return (
          <section className={`${data.padding} px-6 text-center ${getAnimClass(data.animation)}`} style={{ backgroundColor: data.backgroundColor, color: data.textColor }}>
              <div className="max-w-xl mx-auto">
                  <h2 className="text-4xl font-black uppercase mb-4">{data.title}</h2>
                  <p className="opacity-70 mb-8">{data.subtitle}</p>
                  <form onSubmit={handleSubscribe} className="flex gap-2">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email..." required className="flex-1 border-b-2 border-current bg-transparent py-2 outline-none placeholder-current opacity-60" />
                      <button type="submit" disabled={status === 'loading'} className="font-bold uppercase border-b-2 border-current py-2 hover:opacity-70 disabled:opacity-50">{status === 'loading' ? "..." : "Subscribe"}</button>
                  </form>
                  {msg && <p className={`mt-4 text-sm font-bold ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>{msg}</p>}
              </div>
          </section>
      );
  };

  // --- 8. MARQUEE BLOCK ---
  const MarqueeBlock = ({ data }) => {
    let animClass = "animate-marquee";
    if (data.animation === "fast") animClass = "animate-marquee-fast";
    if (data.animation === "reverse") animClass = "animate-marquee-reverse";
    if (data.animation === "bounce") animClass = "animate-marquee-bounce";
    if (data.animation === "pulse") animClass = "animate-marquee-pulse";
    return (
       <div className={`border-y border-black py-4 overflow-hidden whitespace-nowrap ${data.margin}`} style={{ backgroundColor: data.backgroundColor, color: data.textColor }}>
         <div className={`inline-block ${animClass}`}>{[1,2,3,4,5,6].map(i => (<span key={i} className="font-black text-4xl mx-8 uppercase tracking-widest inline-block">{data.title}</span>))}</div>
       </div>
    );
  };

  // --- 9. HTML BLOCK ---
  const HtmlBlock = ({ data }) => (<div className={`${data.padding} ${getAnimClass(data.animation)}`} dangerouslySetInnerHTML={{ __html: data.html }} />);

  // --- MAIN RENDER ---
  const renderSection = (section) => {
      switch(section.type) {
          case 'hero': return <HeroBlock data={section} />;
          case 'categories': return <CategoryBlock data={section} />;
          case 'carousel': return <ProductBlock data={section} sortType="random" isCarousel={true} />;
          case 'featured': return <ProductBlock data={section} sortType="random" />;
          case 'new-arrivals': return <ProductBlock data={section} sortType="new" />;
          case 'best-sellers': return <ProductBlock data={section} sortType="best" />;
          case 'testimonials': return <TestimonialsBlock data={section} />;
          case 'promo': return <PromoBlock data={section} />;
          case 'text': return <TextBlock data={section} />;
          case 'marquee': return <MarqueeBlock data={section} />;
          case 'newsletter': return <NewsletterBlock data={section} />;
          case 'html': return <HtmlBlock data={section} />;
          default: return null;
      }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {sections.length > 0 ? sections.map((section, index) => {
          // 👇 LOGIC: If this is the FIRST section AND it is NOT a Hero section, add padding to clear the fixed Nav
          const isFirstNotHero = index === 0 && section.type !== 'hero';
          const spacerClass = isFirstNotHero ? "pt-28 md:pt-32" : ""; 

          return (
             <div key={section.id} className={spacerClass}>
                 {renderSection(section)}
             </div>
          );
      }) : (
         <div className="py-40 text-center text-gray-400">Homepage is empty. Add sections in Admin &rarr; Homepage Builder.</div>
      )}
    </div>
  );
}