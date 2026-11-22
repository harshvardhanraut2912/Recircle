const { MongoClient, GridFSBucket, ObjectId } = require('mongodb');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
const https = require('https');
const http = require('http');

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/recircle';
const dbName = process.env.MONGODB_DB || 'recircle';
const BUCKET_NAME = 'product_images';

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    protocol.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch image from ${url}: Status ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function uploadToGridFS(bucket, buffer, filename, metadata) {
  const fileId = new ObjectId();
  const cleanFilename = filename.replace(/\.[^/.]+$/, '') + '.webp';

  const optimizedBuffer = await sharp(buffer)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer();

  const uploadStream = bucket.openUploadStreamWithId(fileId, cleanFilename, {
    contentType: 'image/webp',
    metadata: {
      ...metadata,
      size: optimizedBuffer.length,
      originalFilename: filename,
      uploadDate: new Date(),
    },
  });

  return new Promise((resolve, reject) => {
    const { Readable } = require('stream');
    Readable.from(optimizedBuffer)
      .pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve({
          fileId: fileId.toString(),
          url: `/api/images/${fileId.toString()}`,
          filename: cleanFilename,
          mimeType: 'image/webp',
          size: optimizedBuffer.length,
          isPrimary: metadata.isPrimary || false,
          position: metadata.position || 0,
        });
      });
  });
}

// Fallback high quality SVG placeholder generator if internet is restricted
async function createFallbackImage(category, title, index) {
  const colors = [
    { bg: '#0d3829', fg: '#34d399' },
    { bg: '#10b981', fg: '#064e3b' },
    { bg: '#064e3b', fg: '#d7f3e4' },
    { bg: '#1e293b', fg: '#94a3b8' },
  ];
  const c = colors[index % colors.length];
  const svg = `
  <svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
    <rect width="800" height="600" fill="${c.bg}" />
    <circle cx="400" cy="240" r="100" fill="${c.fg}" opacity="0.15" />
    <text x="400" y="230" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle">
      ${category.toUpperCase()}
    </text>
    <text x="400" y="270" font-family="system-ui, sans-serif" font-size="20" fill="${c.fg}" text-anchor="middle">
      ${title}
    </text>
    <text x="400" y="520" font-family="system-ui, sans-serif" font-size="16" fill="#ffffff" opacity="0.7" text-anchor="middle">
      ReCircle Verified Pre-Loved • Verified Quality
    </text>
  </svg>`;
  return sharp(Buffer.from(svg)).webp().toBuffer();
}

