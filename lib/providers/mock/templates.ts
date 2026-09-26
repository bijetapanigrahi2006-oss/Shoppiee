import type { CategoryId } from "@/lib/types";

/**
 * Compact product templates for the mock catalog. `variants` expands one
 * template into several products (e.g. colours), which keeps this file short
 * while giving ~300 products overall.
 */
export interface Template {
  name: string;
  brand: string;
  category: CategoryId;
  sub: string;
  emoji: string;
  price: number; // typical selling price
  specs?: Record<string, string | number>;
  tags: string[];
  type: string;
  style?: string;
  material?: string;
  variants?: string[]; // colours (or sizes) → one product each
  quality?: number; // 0..1, drives rating and complaint severity
}

const t = (x: Template) => x;

export const TEMPLATES: Template[] = [
  // ───────────── Laptops ─────────────
  t({ name: "IdeaPad Slim 5 (Ryzen 7 7730U, 16GB, 512GB)", brand: "Lenovo", category: "laptops", sub: "Thin & light", emoji: "💻", price: 62990, quality: 0.8, type: "laptop", tags: ["college", "coding", "battery", "thin", "office"], specs: { CPU: "Ryzen 7 7730U", RAM: "16 GB", Storage: "512 GB SSD", GPU: "Radeon integrated", Display: '15.6" FHD IPS', Battery: "10 hrs", Weight: "1.69 kg" } }),
  t({ name: "Vivobook 16X (i5-12450H, RTX 3050, 16GB)", brand: "ASUS", category: "laptops", sub: "Creator", emoji: "💻", price: 67990, quality: 0.72, type: "laptop", tags: ["gaming", "ai", "ml", "coding", "college", "gpu"], specs: { CPU: "Intel i5-12450H", RAM: "16 GB", Storage: "512 GB SSD", GPU: "RTX 3050 4GB", Display: '16" WUXGA 120Hz', Battery: "6 hrs", Weight: "1.8 kg" } }),
  t({ name: "Victus 15 (Ryzen 5 7535HS, RTX 2050)", brand: "HP", category: "laptops", sub: "Gaming", emoji: "🎮", price: 58990, quality: 0.68, type: "laptop", tags: ["gaming", "coding", "college", "gpu"], specs: { CPU: "Ryzen 5 7535HS", RAM: "8 GB", Storage: "512 GB SSD", GPU: "RTX 2050 4GB", Display: '15.6" FHD 144Hz', Battery: "5 hrs", Weight: "2.29 kg" } }),
  t({ name: "LOQ 15 (i5-12450HX, RTX 4050, 16GB)", brand: "Lenovo", category: "laptops", sub: "Gaming", emoji: "🎮", price: 72990, quality: 0.85, type: "laptop", tags: ["gaming", "ai", "ml", "coding", "gpu", "cuda"], specs: { CPU: "Intel i5-12450HX", RAM: "16 GB", Storage: "512 GB SSD", GPU: "RTX 4050 6GB", Display: '15.6" FHD 144Hz', Battery: "6 hrs", Weight: "2.4 kg" } }),
  t({ name: "MacBook Air M2 (8GB, 256GB)", brand: "Apple", category: "laptops", sub: "Thin & light", emoji: "💻", price: 79990, quality: 0.92, type: "laptop", tags: ["battery", "college", "coding", "thin", "premium"], specs: { CPU: "Apple M2", RAM: "8 GB", Storage: "256 GB SSD", GPU: "8-core Apple GPU", Display: '13.6" Liquid Retina', Battery: "18 hrs", Weight: "1.24 kg" } }),
  t({ name: "Inspiron 14 (i5-1335U, 16GB, 512GB)", brand: "Dell", category: "laptops", sub: "Everyday", emoji: "💻", price: 55990, quality: 0.7, type: "laptop", tags: ["college", "office", "battery", "coding"], specs: { CPU: "Intel i5-1335U", RAM: "16 GB", Storage: "512 GB SSD", GPU: "Iris Xe", Display: '14" FHD+', Battery: "9 hrs", Weight: "1.54 kg" } }),
  t({ name: "TUF Gaming A15 (Ryzen 7 7435HS, RTX 4060)", brand: "ASUS", category: "laptops", sub: "Gaming", emoji: "🎮", price: 84990, quality: 0.83, type: "laptop", tags: ["gaming", "ai", "ml", "gpu", "cuda", "coding"], specs: { CPU: "Ryzen 7 7435HS", RAM: "16 GB", Storage: "1 TB SSD", GPU: "RTX 4060 8GB", Display: '15.6" FHD 144Hz', Battery: "7 hrs", Weight: "2.2 kg" } }),
  t({ name: "Aspire 7 (Ryzen 5 5625U, GTX 1650)", brand: "Acer", category: "laptops", sub: "Gaming", emoji: "🎮", price: 49990, quality: 0.55, type: "laptop", tags: ["gaming", "college", "budget"], specs: { CPU: "Ryzen 5 5625U", RAM: "8 GB", Storage: "512 GB SSD", GPU: "GTX 1650 4GB", Display: '15.6" FHD', Battery: "5 hrs", Weight: "2.15 kg" } }),
  t({ name: "Zenbook 14 OLED (Ultra 5, 16GB)", brand: "ASUS", category: "laptops", sub: "Premium ultrabook", emoji: "💻", price: 89990, quality: 0.88, type: "laptop", tags: ["battery", "ai", "thin", "premium", "coding"], specs: { CPU: "Intel Core Ultra 5 125H", RAM: "16 GB", Storage: "1 TB SSD", GPU: "Intel Arc", Display: '14" 3K OLED', Battery: "14 hrs", Weight: "1.2 kg" } }),

  // ───────────── Mobiles ─────────────
  t({ name: "Galaxy S23 FE 5G (8GB/128GB)", brand: "Samsung", category: "mobiles", sub: "Flagship killer", emoji: "📱", price: 34999, quality: 0.78, type: "phone", tags: ["camera", "5g", "android"], variants: ["Mint", "Graphite", "Purple"], specs: { Chipset: "Exynos 2200", Display: '6.4" AMOLED 120Hz', Battery: "4500 mAh", Camera: "50MP + 12MP + 8MP" } }),
  t({ name: "iPhone 15 (128GB)", brand: "Apple", category: "mobiles", sub: "Premium", emoji: "📱", price: 69900, quality: 0.93, type: "phone", tags: ["camera", "ios", "premium"], variants: ["Black", "Blue", "Pink"], specs: { Chipset: "A16 Bionic", Display: '6.1" OLED', Battery: "3349 mAh", Camera: "48MP + 12MP" } }),
  t({ name: "Nord CE 4 5G (8GB/256GB)", brand: "OnePlus", category: "mobiles", sub: "Mid-range", emoji: "📱", price: 24999, quality: 0.8, type: "phone", tags: ["battery", "5g", "fast charging"], variants: ["Celadon Marble", "Dark Chrome"], specs: { Chipset: "Snapdragon 7 Gen 3", Display: '6.7" AMOLED 120Hz', Battery: "5500 mAh", Charging: "100W" } }),
  t({ name: "Redmi Note 13 Pro 5G", brand: "Xiaomi", category: "mobiles", sub: "Mid-range", emoji: "📱", price: 23999, quality: 0.7, type: "phone", tags: ["camera", "5g", "budget"], variants: ["Midnight Black", "Arctic White"], specs: { Chipset: "Snapdragon 7s Gen 2", Display: '6.67" AMOLED', Battery: "5100 mAh", Camera: "200MP" } }),
  t({ name: "Pixel 8a (8GB/128GB)", brand: "Google", category: "mobiles", sub: "Camera phone", emoji: "📱", price: 39999, quality: 0.86, type: "phone", tags: ["camera", "ai", "clean android"], variants: ["Obsidian", "Bay"], specs: { Chipset: "Tensor G3", Display: '6.1" OLED 120Hz', Battery: "4492 mAh", Camera: "64MP + 13MP" } }),

  // ───────────── Electronics ─────────────
  t({ name: "WH-1000XM5 Wireless ANC Headphones", brand: "Sony", category: "electronics", sub: "Headphones", emoji: "🎧", price: 26990, quality: 0.93, type: "headphones", style: "over-ear", tags: ["anc", "wireless", "travel"], variants: ["Black", "Silver"], specs: { ANC: "Yes", Battery: "30 hrs", Driver: "30mm" } }),
  t({ name: "Rockerz 550 Bluetooth Headphones", brand: "boAt", category: "electronics", sub: "Headphones", emoji: "🎧", price: 1499, quality: 0.6, type: "headphones", style: "over-ear", tags: ["wireless", "budget", "bass"], variants: ["Black", "Red", "Blue"], specs: { Battery: "20 hrs", Driver: "50mm" } }),
  t({ name: "Airdopes 141 TWS Earbuds", brand: "boAt", category: "electronics", sub: "Earbuds", emoji: "🎧", price: 1099, quality: 0.55, type: "earbuds", style: "in-ear", tags: ["wireless", "budget"], variants: ["Black", "White"], specs: { Battery: "42 hrs", Latency: "80ms" } }),
  t({ name: "AirPods Pro (2nd gen, USB-C)", brand: "Apple", category: "electronics", sub: "Earbuds", emoji: "🎧", price: 22900, quality: 0.92, type: "earbuds", style: "in-ear", tags: ["anc", "wireless", "premium"], specs: { ANC: "Yes", Battery: "6 hrs (30 with case)" } }),
  t({ name: "Buds 3 Pro ANC Earbuds", brand: "Samsung", category: "electronics", sub: "Earbuds", emoji: "🎧", price: 14999, quality: 0.8, type: "earbuds", style: "in-ear", tags: ["anc", "wireless"], specs: { ANC: "Yes", Battery: "6 hrs" } }),
  t({ name: "Crystal 4K Smart TV 43\"", brand: "Samsung", category: "electronics", sub: "Television", emoji: "📺", price: 29990, quality: 0.78, type: "tv", tags: ["4k", "smart tv"], specs: { Size: '43"', Resolution: "4K UHD", OS: "Tizen" } }),
  t({ name: "Smart Watch Ultra (1.96\" AMOLED)", brand: "Noise", category: "electronics", sub: "Smartwatch", emoji: "⌚", price: 2999, quality: 0.58, type: "smartwatch", tags: ["fitness", "budget"], variants: ["Jet Black", "Silver Grey"], specs: { Display: '1.96" AMOLED', Battery: "7 days" } }),
  t({ name: "Watch 7 Bluetooth 44mm", brand: "Samsung", category: "electronics", sub: "Smartwatch", emoji: "⌚", price: 29999, quality: 0.84, type: "smartwatch", tags: ["fitness", "premium"], variants: ["Green", "Silver"], specs: { Display: '1.5" Super AMOLED', Battery: "40 hrs" } }),
  t({ name: "Stone 1200 Bluetooth Speaker", brand: "boAt", category: "electronics", sub: "Speaker", emoji: "🔊", price: 3499, quality: 0.62, type: "speaker", tags: ["wireless", "party"], specs: { Output: "14W", Battery: "9 hrs" } }),
  t({ name: "Flip 6 Portable Speaker", brand: "JBL", category: "electronics", sub: "Speaker", emoji: "🔊", price: 9999, quality: 0.88, type: "speaker", tags: ["wireless", "waterproof"], variants: ["Black", "Blue", "Teal"], specs: { Output: "30W", Battery: "12 hrs", Rating: "IP67" } }),
  t({ name: "20000mAh Power Bank 22.5W", brand: "Ambrane", category: "electronics", sub: "Accessories", emoji: "🔋", price: 1299, quality: 0.66, type: "power bank", tags: ["travel", "charging"], specs: { Capacity: "20000 mAh", Output: "22.5W" } }),

  // ───────────── Beauty / skincare ─────────────
  t({ name: "Ultra Sheer Sunscreen SPF 50+ (80ml)", brand: "Neutrogena", category: "beauty", sub: "Sunscreen", emoji: "🧴", price: 649, quality: 0.84, type: "sunscreen", tags: ["sunscreen", "spf50", "oily skin", "non-greasy"], specs: { SPF: "50+", PA: "++++", Size: "80 ml", "Skin type": "Oily/Combination" } }),
  t({ name: "Glow+ Dewy Sunscreen SPF 50", brand: "Aqualogica", category: "beauty", sub: "Sunscreen", emoji: "🧴", price: 399, quality: 0.8, type: "sunscreen", tags: ["sunscreen", "spf50", "dry skin", "dewy"], specs: { SPF: "50", PA: "+++", Size: "50 g", "Skin type": "Dry/Normal" } }),
  t({ name: "Sunscreen Aqua Gel SPF 50 PA++++", brand: "Minimalist", category: "beauty", sub: "Sunscreen", emoji: "🧴", price: 399, quality: 0.86, type: "sunscreen", tags: ["sunscreen", "spf50", "oily skin", "gel", "no white cast"], specs: { SPF: "50", PA: "++++", Size: "50 g", "Skin type": "All" } }),
  t({ name: "Hybrid Sunscreen SPF 50 (Sunscoop)", brand: "Re'equil", category: "beauty", sub: "Sunscreen", emoji: "🧴", price: 595, quality: 0.82, type: "sunscreen", tags: ["sunscreen", "spf50", "sensitive skin"], specs: { SPF: "50", PA: "++++", Size: "50 g", "Skin type": "Sensitive" } }),
  t({ name: "Anthelios UVMune 400 Invisible Fluid SPF 50+", brand: "La Roche-Posay", category: "beauty", sub: "Sunscreen", emoji: "🧴", price: 1999, quality: 0.93, type: "sunscreen", tags: ["sunscreen", "spf50", "premium", "sensitive skin"], specs: { SPF: "50+", PA: "++++", Size: "50 ml", "Skin type": "All" } }),
  t({ name: "Sun Protect Matte Gel SPF 50", brand: "Lakmé", category: "beauty", sub: "Sunscreen", emoji: "🧴", price: 349, quality: 0.6, type: "sunscreen", tags: ["sunscreen", "spf50", "matte", "budget"], specs: { SPF: "50", PA: "+++", Size: "50 ml", "Skin type": "Oily" } }),
  t({ name: "Physical Sunscreen SPF 50 Mineral", brand: "Dot & Key", category: "beauty", sub: "Sunscreen", emoji: "🧴", price: 495, quality: 0.72, type: "sunscreen", tags: ["sunscreen", "mineral", "sensitive skin"], specs: { SPF: "50", PA: "+++", Size: "50 g", "Skin type": "Sensitive" } }),
  t({ name: "10% Niacinamide Face Serum", brand: "Minimalist", category: "beauty", sub: "Serum", emoji: "💧", price: 599, quality: 0.84, type: "serum", tags: ["serum", "acne", "oily skin"], specs: { Size: "30 ml" } }),
  t({ name: "Vitamin C Face Serum 10%", brand: "The Derma Co", category: "beauty", sub: "Serum", emoji: "💧", price: 549, quality: 0.72, type: "serum", tags: ["serum", "glow", "vitamin c"], specs: { Size: "30 ml" } }),
  t({ name: "Hydro Boost Water Gel Moisturiser", brand: "Neutrogena", category: "beauty", sub: "Moisturiser", emoji: "🫙", price: 899, quality: 0.85, type: "moisturiser", tags: ["moisturiser", "hydration"], specs: { Size: "50 g" } }),
  t({ name: "Matte Lipstick Long-Stay", brand: "Maybelline", category: "beauty", sub: "Lipstick", emoji: "💄", price: 499, quality: 0.74, type: "lipstick", tags: ["makeup", "lipstick", "matte"], variants: ["Nude", "Red", "Berry", "Coral"], specs: { Finish: "Matte" } }),
  t({ name: "Kajal Colossal Smudge-proof", brand: "Maybelline", category: "beauty", sub: "Eyes", emoji: "✏️", price: 199, quality: 0.76, type: "kajal", tags: ["makeup", "kajal"], specs: { Wear: "12 hrs" } }),

  // ───────────── Makeup ─────────────
  t({ name: "Soft Rose Tinted Lip Balm", brand: "Nivea", category: "beauty", sub: "Lip care", emoji: "💋", price: 199, quality: 0.84, type: "lip balm", tags: ["makeup", "lip balm", "lip care", "tinted", "dry lips"], specs: { Size: "4.8 g" } }),
  t({ name: "Baby Lips Moisturising Lip Balm SPF 20", brand: "Maybelline", category: "beauty", sub: "Lip care", emoji: "💋", price: 149, quality: 0.8, type: "lip balm", tags: ["makeup", "lip balm", "lip care", "spf"], variants: ["Cherry", "Peach", "Berry"], specs: { SPF: "20", Size: "4 g" } }),
  t({ name: "Lip Sleeping Mask Berry", brand: "Laneige", category: "beauty", sub: "Lip care", emoji: "💋", price: 1650, quality: 0.9, type: "lip mask", tags: ["lip balm", "lip care", "premium", "k-beauty"], specs: { Size: "20 g" } }),
  t({ name: "Smudge Me Not Liquid Lipstick", brand: "SUGAR", category: "beauty", sub: "Lipstick", emoji: "💄", price: 499, quality: 0.82, type: "lipstick", style: "liquid matte", tags: ["makeup", "lipstick", "liquid", "matte", "transfer-proof"], variants: ["Brazen Raisin", "Tan Fan", "Plum Yum"], specs: { Finish: "Liquid matte" } }),
  t({ name: "9to5 Primer + Matte Lip Color", brand: "Lakmé", category: "beauty", sub: "Lipstick", emoji: "💄", price: 575, quality: 0.8, type: "lipstick", tags: ["makeup", "lipstick", "matte", "office"], variants: ["Rosy Sunday", "Red Letter"], specs: { Finish: "Matte" } }),
  t({ name: "Plumping Lip Gloss", brand: "Swiss Beauty", category: "beauty", sub: "Lipstick", emoji: "💄", price: 249, quality: 0.7, type: "lip gloss", tags: ["makeup", "lip gloss", "glossy", "budget"], variants: ["Clear", "Pink"] }),
  t({ name: "Fit Me Matte + Poreless Foundation", brand: "Maybelline", category: "beauty", sub: "Face makeup", emoji: "🪞", price: 599, quality: 0.82, type: "foundation", tags: ["makeup", "foundation", "oily skin", "matte"], variants: ["115 Ivory", "128 Warm Nude", "220 Natural Beige"], specs: { Size: "30 ml", Finish: "Matte", "Skin type": "Oily" } }),
  t({ name: "Fit Me Concealer", brand: "Maybelline", category: "beauty", sub: "Face makeup", emoji: "🪞", price: 549, quality: 0.8, type: "concealer", tags: ["makeup", "concealer", "dark circles"], specs: { Size: "6.8 ml" } }),
  t({ name: "9to5 Flawless Matte Compact Powder", brand: "Lakmé", category: "beauty", sub: "Face makeup", emoji: "🪞", price: 525, quality: 0.78, type: "compact", tags: ["makeup", "compact", "powder", "oily skin"], specs: { Size: "9 g" } }),
  t({ name: "Baby Skin Instant Pore Eraser Primer", brand: "Maybelline", category: "beauty", sub: "Face makeup", emoji: "🪞", price: 499, quality: 0.76, type: "primer", tags: ["makeup", "primer", "pores"], specs: { Size: "22 ml" } }),
  t({ name: "Cheek Blush Palette", brand: "Swiss Beauty", category: "beauty", sub: "Face makeup", emoji: "🌸", price: 349, quality: 0.74, type: "blush", tags: ["makeup", "blush", "palette"], specs: { Shades: 6 } }),
  t({ name: "Liquid Highlighter Glow Drops", brand: "Insight", category: "beauty", sub: "Face makeup", emoji: "✨", price: 299, quality: 0.72, type: "highlighter", tags: ["makeup", "highlighter", "glow"] }),
  t({ name: "Lash Sensational Sky High Mascara", brand: "Maybelline", category: "beauty", sub: "Eyes", emoji: "👁️", price: 799, quality: 0.86, type: "mascara", tags: ["makeup", "mascara", "volume", "lengthening"] }),
  t({ name: "Eyeconic Liquid Eyeliner", brand: "Lakmé", category: "beauty", sub: "Eyes", emoji: "👁️", price: 299, quality: 0.8, type: "eyeliner", tags: ["makeup", "eyeliner", "waterproof"] }),
  t({ name: "Eyeshadow Palette 12 Shades", brand: "Swiss Beauty", category: "beauty", sub: "Eyes", emoji: "🎨", price: 399, quality: 0.74, type: "eyeshadow palette", tags: ["makeup", "eyeshadow", "palette", "party"] }),
  t({ name: "Absolute Gel Stylist Nail Colour", brand: "Lakmé", category: "beauty", sub: "Nails", emoji: "💅", price: 299, quality: 0.76, type: "nail polish", tags: ["makeup", "nail polish", "nails"], variants: ["Crimson", "Nude", "Lilac"] }),
  t({ name: "All-in-One Makeup Setting Spray", brand: "MARS", category: "beauty", sub: "Face makeup", emoji: "💦", price: 349, quality: 0.72, type: "setting spray", tags: ["makeup", "setting spray", "long-lasting"] }),
  t({ name: "Professional Makeup Brush Set (12 pcs)", brand: "Vega", category: "beauty", sub: "Tools", emoji: "🖌️", price: 899, quality: 0.78, type: "makeup brushes", tags: ["makeup", "brushes", "tools"] }),
  t({ name: "Micellar Cleansing Water (400 ml)", brand: "Garnier", category: "beauty", sub: "Skincare", emoji: "💧", price: 499, quality: 0.84, type: "micellar water", tags: ["skincare", "makeup remover", "cleanser"] }),
  t({ name: "Purifying Neem Face Wash (150 ml)", brand: "Himalaya", category: "beauty", sub: "Skincare", emoji: "🧼", price: 199, quality: 0.8, type: "face wash", tags: ["skincare", "face wash", "acne", "oily skin"] }),
  t({ name: "Gentle Skin Cleanser (250 ml)", brand: "Cetaphil", category: "beauty", sub: "Skincare", emoji: "🧼", price: 849, quality: 0.88, type: "face wash", tags: ["skincare", "cleanser", "sensitive skin", "dry skin"] }),
  t({ name: "J'adore Eau de Parfum (50 ml)", brand: "Dior", category: "beauty", sub: "Fragrance", emoji: "🌺", price: 11500, quality: 0.93, type: "perfume", tags: ["perfume", "fragrance", "women", "premium", "gift"] }),
  t({ name: "Coco Noir Eau de Parfum (50 ml)", brand: "Chanel", category: "beauty", sub: "Fragrance", emoji: "🌺", price: 13900, quality: 0.92, type: "perfume", tags: ["perfume", "fragrance", "women", "premium", "gift"] }),
  t({ name: "CK One Eau de Toilette (100 ml)", brand: "Calvin Klein", category: "beauty", sub: "Fragrance", emoji: "🌺", price: 4200, quality: 0.86, type: "perfume", tags: ["perfume", "fragrance", "unisex", "gift"] }),
  t({ name: "Bloom Eau de Parfum (50 ml)", brand: "Gucci", category: "beauty", sub: "Fragrance", emoji: "🌺", price: 9800, quality: 0.9, type: "perfume", tags: ["perfume", "fragrance", "women", "premium", "gift"] }),

  // ───────────── Fashion ─────────────
  t({ name: "Floral Print Fit & Flare Midi Dress", brand: "SASSAFRAS", category: "fashion", sub: "Dresses", emoji: "👗", price: 1299, quality: 0.72, type: "dress", style: "midi floral", material: "polyester", tags: ["dress", "floral", "party", "women"], variants: ["Lavender", "Pink", "Black"] }),
  t({ name: "Satin Slip Maxi Dress", brand: "Tokyo Talkies", category: "fashion", sub: "Dresses", emoji: "👗", price: 999, quality: 0.62, type: "dress", style: "maxi satin", material: "satin", tags: ["dress", "party", "women", "satin"], variants: ["Emerald", "Wine", "Champagne"] }),
  t({ name: "Tiered Cotton Maxi Dress", brand: "Anouk", category: "fashion", sub: "Dresses", emoji: "👗", price: 1599, quality: 0.78, type: "dress", style: "maxi tiered", material: "cotton", tags: ["dress", "ethnic", "women", "cotton"], variants: ["Mustard", "White", "Indigo"] }),
  t({ name: "Bodycon Ribbed Mini Dress", brand: "H&M", category: "fashion", sub: "Dresses", emoji: "👗", price: 1499, quality: 0.74, type: "dress", style: "mini bodycon", material: "cotton blend", tags: ["dress", "party", "women"], variants: ["Black", "Beige"] }),
  t({ name: "Designer Puff-Sleeve Midi Dress", brand: "Label Ritu Kumar", category: "fashion", sub: "Dresses", emoji: "👗", price: 4999, quality: 0.85, type: "dress", style: "midi floral", material: "georgette", tags: ["dress", "designer", "women", "floral", "party"], variants: ["Lavender", "Pink"] }),
  t({ name: "Chikankari Straight Kurta", brand: "Biba", category: "fashion", sub: "Kurtas", emoji: "👘", price: 1799, quality: 0.8, type: "kurta", style: "straight chikankari", material: "cotton", tags: ["kurta", "ethnic", "women"], variants: ["White", "Pink", "Mint"] }),
  t({ name: "Oversized Graphic T-shirt", brand: "The Souled Store", category: "fashion", sub: "T-shirts", emoji: "👕", price: 799, quality: 0.78, type: "t-shirt", style: "oversized", material: "cotton", tags: ["tshirt", "men", "casual"], variants: ["Black", "White", "Olive"] }),
  t({ name: "Slim Fit Stretch Jeans", brand: "Levi's", category: "fashion", sub: "Jeans", emoji: "👖", price: 2399, quality: 0.84, type: "jeans", style: "slim", material: "denim", tags: ["jeans", "men", "casual"], variants: ["Dark Blue", "Black"] }),
  t({ name: "Linen Blend Casual Shirt", brand: "Marks & Spencer", category: "fashion", sub: "Shirts", emoji: "👔", price: 1999, quality: 0.82, type: "shirt", style: "casual", material: "linen", tags: ["shirt", "men", "summer"], variants: ["Sky Blue", "White", "Sage"] }),
  t({ name: "Quilted Puffer Jacket", brand: "Roadster", category: "fashion", sub: "Jackets", emoji: "🧥", price: 2199, quality: 0.66, type: "jacket", style: "puffer", tags: ["jacket", "winter", "unisex"], variants: ["Black", "Olive"] }),
  t({ name: "Tote Handbag Structured", brand: "Lavie", category: "fashion", sub: "Handbags", emoji: "👜", price: 1899, quality: 0.72, type: "handbag", style: "tote", material: "faux leather", tags: ["bag", "women", "office"], variants: ["Tan", "Black", "Pink"] }),
  t({ name: "Aviator Sunglasses Polarised", brand: "Ray-Ban", category: "fashion", sub: "Eyewear", emoji: "🕶️", price: 7890, quality: 0.9, type: "sunglasses", style: "aviator", tags: ["sunglasses", "unisex", "premium"], variants: ["Gold/Green", "Black"] }),
  t({ name: "Aviator Sunglasses UV400", brand: "Fastrack", category: "fashion", sub: "Eyewear", emoji: "🕶️", price: 1199, quality: 0.64, type: "sunglasses", style: "aviator", tags: ["sunglasses", "unisex", "budget"], variants: ["Gold/Green", "Black"] }),

  // ───────────── Ethnic wear ─────────────
  t({ name: "Printed Rayon A-Line Kurti", brand: "Libas", category: "fashion", sub: "Kurtis", emoji: "👘", price: 699, quality: 0.76, type: "kurti", style: "a-line printed", material: "rayon", tags: ["kurti", "ethnic", "women", "daily wear", "college"], variants: ["Mustard", "Teal", "Rose"] }),
  t({ name: "Embroidered Straight Cotton Kurti", brand: "W", category: "fashion", sub: "Kurtis", emoji: "👘", price: 1199, quality: 0.8, type: "kurti", style: "straight embroidered", material: "cotton", tags: ["kurti", "ethnic", "women", "office"], variants: ["White", "Navy", "Maroon"] }),
  t({ name: "Short Chikankari Kurti", brand: "Ada", category: "fashion", sub: "Kurtis", emoji: "👘", price: 899, quality: 0.72, type: "kurti", style: "short chikankari", material: "georgette", tags: ["kurti", "ethnic", "women", "jeans"], variants: ["Pastel Pink", "Sky Blue"] }),
  t({ name: "Anarkali Kurta with Dupatta Set", brand: "Biba", category: "fashion", sub: "Kurta sets", emoji: "👘", price: 2799, quality: 0.84, type: "anarkali", style: "flared anarkali", material: "cotton silk", tags: ["anarkali", "ethnic", "women", "festive", "wedding"], variants: ["Emerald", "Wine"] }),
  t({ name: "Sharara Suit Set with Dupatta", brand: "Libas", category: "fashion", sub: "Kurta sets", emoji: "👘", price: 2199, quality: 0.78, type: "sharara", style: "sharara set", material: "georgette", tags: ["sharara", "ethnic", "women", "festive", "wedding"], variants: ["Peach", "Lilac"] }),
  t({ name: "Palazzo Kurta Set", brand: "Aurelia", category: "fashion", sub: "Kurta sets", emoji: "👘", price: 1699, quality: 0.76, type: "palazzo set", style: "kurta palazzo", material: "rayon", tags: ["palazzo", "ethnic", "women", "office"], variants: ["Blue", "Black"] }),
  t({ name: "Unstitched Salwar Suit Material", brand: "Fabindia", category: "fashion", sub: "Salwar suits", emoji: "👘", price: 1899, quality: 0.74, type: "salwar suit", style: "salwar kameez", material: "cotton", tags: ["salwar", "suit", "ethnic", "women"] }),
  t({ name: "Embroidered Net Lehenga Choli", brand: "Kalini", category: "fashion", sub: "Lehengas", emoji: "💃", price: 3499, quality: 0.72, type: "lehenga", style: "flared embroidered", material: "net", tags: ["lehenga", "ethnic", "women", "wedding", "festive", "sangeet"], variants: ["Red", "Pink", "Navy"] }),
  t({ name: "Bridal Velvet Lehenga with Zari Work", brand: "Kalki Fashion", category: "fashion", sub: "Lehengas", emoji: "💃", price: 24999, quality: 0.88, type: "lehenga", style: "bridal zari", material: "velvet", tags: ["lehenga", "bridal", "wedding", "ethnic", "women", "premium"], variants: ["Maroon", "Red"] }),
  t({ name: "Mirror Work Navratri Chaniya Choli", brand: "Mitera", category: "fashion", sub: "Lehengas", emoji: "💃", price: 1999, quality: 0.7, type: "lehenga", style: "mirror work", material: "cotton", tags: ["lehenga", "chaniya choli", "navratri", "garba", "ethnic", "women"], variants: ["Multicolour", "Yellow"] }),
  t({ name: "Banarasi Silk Saree with Blouse", brand: "Mitera", category: "fashion", sub: "Sarees", emoji: "🥻", price: 2499, quality: 0.8, type: "saree", style: "banarasi silk", material: "silk", tags: ["saree", "ethnic", "women", "wedding", "festive"], variants: ["Red", "Green", "Purple"] }),
  t({ name: "Printed Georgette Saree", brand: "Satrani", category: "fashion", sub: "Sarees", emoji: "🥻", price: 899, quality: 0.68, type: "saree", style: "printed", material: "georgette", tags: ["saree", "ethnic", "women", "office", "daily wear"], variants: ["Blue", "Pink"] }),
  t({ name: "Kanjeevaram Pure Silk Saree", brand: "Taneira", category: "fashion", sub: "Sarees", emoji: "🥻", price: 14999, quality: 0.92, type: "saree", style: "kanjeevaram silk", material: "pure silk", tags: ["saree", "silk", "wedding", "premium", "ethnic", "women"], variants: ["Magenta", "Gold"] }),
  t({ name: "High-Low Hem Kurti", brand: "Global Desi", category: "fashion", sub: "Kurtis", emoji: "👘", price: 1099, quality: 0.74, type: "kurti", style: "high-low", material: "viscose", tags: ["kurti", "ethnic", "women", "indo-western"], variants: ["Coral", "Olive"] }),
  t({ name: "Angrakha Style Cotton Kurti", brand: "Fabindia", category: "fashion", sub: "Kurtis", emoji: "👘", price: 1490, quality: 0.84, type: "kurti", style: "angrakha", material: "cotton", tags: ["kurti", "ethnic", "women", "festive"], variants: ["Indigo", "Rust"] }),
  t({ name: "Kaftan Kurti with Tassels", brand: "Janasya", category: "fashion", sub: "Kurtis", emoji: "👘", price: 949, quality: 0.72, type: "kurti", style: "kaftan", material: "rayon", tags: ["kurti", "kaftan", "women", "summer"], variants: ["Turquoise", "Pink"] }),
  t({ name: "Flared Anarkali Kurti", brand: "Biba", category: "fashion", sub: "Kurtis", emoji: "👘", price: 1599, quality: 0.8, type: "kurti", style: "anarkali flared", material: "cotton", tags: ["kurti", "anarkali", "ethnic", "women", "festive"], variants: ["Yellow", "Wine"] }),
  t({ name: "Bandhani Print Kurti", brand: "Libas", category: "fashion", sub: "Kurtis", emoji: "👘", price: 849, quality: 0.74, type: "kurti", style: "bandhani print", material: "rayon", tags: ["kurti", "bandhani", "ethnic", "women", "navratri"], variants: ["Red", "Green"] }),
  t({ name: "Denim Short Kurti", brand: "Sassafras", category: "fashion", sub: "Kurtis", emoji: "👘", price: 999, quality: 0.7, type: "kurti", style: "denim short", material: "denim", tags: ["kurti", "denim", "indo-western", "women", "college"] }),
  t({ name: "Men's Cotton Kurta Pyjama Set", brand: "Manyavar", category: "fashion", sub: "Men's ethnic", emoji: "🧥", price: 2499, quality: 0.84, type: "kurta pyjama", style: "straight kurta", material: "cotton", tags: ["kurta", "men", "ethnic", "festive"], variants: ["Ivory", "Navy", "Mustard"] }),
  t({ name: "Men's Embroidered Sherwani Set", brand: "Manyavar", category: "fashion", sub: "Men's ethnic", emoji: "🧥", price: 15999, quality: 0.86, type: "sherwani", style: "embroidered", material: "silk blend", tags: ["sherwani", "men", "wedding", "ethnic", "premium"], variants: ["Cream", "Maroon"] }),
  t({ name: "Men's Nehru Jacket", brand: "Fabindia", category: "fashion", sub: "Men's ethnic", emoji: "🧥", price: 1999, quality: 0.8, type: "nehru jacket", style: "bandhgala", material: "cotton silk", tags: ["nehru jacket", "men", "ethnic", "festive"], variants: ["Black", "Beige"] }),

  // ───────────── Western wear ─────────────
  t({ name: "High-Rise Flared Jeans", brand: "Levi's", category: "fashion", sub: "Jeans", emoji: "👖", price: 2799, quality: 0.84, type: "jeans", style: "flared bootcut", material: "denim", tags: ["jeans", "flared", "women", "casual"], variants: ["Light Blue", "Black"] }),
  t({ name: "Wide-Leg Baggy Jeans", brand: "ONLY", category: "fashion", sub: "Jeans", emoji: "👖", price: 2299, quality: 0.76, type: "jeans", style: "wide-leg baggy", material: "denim", tags: ["jeans", "wide leg", "baggy", "women", "casual"], variants: ["Mid Blue", "Grey"] }),
  t({ name: "Skinny Fit Jeans", brand: "Vero Moda", category: "fashion", sub: "Jeans", emoji: "👖", price: 1799, quality: 0.72, type: "jeans", style: "skinny", material: "denim", tags: ["jeans", "skinny", "women", "casual"], variants: ["Dark Blue"] }),
  t({ name: "90s Mom Fit Jeans", brand: "H&M", category: "fashion", sub: "Jeans", emoji: "👖", price: 2299, quality: 0.8, type: "jeans", style: "mom fit high-rise", material: "denim", tags: ["jeans", "mom jeans", "women", "casual", "college"], variants: ["Light Blue", "Washed Black"] }),
  t({ name: "501 Original Straight Fit Jeans", brand: "Levi's", category: "fashion", sub: "Jeans", emoji: "👖", price: 3599, quality: 0.88, type: "jeans", style: "straight", material: "denim", tags: ["jeans", "straight", "men", "classic"], variants: ["Stonewash", "Dark Indigo"] }),
  t({ name: "Boyfriend Fit Distressed Jeans", brand: "Roadster", category: "fashion", sub: "Jeans", emoji: "👖", price: 1399, quality: 0.68, type: "jeans", style: "boyfriend ripped", material: "denim", tags: ["jeans", "boyfriend", "ripped", "distressed", "women"], variants: ["Mid Blue"] }),
  t({ name: "Bootcut Stretch Jeans", brand: "Wrangler", category: "fashion", sub: "Jeans", emoji: "👖", price: 2499, quality: 0.8, type: "jeans", style: "bootcut", material: "denim", tags: ["jeans", "bootcut", "flared", "women"], variants: ["Blue"] }),
  t({ name: "Relaxed Tapered Jeans", brand: "Wrangler", category: "fashion", sub: "Jeans", emoji: "👖", price: 2199, quality: 0.78, type: "jeans", style: "relaxed tapered", material: "denim", tags: ["jeans", "men", "relaxed", "casual"], variants: ["Black", "Grey"] }),
  t({ name: "Baggy Cargo Jeans", brand: "Snitch", category: "fashion", sub: "Jeans", emoji: "👖", price: 1899, quality: 0.72, type: "jeans", style: "cargo baggy", material: "denim", tags: ["jeans", "cargo", "baggy", "men", "streetwear"], variants: ["Ice Blue"] }),
  t({ name: "Peplum Top with Flutter Sleeves", brand: "Harpa", category: "fashion", sub: "Tops", emoji: "👚", price: 899, quality: 0.72, type: "top", style: "peplum", material: "crepe", tags: ["top", "peplum", "women", "office"], variants: ["Coral", "Black"] }),
  t({ name: "Off-Shoulder Ruffle Top", brand: "Tokyo Talkies", category: "fashion", sub: "Tops", emoji: "👚", price: 699, quality: 0.68, type: "top", style: "off-shoulder", material: "georgette", tags: ["top", "off shoulder", "women", "party", "vacation"], variants: ["White", "Red"] }),
  t({ name: "Satin Corset Top", brand: "Bershka", category: "fashion", sub: "Tops", emoji: "👚", price: 1590, quality: 0.76, type: "top", style: "corset", material: "satin", tags: ["top", "corset", "women", "party", "date night"], variants: ["Black", "Champagne"] }),
  t({ name: "Ribbed Tank Top (Pack of 2)", brand: "H&M", category: "fashion", sub: "Tops", emoji: "👚", price: 799, quality: 0.8, type: "top", style: "tank", material: "cotton", tags: ["top", "tank top", "women", "basics", "gym"], variants: ["Black & White", "Beige & Sage"] }),
  t({ name: "Puff Sleeve Square-Neck Top", brand: "Dressberry", category: "fashion", sub: "Tops", emoji: "👚", price: 849, quality: 0.74, type: "top", style: "puff sleeve", material: "cotton", tags: ["top", "puff sleeve", "women", "brunch"], variants: ["Lilac", "Yellow"] }),
  t({ name: "Halter Neck Knit Top", brand: "ONLY", category: "fashion", sub: "Tops", emoji: "👚", price: 999, quality: 0.72, type: "top", style: "halter", material: "knit", tags: ["top", "halter", "women", "party", "vacation"], variants: ["Pink", "Black"] }),
  t({ name: "Long Printed Tunic Top", brand: "Global Desi", category: "fashion", sub: "Tops", emoji: "👚", price: 1199, quality: 0.76, type: "top", style: "tunic", material: "viscose", tags: ["top", "tunic", "women", "office", "indo-western"], variants: ["Blue", "Mustard"] }),
  t({ name: "Square-Neck Bodysuit", brand: "Zara", category: "fashion", sub: "Tops", emoji: "👚", price: 1990, quality: 0.8, type: "top", style: "bodysuit", material: "stretch jersey", tags: ["top", "bodysuit", "women", "party"], variants: ["Black", "Brown"] }),
  t({ name: "Oversized Striped Boyfriend Shirt", brand: "Mango", category: "fashion", sub: "Shirts", emoji: "👔", price: 2590, quality: 0.8, type: "shirt", style: "oversized striped", material: "cotton", tags: ["shirt", "women", "oversized", "office", "casual"], variants: ["Blue Stripe"] }),
  t({ name: "Satin Button-Down Shirt (Women)", brand: "Vero Moda", category: "fashion", sub: "Shirts", emoji: "👔", price: 1799, quality: 0.76, type: "shirt", style: "satin", material: "satin", tags: ["shirt", "women", "party", "office"], variants: ["Emerald", "Ivory"] }),
  t({ name: "Oxford Button-Down Shirt", brand: "Allen Solly", category: "fashion", sub: "Shirts", emoji: "👔", price: 1499, quality: 0.82, type: "shirt", style: "oxford", material: "cotton oxford", tags: ["shirt", "men", "office", "casual"], variants: ["White", "Light Blue", "Pink"] }),
  t({ name: "Formal Slim Fit White Shirt", brand: "Van Heusen", category: "fashion", sub: "Shirts", emoji: "👔", price: 1699, quality: 0.84, type: "shirt", style: "formal", material: "cotton", tags: ["shirt", "men", "formal", "office", "interview"] }),
  t({ name: "Checked Flannel Shirt", brand: "Roadster", category: "fashion", sub: "Shirts", emoji: "👔", price: 999, quality: 0.72, type: "shirt", style: "checked flannel", material: "flannel", tags: ["shirt", "checks", "men", "casual", "winter"], variants: ["Red Check", "Blue Check"] }),
  t({ name: "Classic Denim Shirt", brand: "Levi's", category: "fashion", sub: "Shirts", emoji: "👔", price: 2799, quality: 0.84, type: "shirt", style: "denim", material: "denim", tags: ["shirt", "denim", "men", "casual"] }),
  t({ name: "Printed Cuban Collar Shirt", brand: "Snitch", category: "fashion", sub: "Shirts", emoji: "👔", price: 1199, quality: 0.72, type: "shirt", style: "cuban collar printed", material: "rayon", tags: ["shirt", "printed", "men", "vacation", "resort"], variants: ["Tropical Green", "Black Floral"] }),
  t({ name: "Mandarin Collar Kurta Shirt", brand: "Fabindia", category: "fashion", sub: "Shirts", emoji: "👔", price: 1590, quality: 0.8, type: "shirt", style: "mandarin collar", material: "cotton", tags: ["shirt", "men", "indo-western", "festive"], variants: ["White", "Sky Blue"] }),
  t({ name: "Printed Co-ord Set (Shirt & Trousers)", brand: "FableStreet", category: "fashion", sub: "Co-ords", emoji: "👚", price: 2499, quality: 0.8, type: "co-ord set", style: "printed co-ord", material: "viscose", tags: ["co-ord", "women", "vacation", "office"], variants: ["Sage", "Lilac"] }),
  t({ name: "Belted Utility Jumpsuit", brand: "Berrylush", category: "fashion", sub: "Jumpsuits", emoji: "👚", price: 1599, quality: 0.7, type: "jumpsuit", style: "utility belted", material: "cotton", tags: ["jumpsuit", "women", "casual"], variants: ["Olive", "Black"] }),
  t({ name: "Sequin Evening Gown", brand: "Faballey", category: "fashion", sub: "Gowns", emoji: "👗", price: 3999, quality: 0.78, type: "gown", style: "sequin evening", material: "sequin", tags: ["gown", "party", "women", "cocktail", "reception"], variants: ["Silver", "Midnight Blue"] }),
  t({ name: "Satin Wrap Midi Dress", brand: "Dressberry", category: "fashion", sub: "Dresses", emoji: "👗", price: 1399, quality: 0.72, type: "dress", style: "wrap midi", material: "satin", tags: ["dress", "wrap", "party", "women", "date night"], variants: ["Emerald", "Black", "Red"] }),
  t({ name: "Denim Shirt Dress", brand: "Mango", category: "fashion", sub: "Dresses", emoji: "👗", price: 2990, quality: 0.8, type: "dress", style: "shirt dress", material: "denim", tags: ["dress", "casual", "women", "brunch"], variants: ["Blue"] }),
  t({ name: "Pleated Midi Skirt", brand: "Zink London", category: "fashion", sub: "Skirts", emoji: "👗", price: 1299, quality: 0.74, type: "skirt", style: "pleated midi", material: "polyester", tags: ["skirt", "women", "office", "casual"], variants: ["Black", "Beige", "Pink"] }),
  t({ name: "Ribbed Crop Top", brand: "ONLY", category: "fashion", sub: "Tops", emoji: "👚", price: 799, quality: 0.74, type: "top", style: "crop", material: "cotton", tags: ["top", "crop top", "women", "casual"], variants: ["White", "Black", "Lavender"] }),
  t({ name: "Women's Tailored Blazer", brand: "Van Heusen", category: "fashion", sub: "Blazers", emoji: "🧥", price: 3499, quality: 0.84, type: "blazer", style: "tailored", material: "poly viscose", tags: ["blazer", "women", "office", "formal"], variants: ["Black", "Camel"] }),
  t({ name: "Oversized Hoodie", brand: "H&M", category: "fashion", sub: "Hoodies", emoji: "🧥", price: 1499, quality: 0.78, type: "hoodie", style: "oversized", material: "cotton fleece", tags: ["hoodie", "unisex", "winter", "casual"], variants: ["Grey Melange", "Black", "Sage"] }),
  t({ name: "Classic Polo T-shirt", brand: "U.S. Polo Assn.", category: "fashion", sub: "T-shirts", emoji: "👕", price: 1299, quality: 0.8, type: "polo t-shirt", style: "polo", material: "cotton pique", tags: ["polo", "tshirt", "men", "casual"], variants: ["Navy", "White", "Red"] }),
  t({ name: "Slim Fit Chinos", brand: "Jack & Jones", category: "fashion", sub: "Trousers", emoji: "👖", price: 1999, quality: 0.78, type: "chinos", style: "slim", material: "cotton stretch", tags: ["chinos", "trousers", "men", "office", "casual"], variants: ["Khaki", "Navy", "Olive"] }),
  t({ name: "Relaxed Cargo Pants", brand: "Bewakoof", category: "fashion", sub: "Trousers", emoji: "👖", price: 1299, quality: 0.7, type: "cargo pants", style: "relaxed cargo", material: "cotton twill", tags: ["cargo", "pants", "men", "streetwear"], variants: ["Olive", "Black"] }),
  t({ name: "Classic Denim Trucker Jacket", brand: "Levi's", category: "fashion", sub: "Jackets", emoji: "🧥", price: 3999, quality: 0.86, type: "jacket", style: "denim trucker", material: "denim", tags: ["jacket", "denim", "unisex", "casual"], variants: ["Mid Blue"] }),

  // ───────────── Footwear ─────────────
  t({ name: "Air Force 1 '07 Sneakers", brand: "Nike", category: "footwear", sub: "Sneakers", emoji: "👟", price: 7495, quality: 0.9, type: "sneakers", style: "low-top classic", material: "leather", tags: ["sneakers", "white", "casual", "unisex"], variants: ["White", "Black"] }),
  t({ name: "Court Classic Low-Top Sneakers", brand: "Roadster", category: "footwear", sub: "Sneakers", emoji: "👟", price: 1299, quality: 0.58, type: "sneakers", style: "low-top classic", material: "synthetic", tags: ["sneakers", "white", "casual", "budget"], variants: ["White", "Black"] }),
  t({ name: "Smash V2 Leather Sneakers", brand: "Puma", category: "footwear", sub: "Sneakers", emoji: "👟", price: 3299, quality: 0.78, type: "sneakers", style: "low-top classic", material: "leather", tags: ["sneakers", "white", "casual"], variants: ["White", "Navy"] }),
  t({ name: "Grand Court Base Sneakers", brand: "Adidas", category: "footwear", sub: "Sneakers", emoji: "👟", price: 3999, quality: 0.8, type: "sneakers", style: "low-top classic", material: "synthetic leather", tags: ["sneakers", "white", "casual"], variants: ["White", "Grey"] }),
  t({ name: "Revolution 7 Running Shoes", brand: "Nike", category: "footwear", sub: "Running", emoji: "🏃", price: 3695, quality: 0.8, type: "running shoes", style: "running", material: "mesh", tags: ["running", "sports", "gym"], variants: ["Black", "Blue", "Grey"] }),
  t({ name: "Ultraboost Light Running Shoes", brand: "Adidas", category: "footwear", sub: "Running", emoji: "🏃", price: 16999, quality: 0.9, type: "running shoes", style: "running", material: "primeknit", tags: ["running", "premium"], variants: ["Black", "White"] }),
  t({ name: "Men's Mesh Running Shoes", brand: "Campus", category: "footwear", sub: "Running", emoji: "🏃", price: 1199, quality: 0.6, type: "running shoes", style: "running", material: "mesh", tags: ["running", "budget"], variants: ["Grey", "Navy", "Black"] }),
  t({ name: "Embroidered Ethnic Juttis", brand: "Needledust", category: "footwear", sub: "Ethnic", emoji: "🥿", price: 1599, quality: 0.8, type: "juttis", style: "embroidered jutti", material: "leather", tags: ["juttis", "mojari", "ethnic", "women", "wedding"], variants: ["Gold", "Pink"] }),
  t({ name: "Block Heel Sandals", brand: "Metro", category: "footwear", sub: "Heels", emoji: "👡", price: 1990, quality: 0.72, type: "heels", style: "block heel", tags: ["heels", "women", "party"], variants: ["Nude", "Black", "Gold"] }),

  // ───────────── Jewellery & watches ─────────────
  t({ name: "22KT Gold Stud Earrings", brand: "Tanishq", category: "jewellery", sub: "Earrings", emoji: "💛", price: 18999, quality: 0.93, type: "earrings", style: "stud", material: "22kt gold", tags: ["gold", "earrings", "women", "gift"] }),
  t({ name: "Sterling Silver Pendant Necklace", brand: "GIVA", category: "jewellery", sub: "Necklaces", emoji: "📿", price: 2499, quality: 0.84, type: "necklace", style: "pendant", material: "925 silver", tags: ["silver", "necklace", "gift", "women"], variants: ["Silver", "Rose Gold"] }),
  t({ name: "Diamond Solitaire Ring 18KT", brand: "CaratLane", category: "jewellery", sub: "Rings", emoji: "💍", price: 42999, quality: 0.9, type: "ring", style: "solitaire", material: "18kt gold, diamond", tags: ["diamond", "ring", "gift", "engagement"] }),
  t({ name: "Gold-Plated Kundan Jhumkas", brand: "Zaveri Pearls", category: "jewellery", sub: "Earrings", emoji: "💛", price: 899, quality: 0.66, type: "earrings", style: "jhumka", material: "gold-plated alloy", tags: ["earrings", "ethnic", "women", "budget"], variants: ["Gold", "Antique Gold"] }),
  t({ name: "Kundan Choker Necklace Set", brand: "Zaveri Pearls", category: "jewellery", sub: "Necklaces", emoji: "📿", price: 1499, quality: 0.74, type: "choker", style: "kundan choker", material: "gold-plated alloy", tags: ["choker", "necklace", "ethnic", "wedding", "women"], variants: ["Gold", "Green Stone"] }),
  t({ name: "Pearl Layered Choker", brand: "Accessorize London", category: "jewellery", sub: "Necklaces", emoji: "📿", price: 1999, quality: 0.78, type: "choker", style: "pearl choker", material: "faux pearl", tags: ["choker", "pearl", "necklace", "party", "women"] }),
  t({ name: "Layered Gold Chain Necklace", brand: "GIVA", category: "jewellery", sub: "Necklaces", emoji: "📿", price: 2899, quality: 0.82, type: "necklace", style: "layered chain", material: "gold-plated silver", tags: ["necklace", "chain", "layered", "women", "daily wear"] }),
  t({ name: "Temple Gold Mangalsutra", brand: "Tanishq", category: "jewellery", sub: "Necklaces", emoji: "📿", price: 38999, quality: 0.9, type: "mangalsutra", style: "temple", material: "22kt gold", tags: ["mangalsutra", "gold", "wedding", "women", "premium"] }),
  t({ name: "Sterling Silver Anklets (Pair)", brand: "GIVA", category: "jewellery", sub: "Anklets", emoji: "✨", price: 2199, quality: 0.84, type: "anklet", style: "silver payal", material: "925 silver", tags: ["anklet", "payal", "silver", "women", "gift"] }),
  t({ name: "Beaded Boho Anklet", brand: "Accessorize London", category: "jewellery", sub: "Anklets", emoji: "✨", price: 599, quality: 0.7, type: "anklet", style: "beaded boho", material: "beads", tags: ["anklet", "boho", "beach", "women"], variants: ["Turquoise", "Multicolour"] }),
  t({ name: "Friendship Bracelets (Set of 5)", brand: "Salty", category: "jewellery", sub: "Bracelets", emoji: "🧶", price: 499, quality: 0.76, type: "friendship bracelet", style: "braided thread", material: "thread & beads", tags: ["friendship bracelet", "bracelet", "gift", "unisex", "friendship day"], variants: ["Pastel", "Rainbow"] }),
  t({ name: "Charm Bracelet Sterling Silver", brand: "Pandora", category: "jewellery", sub: "Bracelets", emoji: "✨", price: 7999, quality: 0.9, type: "bracelet", style: "charm", material: "925 silver", tags: ["bracelet", "charm", "silver", "gift", "women", "premium"] }),
  t({ name: "Diamond Tennis Bracelet 18KT", brand: "CaratLane", category: "jewellery", sub: "Bracelets", emoji: "✨", price: 54999, quality: 0.9, type: "bracelet", style: "tennis", material: "18kt gold, diamond", tags: ["bracelet", "diamond", "women", "premium", "anniversary"] }),
  t({ name: "Men's Silver Kada Bracelet", brand: "GIVA", category: "jewellery", sub: "Bracelets", emoji: "✨", price: 3499, quality: 0.82, type: "kada", style: "kada", material: "925 silver", tags: ["kada", "bracelet", "men", "silver"] }),
  t({ name: "Gold-Plated Bangles Set (4 pcs)", brand: "Kushal's", category: "jewellery", sub: "Bangles", emoji: "✨", price: 1299, quality: 0.74, type: "bangles", style: "ethnic bangles", material: "gold-plated brass", tags: ["bangles", "ethnic", "wedding", "women", "festive"], variants: ["2.4", "2.6"] }),
  t({ name: "Oxidised Silver Bangles", brand: "Rubans", category: "jewellery", sub: "Bangles", emoji: "✨", price: 699, quality: 0.72, type: "bangles", style: "oxidised", material: "oxidised alloy", tags: ["bangles", "oxidised", "boho", "women"] }),
  t({ name: "Gold Hoop Earrings", brand: "Accessorize London", category: "jewellery", sub: "Earrings", emoji: "💛", price: 899, quality: 0.76, type: "earrings", style: "hoops", material: "gold-plated", tags: ["earrings", "hoops", "women", "daily wear"] }),
  t({ name: "Green Crystal Drop Earrings", brand: "Swarovski", category: "jewellery", sub: "Earrings", emoji: "💚", price: 8999, quality: 0.88, type: "earrings", style: "crystal drop", material: "crystal", tags: ["earrings", "crystal", "party", "women", "premium"] }),
  t({ name: "Diamond Nose Pin 14KT", brand: "CaratLane", category: "jewellery", sub: "Nose pins", emoji: "✨", price: 6499, quality: 0.86, type: "nose pin", style: "stud", material: "14kt gold, diamond", tags: ["nose pin", "diamond", "women", "gift"] }),
  t({ name: "Kundan Maang Tikka", brand: "Zaveri Pearls", category: "jewellery", sub: "Hair jewellery", emoji: "✨", price: 699, quality: 0.72, type: "maang tikka", style: "kundan", material: "gold-plated alloy", tags: ["maang tikka", "bridal", "wedding", "ethnic", "women"] }),
  t({ name: "Men's Gold Chain 22KT", brand: "Malabar Gold", category: "jewellery", sub: "Chains", emoji: "✨", price: 64999, quality: 0.9, type: "chain", style: "rope chain", material: "22kt gold", tags: ["chain", "gold", "men", "premium"] }),
  t({ name: "Karishma Analog Watch (Men)", brand: "Titan", category: "jewellery", sub: "Watches", emoji: "⌚", price: 2795, quality: 0.8, type: "watch", style: "analog classic", material: "stainless steel", tags: ["watch", "men", "gift"], variants: ["Black Dial", "Silver Dial"] }),
  t({ name: "Raga Viva Analog Watch (Women)", brand: "Titan", category: "jewellery", sub: "Watches", emoji: "⌚", price: 6995, quality: 0.86, type: "watch", style: "bracelet", material: "brass", tags: ["watch", "women", "gift"], variants: ["Rose Gold", "Gold"] }),
  t({ name: "Chronograph Watch (Men)", brand: "Fossil", category: "jewellery", sub: "Watches", emoji: "⌚", price: 11995, quality: 0.84, type: "watch", style: "chronograph", material: "stainless steel", tags: ["watch", "men", "premium"], variants: ["Brown Leather", "Steel"] }),

  // ───────────── Home & furniture ─────────────
  t({ name: "3-Seater Fabric Sofa", brand: "Wakefit", category: "home", sub: "Sofas", emoji: "🛋️", price: 21999, quality: 0.8, type: "sofa", style: "modern", material: "fabric", tags: ["sofa", "living room"], variants: ["Grey", "Teal", "Beige"] }),
  t({ name: "Orthopaedic Memory Foam Mattress (Queen)", brand: "Wakefit", category: "home", sub: "Mattress", emoji: "🛏️", price: 12999, quality: 0.84, type: "mattress", tags: ["mattress", "bedroom", "back pain"], specs: { Size: "Queen 78x60", Thickness: "6 in" } }),
  t({ name: "Engineered Wood Study Table", brand: "Nilkamal", category: "home", sub: "Tables", emoji: "🪑", price: 5499, quality: 0.66, type: "table", style: "minimal", material: "engineered wood", tags: ["study", "table", "wfh"], variants: ["Walnut", "White"] }),
  t({ name: "Ergonomic Mesh Office Chair", brand: "Green Soul", category: "home", sub: "Chairs", emoji: "🪑", price: 8999, quality: 0.78, type: "chair", style: "ergonomic", material: "mesh", tags: ["chair", "wfh", "study", "back pain"], variants: ["Black", "Grey"] }),
  t({ name: "Non-stick Cookware Set (3 pc)", brand: "Prestige", category: "home", sub: "Kitchen", emoji: "🍳", price: 2299, quality: 0.76, type: "cookware", tags: ["kitchen", "cookware"] }),
  t({ name: "Air Fryer 4.2L Digital", brand: "Philips", category: "home", sub: "Kitchen appliances", emoji: "🍟", price: 7999, quality: 0.86, type: "air fryer", tags: ["kitchen", "healthy"], specs: { Capacity: "4.2 L", Power: "1500W" } }),
  t({ name: "Mixer Grinder 750W (3 jars)", brand: "Bajaj", category: "home", sub: "Kitchen appliances", emoji: "🥤", price: 3299, quality: 0.72, type: "mixer", tags: ["kitchen"], specs: { Power: "750W", Jars: 3 } }),
  t({ name: "Ceramic Table Lamp", brand: "Home Centre", category: "home", sub: "Decor", emoji: "🪔", price: 1799, quality: 0.74, type: "lamp", style: "boho", material: "ceramic", tags: ["decor", "lamp"], variants: ["White", "Terracotta"] }),
  t({ name: "Cotton Double Bedsheet with 2 Pillow Covers", brand: "Spaces", category: "home", sub: "Bedding", emoji: "🛏️", price: 1299, quality: 0.72, type: "bedsheet", material: "cotton", tags: ["bedding", "bedroom"], variants: ["Floral Blue", "Geometric Grey", "Mustard"] }),

  // ───────────── Grocery ─────────────
  t({ name: "Fresh Bananas Robusta (1 dozen)", brand: "Fresho", category: "grocery", sub: "Fruits", emoji: "🍌", price: 59, quality: 0.8, type: "fruit", tags: ["fruit", "fresh"] }),
  t({ name: "Shimla Apples (1 kg)", brand: "Fresho", category: "grocery", sub: "Fruits", emoji: "🍎", price: 189, quality: 0.78, type: "fruit", tags: ["fruit", "fresh"] }),
  t({ name: "Alphonso Mangoes (1 dozen)", brand: "Fresho", category: "grocery", sub: "Fruits", emoji: "🥭", price: 799, quality: 0.84, type: "fruit", tags: ["fruit", "seasonal"] }),
  t({ name: "Tomatoes Hybrid (1 kg)", brand: "Fresho", category: "grocery", sub: "Vegetables", emoji: "🍅", price: 42, quality: 0.72, type: "vegetable", tags: ["vegetable", "fresh"] }),
  t({ name: "Onions (1 kg)", brand: "Fresho", category: "grocery", sub: "Vegetables", emoji: "🧅", price: 38, quality: 0.74, type: "vegetable", tags: ["vegetable", "fresh"] }),
  t({ name: "Broccoli (1 pc, ~300g)", brand: "Fresho", category: "grocery", sub: "Vegetables", emoji: "🥦", price: 69, quality: 0.76, type: "vegetable", tags: ["vegetable", "fresh", "healthy"] }),
  t({ name: "Full Cream Milk (1 L)", brand: "Amul", category: "grocery", sub: "Dairy", emoji: "🥛", price: 68, quality: 0.9, type: "milk", tags: ["dairy", "daily"] }),
  t({ name: "Salted Butter (500 g)", brand: "Amul", category: "grocery", sub: "Dairy", emoji: "🧈", price: 285, quality: 0.9, type: "butter", tags: ["dairy"] }),
  t({ name: "Basmati Rice Classic (5 kg)", brand: "India Gate", category: "grocery", sub: "Staples", emoji: "🍚", price: 699, quality: 0.84, type: "rice", tags: ["staples", "rice"] }),
  t({ name: "Whole Wheat Atta (10 kg)", brand: "Aashirvaad", category: "grocery", sub: "Staples", emoji: "🌾", price: 489, quality: 0.86, type: "atta", tags: ["staples", "atta"] }),
  t({ name: "Toor Dal (1 kg)", brand: "Tata Sampann", category: "grocery", sub: "Staples", emoji: "🫘", price: 179, quality: 0.84, type: "dal", tags: ["staples", "protein"] }),
  t({ name: "Cold Pressed Groundnut Oil (1 L)", brand: "Fortune", category: "grocery", sub: "Oils", emoji: "🫗", price: 245, quality: 0.78, type: "oil", tags: ["oil", "cooking"] }),
  t({ name: "Dark Chocolate 70% (100 g)", brand: "Amul", category: "grocery", sub: "Snacks", emoji: "🍫", price: 125, quality: 0.86, type: "chocolate", tags: ["snacks", "chocolate"] }),
  t({ name: "Masala Instant Noodles (Pack of 12)", brand: "Maggi", category: "grocery", sub: "Snacks", emoji: "🍜", price: 168, quality: 0.8, type: "noodles", tags: ["snacks", "instant"] }),
  t({ name: "Green Tea Bags (100 pcs)", brand: "Lipton", category: "grocery", sub: "Beverages", emoji: "🍵", price: 399, quality: 0.78, type: "tea", tags: ["beverages", "healthy"] }),

  // ───────────── Snacks & packaged food ─────────────
  t({ name: "Parle-G Original Glucose Biscuits (800 g)", brand: "Parle", category: "snacks", sub: "Biscuits & cookies", emoji: "🍪", price: 90, quality: 0.9, type: "biscuits", tags: ["biscuits", "cookies", "tea time", "snacks"] }),
  t({ name: "Good Day Cashew Cookies (600 g)", brand: "Britannia", category: "snacks", sub: "Biscuits & cookies", emoji: "🍪", price: 140, quality: 0.86, type: "cookies", tags: ["cookies", "biscuits", "snacks"] }),
  t({ name: "Oreo Chocolate Creme Biscuits (300 g)", brand: "Cadbury", category: "snacks", sub: "Biscuits & cookies", emoji: "🍪", price: 90, quality: 0.88, type: "cookies", tags: ["cookies", "cream biscuits", "chocolate", "snacks", "kids"] }),
  t({ name: "Dark Fantasy Choco Fills (300 g)", brand: "Sunfeast", category: "snacks", sub: "Biscuits & cookies", emoji: "🍪", price: 150, quality: 0.88, type: "cookies", tags: ["cookies", "chocolate", "premium", "snacks"] }),
  t({ name: "Hide & Seek Chocolate Chip Cookies (200 g)", brand: "Parle", category: "snacks", sub: "Biscuits & cookies", emoji: "🍪", price: 60, quality: 0.86, type: "cookies", tags: ["cookies", "chocolate chip", "snacks"] }),
  t({ name: "Marie Gold Biscuits (1 kg)", brand: "Britannia", category: "snacks", sub: "Biscuits & cookies", emoji: "🍪", price: 160, quality: 0.84, type: "biscuits", tags: ["biscuits", "tea time", "light"] }),
  t({ name: "Fruit Cake (300 g)", brand: "Britannia", category: "snacks", sub: "Cakes", emoji: "🍰", price: 110, quality: 0.8, type: "cake", tags: ["cake", "fruit cake", "snacks", "tea time"] }),
  t({ name: "Chocolate Cup Cakes (Pack of 6)", brand: "Winkies", category: "snacks", sub: "Cakes", emoji: "🧁", price: 120, quality: 0.76, type: "cake", tags: ["cake", "cupcakes", "chocolate", "kids"] }),
  t({ name: "Kurkure Masala Munch (90 g)", brand: "Kurkure", category: "snacks", sub: "Chips & namkeen", emoji: "🌶️", price: 20, quality: 0.86, type: "chips", tags: ["kurkure", "chips", "namkeen", "spicy", "snacks", "party"] }),
  t({ name: "Lay's India's Magic Masala (90 g)", brand: "Lay's", category: "snacks", sub: "Chips & namkeen", emoji: "🥔", price: 20, quality: 0.86, type: "chips", tags: ["chips", "lays", "potato chips", "masala", "snacks", "party"] }),
  t({ name: "Bingo Mad Angles Achaari Masti (130 g)", brand: "Bingo", category: "snacks", sub: "Chips & namkeen", emoji: "🔺", price: 40, quality: 0.8, type: "chips", tags: ["chips", "bingo", "snacks", "party"] }),
  t({ name: "Aloo Bhujia (1 kg)", brand: "Haldiram's", category: "snacks", sub: "Chips & namkeen", emoji: "🥨", price: 260, quality: 0.9, type: "namkeen", tags: ["namkeen", "bhujia", "snacks", "tea time"] }),
  t({ name: "Pringles Original (134 g)", brand: "Pringles", category: "snacks", sub: "Chips & namkeen", emoji: "🥔", price: 115, quality: 0.84, type: "chips", tags: ["chips", "pringles", "snacks", "party"] }),
  t({ name: "Doritos Nacho Cheese (150 g)", brand: "Doritos", category: "snacks", sub: "Chips & namkeen", emoji: "🧀", price: 99, quality: 0.8, type: "chips", tags: ["chips", "nachos", "cheese", "snacks", "party"] }),
  t({ name: "Dairy Milk Silk (150 g)", brand: "Cadbury", category: "snacks", sub: "Chocolates", emoji: "🍫", price: 180, quality: 0.92, type: "chocolate", tags: ["chocolate", "gift", "snacks"] }),
  t({ name: "KitKat 4 Finger (Pack of 6)", brand: "Nestlé", category: "snacks", sub: "Chocolates", emoji: "🍫", price: 150, quality: 0.88, type: "chocolate", tags: ["chocolate", "wafer", "snacks"] }),
  t({ name: "5 Star Chocolate Bar (Pack of 10)", brand: "Cadbury", category: "snacks", sub: "Chocolates", emoji: "🍫", price: 200, quality: 0.84, type: "chocolate", tags: ["chocolate", "caramel", "snacks"] }),
  t({ name: "Corn Flakes Original (875 g)", brand: "Kellogg's", category: "snacks", sub: "Breakfast", emoji: "🥣", price: 360, quality: 0.84, type: "cereal", tags: ["breakfast", "cereal", "corn flakes"] }),
  t({ name: "Quaker Oats (1 kg)", brand: "Quaker", category: "snacks", sub: "Breakfast", emoji: "🥣", price: 199, quality: 0.86, type: "oats", tags: ["breakfast", "oats", "healthy", "fitness"] }),
  t({ name: "Crunchy Peanut Butter (1 kg)", brand: "Pintola", category: "snacks", sub: "Spreads", emoji: "🥜", price: 399, quality: 0.86, type: "peanut butter", tags: ["peanut butter", "protein", "breakfast", "fitness"] }),
  t({ name: "Fresh Tomato Ketchup (950 g)", brand: "Kissan", category: "snacks", sub: "Sauces & spreads", emoji: "🍅", price: 135, quality: 0.84, type: "ketchup", tags: ["ketchup", "sauce", "kitchen"] }),
  t({ name: "Mixed Fruit Juice (1 L)", brand: "Real", category: "snacks", sub: "Beverages", emoji: "🧃", price: 120, quality: 0.8, type: "juice", tags: ["juice", "beverages", "drinks"] }),
  t({ name: "Coca-Cola (750 ml)", brand: "Coca-Cola", category: "snacks", sub: "Beverages", emoji: "🥤", price: 40, quality: 0.84, type: "soft drink", tags: ["soft drink", "cola", "beverages", "party"] }),
  t({ name: "Yippee Magic Masala Noodles (Pack of 6)", brand: "Sunfeast", category: "snacks", sub: "Instant food", emoji: "🍜", price: 90, quality: 0.78, type: "noodles", tags: ["noodles", "instant", "snacks"] }),
  t({ name: "California Almonds (500 g)", brand: "Happilo", category: "snacks", sub: "Dry fruits", emoji: "🌰", price: 499, quality: 0.86, type: "dry fruits", tags: ["almonds", "dry fruits", "healthy", "snacks"] }),

  // ───────────── Sports ─────────────
  t({ name: "English Willow Cricket Bat", brand: "SG", category: "sports", sub: "Cricket", emoji: "🏏", price: 5999, quality: 0.82, type: "cricket bat", tags: ["cricket"] }),
  t({ name: "Yoga Mat 6mm Anti-slip", brand: "Boldfit", category: "sports", sub: "Yoga", emoji: "🧘", price: 599, quality: 0.72, type: "yoga mat", tags: ["yoga", "fitness", "gym"], variants: ["Purple", "Blue", "Green"] }),
  t({ name: "Adjustable Dumbbell Set 20kg", brand: "Kore", category: "sports", sub: "Gym", emoji: "🏋️", price: 1899, quality: 0.66, type: "dumbbells", tags: ["gym", "fitness", "home workout"] }),
  t({ name: "Badminton Racquet Nanoray", brand: "Yonex", category: "sports", sub: "Badminton", emoji: "🏸", price: 2490, quality: 0.84, type: "racquet", tags: ["badminton"] }),
  t({ name: "Football Size 5 FIFA Quality", brand: "Nivia", category: "sports", sub: "Football", emoji: "⚽", price: 999, quality: 0.74, type: "football", tags: ["football"] }),
  t({ name: "Hybrid Cycle 21-speed", brand: "Hercules", category: "sports", sub: "Cycling", emoji: "🚲", price: 13999, quality: 0.76, type: "cycle", tags: ["cycling", "fitness"] }),

  // ───────────── Books ─────────────
  t({ name: "Atomic Habits", brand: "James Clear", category: "books", sub: "Self-help", emoji: "📘", price: 499, quality: 0.94, type: "book", tags: ["book", "self-help", "habits"], specs: { Format: "Paperback", Pages: 320 } }),
  t({ name: "The Psychology of Money", brand: "Morgan Housel", category: "books", sub: "Finance", emoji: "📗", price: 349, quality: 0.93, type: "book", tags: ["book", "finance"], specs: { Format: "Paperback", Pages: 252 } }),
  t({ name: "Hands-On Machine Learning (3rd ed.)", brand: "Aurélien Géron", category: "books", sub: "Tech", emoji: "📕", price: 1899, quality: 0.94, type: "book", tags: ["book", "ai", "ml", "coding"], specs: { Format: "Paperback", Pages: 850 } }),
  t({ name: "Ikigai", brand: "Héctor García", category: "books", sub: "Self-help", emoji: "📙", price: 399, quality: 0.86, type: "book", tags: ["book", "self-help"], specs: { Format: "Hardcover", Pages: 208 } }),
  t({ name: "Clean Code", brand: "Robert C. Martin", category: "books", sub: "Tech", emoji: "📕", price: 649, quality: 0.88, type: "book", tags: ["book", "coding"], specs: { Format: "Paperback", Pages: 464 } }),

  // ───────────── Toys ─────────────
  t({ name: "LEGO Classic Creative Bricks (484 pcs)", brand: "LEGO", category: "toys", sub: "Building", emoji: "🧱", price: 2999, quality: 0.93, type: "building set", tags: ["kids", "gift", "creative"] }),
  t({ name: "Remote Control Stunt Car", brand: "Mirana", category: "toys", sub: "RC toys", emoji: "🏎️", price: 1499, quality: 0.62, type: "rc car", tags: ["kids", "gift"], variants: ["Red", "Blue"] }),
  t({ name: "Giant Teddy Bear (3 ft)", brand: "Hug 'n' Feel", category: "toys", sub: "Soft toys", emoji: "🧸", price: 1299, quality: 0.72, type: "soft toy", tags: ["gift", "kids"], variants: ["Brown", "Pink", "White"] }),
  t({ name: "Monopoly Classic Board Game", brand: "Hasbro", category: "toys", sub: "Board games", emoji: "🎲", price: 1199, quality: 0.86, type: "board game", tags: ["family", "games"] }),
];

