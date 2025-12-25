import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/index";

// 👇 SMART URL HELPER
const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http") || imagePath.startsWith("https")) {
    return imagePath;
  }
  return `https://flyem-backend.onrender.com${imagePath}`;
};

export default function AdminProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState(""); // 👈 NEW STATE
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState(""); 
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.request(`/products/${id}`);
        setName(data.name);
        setPrice(data.price);
        setImage(data.image);
        setCategory(data.category);
        setColor(data.color || ""); // 👈 LOAD COLOR
        setDescription(data.description);
        setSku(data.sku || "");
        setVariants(data.variants || []);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        alert("Error fetching product");
      }
    };
    fetchData();
  }, [id]);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { size: "L", sku: "", stock: 10 }]);
  };

  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      // ✅ FIXED: Wrapping method and body in an object
      await api.request(`/products/${id}`, {
          method: "PUT",
          body: {
            name,
            price,
            image,
            category,
            color, // 👈 SEND COLOR
            description,
            sku,
            variants: variants 
          }
      });
      alert("Product Updated!");
      navigate("/admin/products");
    } catch (error) {
      alert("Update failed. Check if you are an admin.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/admin/products" className="text-sm font-bold underline mb-6 block uppercase tracking-tighter">
        ← GO BACK TO INVENTORY
      </Link>
      
      <h1 className="text-3xl font-black uppercase mb-8 tracking-tighter">Edit Product</h1>

      {loading ? (
        <div className="text-center p-20 font-bold uppercase">Loading Product Details...</div>
      ) : (
        <form onSubmit={submitHandler} className="space-y-8 bg-white p-8 border border-gray-200 rounded-lg shadow-sm">
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        className="w-full p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold uppercase mb-2">Display Price</label>
                    <input 
                        type="number" 
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)} 
                        className="w-full p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {/* 👇 NEW COLOR INPUT */}
            <div>
                <label className="block text-xs font-bold uppercase mb-2">Color Name</label>
                <input 
                    type="text" 
                    value={color} 
                    onChange={(e) => setColor(e.target.value)} 
                    className="w-full p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                    placeholder="e.g. Black, Navy Blue, Off White"
                />
            </div>

            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold uppercase text-sm">Product Sizes & SKUs</h3>
                    <button type="button" onClick={addVariant} className="text-xs bg-black text-white px-3 py-1 rounded uppercase font-bold hover:bg-gray-800 transition-colors">
                    + Add Size
                    </button>
                </div>

                {variants.length === 0 && <p className="text-sm text-gray-400 italic">No variants added yet.</p>}

                {variants.map((variant, index) => (
                    <div key={index} className="flex gap-2 mb-2 items-end">
                    <div className="w-24">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Size</label>
                        <select 
                        value={variant.size} 
                        onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                        className="w-full border p-2 text-sm bg-white rounded"
                        >
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Store SKU</label>
                        <input 
                        type="text" 
                        value={variant.sku} 
                        onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                        className="w-full border p-2 text-sm font-mono rounded bg-white"
                        placeholder="FLYEM-ZIP-M"
                        />
                    </div>

                    <div className="w-20">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Stock</label>
                        <input 
                        type="number" 
                        value={variant.stock} 
                        onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                        className="w-full border p-2 text-sm text-center rounded bg-white"
                        />
                    </div>

                    <button 
                        type="button" 
                        onClick={() => removeVariant(index)}
                        className="bg-red-100 text-red-600 p-2 rounded hover:bg-red-200 transition-colors"
                    >
                        ✕
                    </button>
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-xs font-bold uppercase mb-2">Image URL</label>
                <div className="flex gap-4 items-start">
                    <input 
                        type="text" 
                        value={image} 
                        onChange={(e) => setImage(e.target.value)} 
                        className="flex-1 p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                    />
                    <div className="w-16 h-16 bg-gray-100 border rounded overflow-hidden flex-shrink-0">
                        {image && <img src={getImageUrl(image)} alt="Preview" className="w-full h-full object-cover" />}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold uppercase mb-2">Category</label>
                    <input 
                        type="text" 
                        value={category} 
                        onChange={(e) => setCategory(e.target.value)} 
                        className="w-full p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold uppercase mb-2">Parent SKU (Optional)</label>
                    <input 
                        type="text" 
                        value={sku} 
                        onChange={(e) => setSku(e.target.value)} 
                        className="w-full p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                        placeholder="Generic SKU"
                    />
                 </div>
            </div>

            <div>
                <label className="block text-xs font-bold uppercase mb-2">Description</label>
                <textarea 
                    rows="4"
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    className="w-full p-3 border rounded bg-gray-50 focus:bg-white transition-colors"
                ></textarea>
            </div>

            <button type="submit" className="w-full bg-black text-white font-bold uppercase py-4 hover:bg-gray-800 transition-all rounded shadow-md">
                Update Product
            </button>
        </form>
      )}
    </div>
  );
}