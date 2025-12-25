import express from 'express';
import asyncHandler from '../middleware/asyncHandler.js';
import Product from '../models/productModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  const products = await Product.find({});
  res.json(products);
}));

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    return res.json(product);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
}));

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin, asyncHandler(async (req, res) => {
  const { 
      name, price, description, image, brand, category, 
      variants, sizeChart, gallery, saleDeadline,
      color // 👈 1. EXTRACT COLOR HERE
  } = req.body;

  // 👇 Calculate Total Stock from Variants
  let totalStock = 0;
  if (variants && variants.length > 0) {
    totalStock = variants.reduce((acc, item) => acc + Number(item.stock), 0);
  }

  const product = new Product({
    name,
    price,
    user: req.user._id,
    image,
    brand: brand || "FLYEM", 
    category,
    color, // 👈 2. SAVE COLOR TO DB
    countInStock: totalStock, 
    variants: variants,      
    sizeChart,
    gallery,
    description,
    saleDeadline,
    numReviews: 0,
    rating: 0
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
}));

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const { 
    name, price, description, image, brand, category, 
    variants, sizeChart, gallery, saleDeadline,
    color // 👈 3. EXTRACT COLOR HERE
  } = req.body;

  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    product.brand = brand || product.brand;
    product.category = category || product.category;
    product.color = color || product.color; // 👈 4. UPDATE COLOR HERE
    product.variants = variants || product.variants;
    product.sizeChart = sizeChart || product.sizeChart;
    product.gallery = gallery || product.gallery;
    product.saleDeadline = saleDeadline || product.saleDeadline;

    // Recalculate stock
    if (variants && variants.length > 0) {
       product.countInStock = variants.reduce((acc, item) => acc + Number(item.stock), 0);
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
}));

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.status(200).json({ message: 'Product deleted' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
}));

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
router.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
}));

export default router;