/** Category-specific pros and complaint pools used to generate reviews. */
export const REVIEW_POOLS: Record<string, { pros: string[]; cons: string[] }> = {
  laptops: {
    pros: ["Great performance for coding", "Display is sharp and bright", "Keyboard feels premium", "Boots up really fast", "Handles multitasking easily", "Good value for the specs"],
    cons: ["heating under load", "battery drains fast while gaming", "fan noise", "average webcam", "bloatware pre-installed", "heavy to carry daily", "speakers are weak"],
  },
  mobiles: {
    pros: ["Camera is excellent in daylight", "Smooth display", "Battery easily lasts a day", "Fast charging is superb", "Clean software"],
    cons: ["heating while charging", "average low-light camera", "battery drain on 5G", "ads in UI", "no charger in box", "slippery back"],
  },
  electronics: {
    pros: ["Sound quality is punchy", "Build quality feels solid", "Connects instantly", "Comfortable for long use", "Battery life as promised"],
    cons: ["connectivity drops", "mic quality is poor", "build feels plasticky", "battery degraded after months", "ear pain after long use", "app is buggy"],
  },
  beauty: {
    pros: ["Absorbs quickly", "No white cast", "Lightweight texture", "Didn't break me out", "Pleasant fragrance"],
    cons: ["white cast", "greasy finish", "stings eyes", "caused breakouts", "tiny quantity for price", "strong fragrance"],
  },
  fashion: {
    pros: ["Fabric is soft", "Fits true to size", "Colour exactly as shown", "Looks premium", "Very comfortable"],
    cons: ["size runs small", "colour faded after wash", "fabric is thin", "loose threads", "different from picture", "zip quality poor"],
  },
  footwear: {
    pros: ["Very comfortable", "Looks exactly like pictures", "Great grip", "Lightweight", "True to size"],
    cons: ["sole wears quickly", "size runs small", "creases fast", "not breathable", "glue coming off"],
  },
  jewellery: {
    pros: ["Beautiful finish", "Looks elegant", "Great packaging for gifting", "Lightweight to wear"],
    cons: ["plating fades", "smaller than expected", "clasp is weak", "causes skin irritation"],
  },
  home: {
    pros: ["Sturdy build", "Easy to assemble", "Looks great in the room", "Worth the money"],
    cons: ["assembly is hard", "colour differs", "wobbly after months", "delivery damaged", "strong smell initially"],
  },
  snacks: {
    pros: ["Tastes great", "Perfect with tea", "Fresh and crunchy", "Kids love it", "Good value pack"],
    cons: ["packet half air", "broken pieces", "too salty", "short expiry", "taste changed recently"],
  },
  grocery: {
    pros: ["Fresh and tasty", "Good packaging", "Delivered on time", "Great quality"],
    cons: ["some pieces damaged", "short expiry", "quantity felt less", "not fresh"],
  },
  sports: {
    pros: ["Good grip", "Durable", "Great for beginners", "Value for money"],
    cons: ["wears out quickly", "smell initially", "slippery", "quality inconsistent"],
  },
  books: {
    pros: ["Life-changing read", "Easy to understand", "Good print quality", "Must-read"],
    cons: ["print quality poor", "pages damaged", "repetitive content"],
  },
  toys: {
    pros: ["Kids love it", "Safe material", "Great gift", "Keeps kids engaged"],
    cons: ["breaks easily", "battery drains fast", "smaller than expected"],
  },
};