const SEED_PRODUCTS = [
  {
    title: 'Apple MacBook Pro 14" (M2 Pro, 16GB, 512GB SSD) - Space Gray',
    description: 'Immaculate condition MacBook Pro M2 Pro 14-inch. Used lightly for UI design and remote coding in a smoke-free home studio. Battery health is at 96% with only 64 cycles. Includes original MagSafe cable, 67W power adapter, and retail box. No scratches or dead pixels.',
    category: 'Electronics',
    subcategory: 'Laptops & Computers',
    brand: 'Apple',
    model: 'MacBook Pro 14 M2',
    condition: 'Like New',
    conditionNotes: 'Zero scratches, battery health 96%, original packaging.',
    price: 115000,
    originalPrice: 175000,
    savingsPercentage: 30,
    estimatedCo2Savings: 180,
    purchaseYear: 2023,
    hasReceipt: true,
    hasWarranty: true,
    hasOriginalBox: true,
    location: { city: 'Bangalore', state: 'Karnataka', neighborhood: 'Indiranagar', zipCode: '560038' },
    deliveryOptions: { pickup: true, delivery: true, shipping: true },
    seller: {
      id: 'seller-recircle-user',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4.95,
      reviewsCount: 28,
      verified: true,
      memberSince: 'March 2024',
      responseTime: 'Replies in 10 mins',
      phone: '+91 98765 43210'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  {
    title: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones - Black',
    description: 'Industry-leading noise canceling headphones with dual processors and 8 microphones. Phenomenal sound quality with LDAC support. Purchased for business travel, used fewer than 10 times. Comes with the premium hard carry case, 3.5mm cable, and USB-C charging cord.',
    category: 'Electronics',
    subcategory: 'Audio & Headphones',
    brand: 'Sony',
    model: 'WH-1000XM5',
    condition: 'Like New',
    conditionNotes: 'Pristine ear cushions, headband in mint state.',
    price: 21990,
    originalPrice: 34990,
    savingsPercentage: 38,
    estimatedCo2Savings: 25,
    purchaseYear: 2023,
    hasReceipt: true,
    hasWarranty: false,
    hasOriginalBox: true,
    location: { city: 'Mumbai', state: 'Maharashtra', neighborhood: 'Bandra West', zipCode: '400050' },
    deliveryOptions: { pickup: true, delivery: true, shipping: true },
    seller: {
      id: 'seller-priya',
      name: 'Priya Deshmukh',
      email: 'priya.d@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 16,
      verified: true,
      memberSince: 'January 2024',
      responseTime: 'Replies in 25 mins'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  {
    title: 'Herman Miller Aeron Ergonomic Office Chair (Size B, Fully Loaded)',
    description: 'The gold standard in ergonomic office seating. Size B (Medium) featuring PostureFit SL back support, fully adjustable armrests, forward tilt, and tilt limiter. Pellicle mesh is tight and free of snags. Mechanisms all lubricated and working smoothly.',
    category: 'Furniture',
    subcategory: 'Chairs & Seating',
    brand: 'Herman Miller',
    model: 'Aeron Size B',
    condition: 'Very Good',
    conditionNotes: 'Minor scuffs on lower base castors, mesh in 100% mint condition.',
    price: 58000,
    originalPrice: 125000,
    savingsPercentage: 55,
    estimatedCo2Savings: 72,
    purchaseYear: 2022,
    hasReceipt: false,
    hasWarranty: true,
    hasOriginalBox: false,
    location: { city: 'Bangalore', state: 'Karnataka', neighborhood: 'Koramangala', zipCode: '560034' },
    deliveryOptions: { pickup: true, delivery: true, shipping: false },
    seller: {
      id: 'seller-vikram',
      name: 'Vikram Mehta',
      email: 'vikram.m@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      rating: 4.85,
      reviewsCount: 34,
      verified: true,
      memberSince: 'February 2023',
      responseTime: 'Replies within an hour'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1580481077195-c3a821a58875?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  {
    title: 'Trek FX 3 Disc Hybrid Bicycle (Size L) - Matte Dnister Black',
    description: 'Versatile hybrid fitness bike. Lightweight Alpha Gold Aluminum frame with carbon fork, Shimano 1x10 drivetrain, and Shimano hydraulic disc brakes for stopping in all weather conditions. Equipped with puncture-resistant Bontrager H2 tires and ergonomic grips. Recently serviced with fresh chain.',
    category: 'Bicycles & Mobility',
    subcategory: 'Hybrid & City Bikes',
    brand: 'Trek',
    model: 'FX 3 Disc',
    condition: 'Very Good',
    conditionNotes: 'Fresh brake pads, minor surface mark on top tube.',
    price: 38000,
    originalPrice: 78000,
    savingsPercentage: 51,
    estimatedCo2Savings: 110,
    purchaseYear: 2023,
    hasReceipt: true,
    hasWarranty: true,
    hasOriginalBox: false,
    location: { city: 'Delhi', state: 'NCR', neighborhood: 'Hauz Khas', zipCode: '110016' },
    deliveryOptions: { pickup: true, delivery: true, shipping: false },
    seller: {
      id: 'seller-rohit',
      name: 'Rohit Verma',
      email: 'rohit.v@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 19,
      verified: true,
      memberSince: 'November 2023',
      responseTime: 'Replies in 5 mins'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  {
    title: 'Fujifilm X-T30 II Mirrorless Camera + XF 18-55mm f/2.8-4 OIS Lens',
    description: 'Beloved retro-style mirrorless camera featuring Fujifilm celebrated film simulations and 26.1MP X-Trans CMOS 4 sensor. Includes the sharp XF 18-55mm f/2.8-4 lens, 2 genuine Fujifilm batteries, dual battery charger, Peak Design strap, and 64GB SanDisk Extreme Pro SD card.',
    category: 'Electronics',
    subcategory: 'Cameras & Photography',
    brand: 'Fujifilm',
    model: 'X-T30 II',
    condition: 'Like New',
    conditionNotes: 'Under 3,500 shutter actuations. Screen protector installed from day one.',
    price: 74900,
    originalPrice: 118000,
    savingsPercentage: 36,
    estimatedCo2Savings: 42,
    purchaseYear: 2023,
    hasReceipt: true,
    hasWarranty: false,
    hasOriginalBox: true,
    location: { city: 'Bangalore', state: 'Karnataka', neighborhood: 'HSR Layout', zipCode: '560102' },
    deliveryOptions: { pickup: true, delivery: true, shipping: true },
    seller: {
      id: 'seller-recircle-user',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4.95,
      reviewsCount: 28,
      verified: true,
      memberSince: 'March 2024',
      responseTime: 'Replies in 10 mins'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  {
    title: 'Mid-Century Modern Solid Teakwood Coffee Table with Brass Accents',
    description: 'Handcrafted vintage-inspired Scandinavian coffee table made of 100% solid reclaimed teak wood. Beautiful grain with organic amber patina and angled tapered legs tipped with brushed brass ferrules. Lower slatted shelf perfect for books and magazines.',
    category: 'Furniture',
    subcategory: 'Living Room Tables',
    brand: 'Article',
    model: 'Sven Teak Table',
    condition: 'Very Good',
    conditionNotes: 'Treated with natural beeswax, minimal natural wood grain markings.',
    price: 18500,
    originalPrice: 42000,
    savingsPercentage: 56,
    estimatedCo2Savings: 55,
    purchaseYear: 2022,
    hasReceipt: false,
    hasWarranty: false,
    hasOriginalBox: false,
    location: { city: 'Mumbai', state: 'Maharashtra', neighborhood: 'Juhu', zipCode: '400049' },
    deliveryOptions: { pickup: true, delivery: true, shipping: false },
    seller: {
      id: 'seller-ananya',
      name: 'Ananya Roy',
      email: 'ananya.r@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      rating: 4.88,
      reviewsCount: 12,
      verified: true,
      memberSince: 'August 2023',
      responseTime: 'Replies in 30 mins'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  {
    title: 'Patagonia Classic Retro-X Windproof Fleece Jacket (Unisex Medium)',
    description: 'Iconic Patagonia Retro-X jacket in Natural / Pelican colorway with contrast pocket. Made with 85% recycled polyester fleece and a breathable, windproof membrane barrier. Warm, durable, and sustainable staple. Worn only during one winter trip.',
    category: 'Fashion',
    subcategory: 'Jackets & Outerwear',
    brand: 'Patagonia',
    model: 'Retro-X Classic',
    condition: 'Like New',
    conditionNotes: 'Freshly eco-laundered, zero fleece pilling, zippers smooth.',
    price: 11500,
    originalPrice: 22000,
    savingsPercentage: 46,
    estimatedCo2Savings: 28,
    purchaseYear: 2023,
    hasReceipt: true,
    hasWarranty: true,
    hasOriginalBox: false,
    location: { city: 'Bangalore', state: 'Karnataka', neighborhood: 'Whitefield', zipCode: '560066' },
    deliveryOptions: { pickup: true, delivery: true, shipping: true },
    seller: {
      id: 'seller-priya',
      name: 'Priya Deshmukh',
      email: 'priya.d@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewsCount: 16,
      verified: true,
      memberSince: 'January 2024',
      responseTime: 'Replies in 25 mins'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=1000&auto=format&fit=crop&q=80'
    ]
  },
  {
    title: 'Kindle Paperwhite Signature Edition (32GB, Wireless Charging, Auto-Light)',
    description: 'Premium e-reader with 6.8" 300 ppi glare-free display, adjustable warm light, auto-adjusting light sensor, and wireless charging. 32GB holds thousands of books. Water-resistant (IPX8). Battery lasts up to 10 weeks on a single charge. Includes Amazon cork leather case.',
    category: 'Books & Media',
    subcategory: 'E-Readers & Tablets',
    brand: 'Amazon Kindle',
    model: 'Paperwhite Signature 11th Gen',
    condition: 'Like New',
    conditionNotes: 'Zero micro-scratches, case included, USB-C cable included.',
    price: 9999,
    originalPrice: 17999,
    savingsPercentage: 42,
    estimatedCo2Savings: 14,
    purchaseYear: 2023,
    hasReceipt: true,
    hasWarranty: false,
    hasOriginalBox: true,
    location: { city: 'Pune', state: 'Maharashtra', neighborhood: 'Kalyani Nagar', zipCode: '411006' },
    deliveryOptions: { pickup: true, delivery: true, shipping: true },
    seller: {
      id: 'seller-rohit',
      name: 'Rohit Verma',
      email: 'rohit.v@recircle.org',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      rating: 5.0,
      reviewsCount: 19,
      verified: true,
      memberSince: 'November 2023',
      responseTime: 'Replies in 5 mins'
    },
    imageSources: [
      'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=1000&auto=format&fit=crop&q=80'
    ]
  }
];

const SAMPLE_REQUESTS = [
  {
    productTitle: 'Apple MacBook Pro 14" (M2 Pro, 16GB, 512GB SSD) - Space Gray',
    productPrice: 115000,
    offeredPrice: 110000,
    message: 'Hi Aarav! Is this still available? Would you be willing to do ₹1,10,000 with local pickup in Indiranagar tomorrow afternoon?',
    buyerId: 'buyer-kavita',
    buyerName: 'Kavita Menon',
    buyerEmail: 'kavita.m@gmail.com',
    buyerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'new',
    deliveryType: 'pickup',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    productTitle: 'Fujifilm X-T30 II Mirrorless Camera + XF 18-55mm f/2.8-4 OIS Lens',
    productPrice: 75000,
    offeredPrice: 72000,
    message: 'Hello! I am ready to purchase for ₹72,000. Can you ship to HSR Layout with insured courier?',
    buyerId: 'buyer-tanya',
    buyerName: 'Tanya Sengupta',
    buyerEmail: 'tanya.s@gmail.com',
    buyerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'accepted',
    deliveryType: 'shipping',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    productTitle: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones - Black',
    productPrice: 21990,
    offeredPrice: 20500,
    message: 'Hey Priya, would love to buy this today! I live in Bandra as well, can meet near Carter Road for ₹20,500.',
    buyerId: 'buyer-dev',
    buyerName: 'Dev Kapoor',
    buyerEmail: 'dev.k@gmail.com',
    buyerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    status: 'completed',
    deliveryType: 'pickup',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  }
];

async function seed() {
  console.log('Connecting to MongoDB at:', uri);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB database:', dbName);

    const db = client.db(dbName);
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });

    // Clear existing data for fresh clean state
    console.log('Clearing old products, requests and GridFS files...');
    await db.collection('products').deleteMany({});
    await db.collection('requests').deleteMany({});

    // Drop GridFS chunks and files if existing
    try {
      await db.collection(`${BUCKET_NAME}.files`).deleteMany({});
      await db.collection(`${BUCKET_NAME}.chunks`).deleteMany({});
    } catch (e) {
      // ignore
    }

    // Seed demo user account
    const users = db.collection('users');
    const existingUser = await users.findOne({ phone: '9876543210' });
    if (!existingUser) {
      const hash = await bcrypt.hash('password123', 10);
      await users.insertOne({
        username: 'Aarav Sharma',
        phone: '9876543210',
        email: 'aarav.sharma@recircle.org',
        passwordHash: hash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rating: 4.95,
        reviewsCount: 28,
        verified: true,
        memberSince: 'March 2024',
        city: 'Bangalore',
        createdAt: new Date().toISOString(),
      });
      console.log('Seeded demo user Aarav Sharma (Phone: 9876543210, Password: password123)');
    }

    console.log(`Uploading ${SEED_PRODUCTS.length} products with GridFS image binaries...`);

    const insertedProducts = [];

    for (let i = 0; i < SEED_PRODUCTS.length; i++) {
      const p = SEED_PRODUCTS[i];
      const productId = new ObjectId();
      const images = [];

      for (let j = 0; j < p.imageSources.length; j++) {
        const srcUrl = p.imageSources[j];
        let buffer;
        try {
          buffer = await fetchBuffer(srcUrl);
        } catch (fetchErr) {
          console.warn(`Could not fetch remote image ${srcUrl}, using high-res fallback SVG:`, fetchErr.message);
          buffer = await createFallbackImage(p.category, p.title, j);
        }

        const uploadedImage = await uploadToGridFS(
          bucket,
          buffer,
          `product_${i + 1}_img_${j + 1}.jpg`,
          {
            sellerId: p.seller.id,
            productId: productId,
            isPrimary: j === 0,
            position: j,
          }
        );

        images.push(uploadedImage);
      }

      const primaryImg = images.find((im) => im.isPrimary) || images[0];

      const productDoc = {
        _id: productId,
        title: p.title,
        description: p.description,
        category: p.category,
        subcategory: p.subcategory,
        brand: p.brand,
        model: p.model,
        condition: p.condition,
        conditionNotes: p.conditionNotes,
        price: p.price,
        originalPrice: p.originalPrice,
        savingsPercentage: p.savingsPercentage,
        estimatedCo2Savings: p.estimatedCo2Savings,
        purchaseYear: p.purchaseYear,
        hasReceipt: p.hasReceipt,
        hasWarranty: p.hasWarranty,
        hasOriginalBox: p.hasOriginalBox,
        location: p.location,
        deliveryOptions: p.deliveryOptions,
        images,
        primaryImageUrl: primaryImg.url,
        seller: p.seller,
        status: 'active',
        views: Math.floor(Math.random() * 85) + 12,
        inquiries: Math.floor(Math.random() * 6) + 1,
        createdAt: new Date(Date.now() - (i * 86400000 + Math.random() * 3600000)).toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection('products').insertOne(productDoc);
      insertedProducts.push(productDoc);
      console.log(`  [OK] Inserted product "${p.title.slice(0, 35)}..." with ${images.length} GridFS images`);
    }

    // Seed sample requests
    console.log('Seeding sample purchase requests...');
    for (const req of SAMPLE_REQUESTS) {
      const matchProduct = insertedProducts.find((ip) => ip.title === req.productTitle) || insertedProducts[0];
      await db.collection('requests').insertOne({
        _id: new ObjectId(),
        productId: matchProduct._id.toString(),
        productTitle: matchProduct.title,
        productImage: matchProduct.primaryImageUrl,
        productPrice: matchProduct.price,
        sellerId: matchProduct.seller.id,
        buyerId: req.buyerId,
        buyerName: req.buyerName,
        buyerEmail: req.buyerEmail,
        buyerAvatar: req.buyerAvatar,
        offeredPrice: req.offeredPrice,
        message: req.message,
        status: req.status,
        deliveryType: req.deliveryType,
        createdAt: req.createdAt,
        updatedAt: new Date().toISOString(),
      });
    }

    console.log('SUCCESS! MongoDB Atlas/Local GridFS seeding complete.');
  } catch (err) {
    console.error('Seeding failed with error:', err);
  } finally {
    await client.close();
  }
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
