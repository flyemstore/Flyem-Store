import mongoose from "mongoose";

// --- SUB-SCHEMAS ---

const sectionSchema = new mongoose.Schema({ 
    id: String, 
    type: String, 
    title: String, 
    subtitle: String, 
    content: String, 
    html: String, 
    image: String, 
    video: String, 
    buttonText: String, 
    buttonLink: String, 
    align: { type: String, default: "center" }, 
    backgroundColor: { type: String, default: "#ffffff" }, 
    textColor: { type: String, default: "#000000" }, 
    padding: { type: String, default: "py-20" }, 
    margin: { type: String, default: "my-0" }, 
    animation: { type: String, default: "none" }, 
    productCount: { type: Number, default: 4 },
    
    // 👇 ADD THESE TWO LINES
    textSize: { type: String, default: "medium" },
    buttonSize: { type: String, default: "medium" }
});

const footerLinkSchema = new mongoose.Schema({ 
    label: String, 
    url: String 
});

const footerColumnSchema = new mongoose.Schema({ 
    title: String, 
    links: [footerLinkSchema] 
});

const footerDecoSchema = new mongoose.Schema({ 
    image: String, 
    position: String, 
    animation: String, 
    size: String, 
    opacity: Number 
});

const navItemSchema = new mongoose.Schema({ 
    label: String, 
    url: String, 
    color: String, 
    children: [new mongoose.Schema({ label: String, url: String })] 
});

// --- MAIN SCHEMA ---

