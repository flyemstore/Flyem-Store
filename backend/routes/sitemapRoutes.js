import express from "express";
import Product from "../models/productModel.js";
import SiteSettings from "../models/siteModel.js";

const router = express.Router();

router.get("/sitemap.xml", async (req, res) => {
  try {
    const baseUrl = "http://localhost:5173"; // ⚠️ CHANGE THIS to your domain when live (e.g., https://flyem.in)

    // 1. Static Pages (Hardcoded)
    const staticPages = [
      "",
      "/products",
      "/cart",
      "/login",
      "/register"
    ];

    // 2. Fetch Dynamic Data
    const products = await Product.find({}, "_id updatedAt");
    // const pages = await Page.find({}, "slug updatedAt"); // Uncomment when you have a Page model

    // 3. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add Static Pages
    staticPages.forEach(page => {
      xml += `
        <url>
            <loc>${baseUrl}${page}</loc>
            <changefreq>daily</changefreq>
            <priority>0.8</priority>
        </url>`;
    });

    // Add Products
    products.forEach(product => {
      xml += `
        <url>
            <loc>${baseUrl}/product/${product._id}</loc>
            <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>1.0</priority>
        </url>`;
    });

    xml += `</urlset>`;

    // 4. Send XML Response
    res.header("Content-Type", "application/xml");
    res.send(xml);

  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

export default router;