import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

// Security Packages
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Routes
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import subscriberRoutes from './routes/subscriberRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js'; 
import couponRoutes from './routes/couponRoutes.js';
import paymentRoutes from "./routes/paymentRoutes.js";
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();
connectDB();

const app = express();

// 👇 1. TRUST PROXY (Required for Render)
app.set('trust proxy', 1);

// 👇 2. CORS (Allows your frontend to talk to backend)
const allowedOrigins = [
  "http://localhost:5173",
  "https://flyem.store",
  "https://flyem-frontend.onrender.com",
  "https://flyemstore.me",
  "https://www.flyemstore.me"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// 👇 3. PARSERS 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 👇 4. SECURITY (ADJUSTED)
app.use(
  helmet({
    crossOriginResourcePolicy: false, 
  })
);

// ✅ RATE LIMITER: Keeps the bots away
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 100, 
  message: 'Too many requests, please try again later.'
});
app.use('/api', limiter);

// 👇 5. HEALTH CHECK / CRON PING ROUTE
// This fixes the 404 error and keeps Render awake
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// --- ROUTES ---
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/site', siteRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/coupons', couponRoutes);
app.use("/api/payment", paymentRoutes);
app.use('/', sitemapRoutes);

const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error Handling
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));