const siteSchema = new mongoose.Schema({
  // Identity and Global Defaults
  identity: { 
    name: String, 
    tagline: String, 
    logo: String, 
    logoLight: String, 
    logoDark: String, 
    favicon: String, 
    currency: String 
  },
  
  // ... inside siteSchema
  contact: {
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    facebook: { type: String, default: "" }, // <--- Added
    youtube: { type: String, default: "" },  // <--- Added
    email: { type: String, default: "" },
    phone: { type: String, default: "" }
  },
  // ... 
  
  // --- THEME SETTINGS ---
  theme: { 
    mode: { type: String, enum: ['light'
      , 'dark', 'system'], default: 'light' },
    
    // Core Colors
    primaryColor: { type: String, default: "#000000" },
    secondaryColor: { type: String, default: "#ffffff" },
    accentColor: { type: String, default: "#2563eb" },
    
    // UI Shapes
    borderRadius: { type: String, enum: ['none', 'sm', 'md', 'full'], default: 'none' }, 
    buttonStyle: { type: String, enum: ['solid', 'outline', 'shadow'], default: 'solid' },
    
    // Fonts
    fontHeading: { type: String, default: "Inter" },
    fontBody: { type: String, default: "Inter" }
  },

  // Layout Settings
  layout: { 
    pageWidth: String, 
    containerType: String, 
    sectionPadding: String, 
    borderRadius: String 
  },
  
  // Header Settings
  header: { 
    layout: String, 
    position: String, 
    animation: String, 
    backgroundColor: String, 
    backgroundImage: String, 
    textColor: String, 
    transparency: Number, 
    logoHeight: String, 
    menu: [navItemSchema], 
    showSearch: Boolean, 
    showUser: Boolean, 
    showCart: Boolean, 
    decorations: [footerDecoSchema],
    // 👇 ADDED ANNOUNCEMENT BAR HERE
    announcementBar: {
        show: { type: Boolean, default: false },
        text: { type: String, default: "Free Shipping on Orders Over $100" },
        link: { type: String, default: "" },
        backgroundColor: { type: String, default: "#000000" },
        textColor: { type: String, default: "#ffffff" }
    }
  },
  
  // Footer Settings
  footer: { 
    backgroundColor: String, 
    textColor: String, 
    backgroundImage: String, 
    copyrightText: String, 
    showNewsletter: Boolean, 
    showSocials: Boolean, 
    showPaymentIcons: Boolean, 
    linkGroups: [footerColumnSchema], 
    decorations: [footerDecoSchema] 
  },
  
  // Contact Info
  contact: { 
    email: String, 
    phone: String, 
    instagram: String, 
    twitter: String 
  },
  
  // Homepage Builder Sections
  homepage: { 
    sections: [sectionSchema] 
  },

  // 👇 ADDED POPUP SETTINGS HERE
  popup: {
      show: { type: Boolean, default: false },
      title: { type: String, default: "Join the Club" },
      text: { type: String, default: "" },
      image: { type: String, default: "" },
      delay: { type: Number, default: 5 },
      buttonText: { type: String, default: "Subscribe" }
  },

  // --- SEO SETTINGS ---
  seo: {
    metaTitle: { type: String, default: "FLYEM - Premium Streetwear" },
    metaDescription: { type: String, default: "Define your vibe. Official streetwear drops from FLYEM." },
    ogImage: { type: String, default: "" }, 
    keywords: { type: String, default: "streetwear, fashion, hoodies, tshirts, india" }
  },

  // --- CUSTOM CODE INJECTION ---
  customCode: {
    headCode: { type: String, default: "" }, 
    bodyCode: { type: String, default: "" }
  },
  
  // Product Page Layout Settings
  productPage: {
    galleryLayout: { type: String, default: "grid" },
    showZoom: { type: Boolean, default: true },
    showStock: { type: Boolean, default: true },
    showRelated: { type: Boolean, default: true },
    showTrustBadges: { type: Boolean, default: true },
    showVariants: { type: Boolean, default: true },
    showSizes: { type: Boolean, default: true },
    showColors: { type: Boolean, default: true },
    showVideo: { type: Boolean, default: false },
    showCountdown: { type: Boolean, default: false },
    countdownText: { type: String, default: "Sale Ends In:" },
    timerMode: { type: String, enum: ["evergreen", "fixed"], default: "fixed" },
    evergreenMinutes: { type: Number, default: 120 },
    fixedDate: { type: Date },
    showExtraSection: { type: Boolean, default: true },
    extraSectionTitle: { type: String, default: "Care Instructions" },
    extraSectionContent: { type: String, default: "Machine wash cold." },
    badgeType: { type: String, default: "custom" },
    badgeCustomText: { type: String, default: "BESTSELLER" },
    availableSizes: { type: [String], default: ["S", "M", "L", "XL", "XXL"] },
    availableColors: { type: [new mongoose.Schema({ name: String, hex: String })], default: [{ name: "Black", hex: "#000000" }, { name: "White", hex: "#ffffff" }] }
  },

  // Catalog/Shop Page Layout Settings
  catalogPage: {
    gridColumns: { type: Number, default: 3 },
    showFilters: { type: Boolean, default: true },
    showSidebar: { type: Boolean, default: true },
    sidebarPosition: { type: String, enum: ['left', 'right'], default: 'left' },
    defaultSort: { type: String, default: 'newest' },
    paginationType: { type: String, enum: ['pagination', 'load_more'], default: 'pagination' },
    itemsPerPage: { type: Number, default: 12 },

    // 👇 ADD THIS NEW BLOCK HERE
    customFilters: [
      {
        label: { type: String },    // e.g. "Material"
        options: [{ type: String }] // e.g. ["Cotton", "Wool"]
      }
    ]
  },

  // Legacy fields (kept for safety)
  heroTopText: String, heroTopTextColor: String, heroHeadline: String, heroHeadlineColor: String,
  heroSubheadline: String, heroSubheadlineColor: String, announcementText: String,
  announcementColor: String, announcementBgColor: String, buttonText: String,
  heroImage: String, footerText: String, marqueeSpeed: Number, marqueeSize: String, marqueeHollow: Boolean, marqueeBehavior: String

}, { timestamps: true, strict: false });

const SiteSettings = mongoose.model("SiteSettings", siteSchema);
export default SiteSettings;