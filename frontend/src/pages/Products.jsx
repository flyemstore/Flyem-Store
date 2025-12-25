import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { fetchCatalog } from "../api/products";
import api from "../api/index";
import Meta from '../components/Meta'; // 👈 SEO Component Imported

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- SETTINGS STATE ---
  const [settings, setSettings] = useState({
    gridColumns: 3,
    showFilters: true,      // This controls Standard Filters (Color/Size/Price)
    showSidebar: true,      // This controls the Sidebar container
    sidebarPosition: 'left',
    itemsPerPage: 12,
    customFilters: [] 
  });

  // Data for Standard Filters (Visual Swatches)
  const [standardColors, setStandardColors] = useState([]);
  const [standardSizes, setStandardSizes] = useState([]);

  // --- FILTER STATE (Unified) ---
  const [activeFilters, setActiveFilters] = useState({});
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // 1. Fetch Products
        const allProducts = await fetchCatalog();
        setProducts(allProducts);

        // 2. Fetch Admin Settings
        const siteData = await api.request("/site");
        const catalogSettings = siteData.catalogPage || {};
        const productSettings = siteData.productPage || {};
        
        // Merge Catalog Settings
        setSettings({
            ...catalogSettings,
            customFilters: catalogSettings.customFilters || []
        });

        // Load Standard Filter Data (for the visual swatches)
        setStandardColors(productSettings.availableColors || []);
        setStandardSizes(productSettings.availableSizes || []);

        // Set Default Sort
        if (catalogSettings.defaultSort) setSortOption(catalogSettings.defaultSort);

      } catch (error) {
        console.error("Failed to load catalog", error);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // 1. Price Filter
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // 2. All Tag Filters (Standard + Custom)
    Object.keys(activeFilters).forEach(filterName => {
        const selectedOptions = activeFilters[filterName];
        if (selectedOptions && selectedOptions.length > 0) {
            result = result.filter(product => {
                
                // Case A: Standard Color
                if (filterName === 'Color') {
                    return selectedOptions.includes(product.color);
                }
                
                // Case B: Standard Size
                if (filterName === 'Size') {
                    // If product has single size:
                    return selectedOptions.includes(product.size); 
                }
                
                // Case C: Category
                if (filterName === 'Category') {
                    return selectedOptions.includes(product.category);
                }

                // Case D: Fallback (Check generic tags/properties)
                const productValues = Object.values(product).flat().map(v => String(v).toLowerCase());
                return selectedOptions.some(opt => productValues.includes(opt.toLowerCase()));
            });
        }
    });

    // 3. Sorting
    if (sortOption === "price_asc") result.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc") result.sort((a, b) => b.price - a.price);
    if (sortOption === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return result;
  }, [products, activeFilters, priceRange, sortOption]);

  // --- PAGINATION ---
  const itemsPerPage = settings.itemsPerPage || 12;
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- HANDLERS ---
  const toggleFilter = (groupName, option) => {
    setActiveFilters(prev => {
        const currentGroup = prev[groupName] || [];
        const newGroup = currentGroup.includes(option)
            ? currentGroup.filter(item => item !== option)
            : [...currentGroup, option];
        return { ...prev, [groupName]: newGroup };
    });
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveFilters({});
    setPriceRange([0, 10000]);
    setCurrentPage(1);
  };

  if (loading) return <div className="h-screen flex items-center justify-center uppercase tracking-widest">Loading Shop...</div>;

  const gridCols = settings.gridColumns === 2 ? "grid-cols-2" : settings.gridColumns === 4 ? "grid-cols-2 md:grid-cols-4" : "grid-cols-2 md:grid-cols-3";
  const showSidebar = settings.showSidebar !== false; 
  const sidebarLeft = settings.sidebarPosition !== 'right';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      
      {/* 👇 SEO META TAG ADDED HERE */}
      <Meta 
        title="Shop All | FLYEM" 
        description="Browse the latest streetwear drops, oversized tees, and cargo pants from FLYEM. Premium quality, made in India."
      />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-[var(--border-color)] pb-4 gap-4">
        <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Shop All</h1>
            <p className="text-[var(--text-color)] opacity-60 text-sm mt-1">{filteredProducts.length} Products</p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase text-[var(--text-color)] opacity-60">Sort By:</span>
            <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)} 
                className="border border-[var(--border-color)] p-2 text-sm bg-[var(--bg-color)] text-[var(--text-color)] font-medium uppercase focus:outline-none focus:border-[var(--primary-color)]"
            >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
            </select>
        </div>
      </div>

      <div className={`flex flex-col ${showSidebar ? (sidebarLeft ? 'md:flex-row' : 'md:flex-row-reverse') : ''} gap-12`}>
        
        {/* --- SIDEBAR --- */}
        {showSidebar && (
            <aside className="w-full md:w-64 flex-shrink-0 space-y-8 animate-fade-in">
                <div className="flex justify-between items-center border-b border-[var(--border-color)]/50 pb-2">
                    <h2 className="text-lg font-bold uppercase opacity-80">Filters</h2>
                    {(Object.keys(activeFilters).some(k => activeFilters[k].length > 0) || priceRange[1] < 10000) && (
                        <button onClick={clearFilters} className="text-[10px] font-bold text-red-500 uppercase hover:underline">Clear</button>
                    )}
                </div>

                {/* 1. CUSTOM FILTERS (Loop) */}
                {settings.customFilters.map((filter, index) => (
                    <div key={index}>
                        <h3 className="font-bold uppercase text-xs mb-3 opacity-70">{filter.label}</h3>
                        <div className="flex flex-wrap gap-2">
                            {filter.options.map(option => {
                                const isActive = activeFilters[filter.label]?.includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => toggleFilter(filter.label, option)}
                                        className={`border py-2 px-3 text-xs font-bold uppercase transition-all rounded-theme ${
                                            isActive
                                            ? 'bg-[var(--primary-color)] text-[var(--bg-color)] border-[var(--primary-color)]' 
                                            : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--text-color)]'
                                        }`}
                                    >
                                            {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {/* 2. STANDARD FILTERS (Color, Size, Price) - Wrapped in showFilters check */}
                {settings.showFilters && (
                    <>
                        {/* Standard Color Filter (Visual Swatches) */}
                        {standardColors.length > 0 && (
                            <div>
                                <h3 className="font-bold uppercase text-xs mb-3 opacity-70">Color</h3>
                                <div className="flex flex-wrap gap-2">
                                    {standardColors.map((c) => (
                                        <button
                                            key={c.name}
                                            onClick={() => toggleFilter('Color', c.name)}
                                            className={`w-8 h-8 rounded-full border border-[var(--border-color)] flex items-center justify-center transition-all ${
                                                activeFilters['Color']?.includes(c.name) 
                                                ? 'ring-2 ring-[var(--text-color)] ring-offset-2 ring-offset-[var(--bg-color)]' 
                                                : 'hover:border-[var(--text-color)]'
                                            }`}
                                            style={{ backgroundColor: c.hex }}
                                            title={c.name}
                                        >
                                           {activeFilters['Color']?.includes(c.name) && (c.hex.toLowerCase() === '#ffffff' || c.hex === '#fff') && <span className="text-black text-[10px]">✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Standard Size Filter (Visual Boxes) */}
                        {standardSizes.length > 0 && (
                            <div>
                                <h3 className="font-bold uppercase text-xs mb-3 opacity-70">Size</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {standardSizes.map((size) => {
                                        const isActive = activeFilters['Size']?.includes(size);
                                        return (
                                            <button
                                                key={size}
                                                onClick={() => toggleFilter('Size', size)}
                                                className={`border py-2 text-xs font-bold uppercase transition-all rounded-theme ${
                                                    isActive
                                                    ? 'bg-[var(--primary-color)] text-[var(--bg-color)] border-[var(--primary-color)]' 
                                                    : 'bg-transparent text-[var(--text-color)] border-[var(--border-color)] hover:border-[var(--text-color)]'
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Price Filter */}
                        <div>
                            <h3 className="font-bold uppercase text-xs mb-3 opacity-70">Max Price: ₹{priceRange[1]}</h3>
                            <input 
                                type="range" 
                                min="0" max="10000" step="100" 
                                value={priceRange[1]} 
                                onChange={(e) => setPriceRange([0, Number(e.target.value)])}
                                className="w-full h-1 bg-[var(--border-color)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-color)]"
                            />
                            <div className="flex justify-between text-[10px] text-[var(--text-color)] opacity-60 mt-1">
                                <span>₹0</span>
                                <span>₹10000+</span>
                            </div>
                        </div>
                    </>
                )}

            </aside>
        )}

        {/* --- PRODUCT GRID --- */}
        <div className="flex-1">
            {displayedProducts.length > 0 ? (
                <div className={`grid ${gridCols} gap-x-6 gap-y-10`}>
                    {displayedProducts.map((product) => (
                        <Link to={`/product/${product._id}`} key={product._id} className="group block">
                            <div className="aspect-[3/4] bg-[var(--border-color)]/10 overflow-hidden relative mb-3 rounded-theme">
                                {(product.saleDeadline && new Date(product.saleDeadline) > new Date()) && (
                                    <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase z-10">Sale</span>
                                )}
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                            <h3 className="font-bold text-sm uppercase leading-tight group-hover:underline decoration-1 underline-offset-2 text-[var(--text-color)]">
                                {product.name}
                            </h3>
                            <p className="text-[var(--text-color)] opacity-60 text-sm mt-1 font-medium">₹{product.price}</p>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="py-20 text-center border-2 border-dashed border-[var(--border-color)] rounded">
                    <p className="text-[var(--text-color)] opacity-60 uppercase text-sm font-bold">No products match your filters.</p>
                    <button onClick={clearFilters} className="text-[var(--accent-color)] underline text-xs mt-2 font-bold cursor-pointer">Clear Filters</button>
                </div>
            )}

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                        <button
                            key={pageNum}
                            onClick={() => { setCurrentPage(pageNum); window.scrollTo(0,0); }}
                            className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-all rounded-theme ${
                                currentPage === pageNum 
                                ? 'bg-[var(--primary-color)] text-[var(--bg-color)]' 
                                : 'bg-[var(--border-color)]/10 hover:bg-[var(--border-color)]/20 text-[var(--text-color)]'
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}