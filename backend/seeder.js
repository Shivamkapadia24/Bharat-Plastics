const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product'); // Import your Product model

// Load .env variables
dotenv.config();

// --- Sample Products Array ---
const seedProducts = [

    // --- (Keep all your seedProducts code, just replace the Green Nets part) ---
    
    // --- Green Nets (UPDATED) ---
    {
        name: "100% Premium Shade Net - 20ft x 50m",
        price: 2499,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 100.png",
        shadePercentage: 100,
        size: "20ft x 50m" // New Size
    },
        {
        name: "100% Premium Shade Net - 15ft x 50m",
        price: 2299,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 100.png",
        shadePercentage: 100,
        size: "15ft x 50m" // New Size
    },
            {
        name: "100% Premium Shade Net - 11ft x 50m",
        price: 2099,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 100.png",
        shadePercentage: 100,
        size: "11ft x 50m" // New Size
    },
            {
        name: "100% Premium Shade Net - 7ft x 50m",
        price: 1899,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 100.png",
        shadePercentage: 100,
        size: "7ft x 50m" // New Size
    },
            {
        name: "100% Premium Shade Net - 5.5ft x 50m",
        price: 1699,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 100.png",
        shadePercentage: 100,
        size: "5.5ft x 50m" // New Size
    },
    {
        name: "90% Premium Shade Net - 20ft x 50m",
        price: 1799,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 90.png",
        shadePercentage: 90,
        size: "20ft x 50m" // New Size
    },
        {
        name: "90% Premium Shade Net - 15ft x 50m",
        price: 1599,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 90.png",
        shadePercentage: 90,
        size: "15ft x 50m" // New Size
    },
        {
        name: "90% Premium Shade Net - 11ft x 50m",
        price: 1399,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 90.png",
        shadePercentage: 90,
        size: "11ft x 50m" // New Size
    },
        {
        name: "90% Premium Shade Net - 7ft x 50m",
        price: 1199,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 90.png",
        shadePercentage: 90,
        size: "7ft x 50m" // New Size
    },
        {
        name: "90% Premium Shade Net - 7ft x 50m",
        price: 999,
        category: "Green Nets",
        quality: "Premium",
        imageUrl: "images/green net 90.png",
        shadePercentage: 90,
        size: "7ft x 50m" // New Size
    },
    {
        name: "75% UV Resistant Shade Net - 20ft x 50m",
        price: 1699,
        category: "Green Nets",
        quality: "Standard",
        imageUrl: "images/green net 75.png", // Keep the farm image
        shadePercentage: 75,
        size: "20ft x 50m" // New Size
    },
        {
        name: "75% UV Resistant Shade Net - 15ft x 50m",
        price: 1499,
        category: "Green Nets",
        quality: "Standard",
        imageUrl: "images/green net 75.png", // Keep the farm image
        shadePercentage: 75,
        size: "15ft x 50m" // New Size
    },
        {
        name: "75% UV Resistant Shade Net - 11ft x 50m",
        price: 1299,
        category: "Green Nets",
        quality: "Standard",
        imageUrl: "images/green net 75.png", // Keep the farm image
        shadePercentage: 75,
        size: "11ft x 50m" // New Size
    },
        {
        name: "75% UV Resistant Shade Net - 7ft x 50m",
        price: 1099,
        category: "Green Nets",
        quality: "Standard",
        imageUrl: "images/green net 75.png", // Keep the farm image
        shadePercentage: 75,
        size: "7ft x 50m" // New Size
    },
        {
        name: "75% UV Resistant Shade Net - 5.5ft x 50m",
        price: 899,
        category: "Green Nets",
        quality: "Standard",
        imageUrl: "images/green net 75.png", // Keep the farm image
        shadePercentage: 75,
        size: "5.5ft x 50m" // New Size
    },
    
    {
        name: "50% Economy Shade Net - 20ft x 50m",
        price: 1599, // Made it cheaper to match economy
        category: "Green Nets",
        quality: "Economy",
        imageUrl: "images/green net 50.png", // Keep the greenhouse image
        shadePercentage: 50,
        size: "20ft x 50m" // New Size
    },
        {
        name: "50% Economy Shade Net - 15ft x 50m",
        price: 1399, // Made it cheaper to match economy
        category: "Green Nets",
        quality: "Economy",
        imageUrl: "images/green net 50.png", // Keep the greenhouse image
        shadePercentage: 50,
        size: "15ft x 50m" // New Size
    },
        {
        name: "50% Economy Shade Net - 11ft x 50m",
        price: 1199, // Made it cheaper to match economy
        category: "Green Nets",
        quality: "Economy",
        imageUrl: "images/green net 50.png", // Keep the greenhouse image
        shadePercentage: 50,
        size: "11ft x 50m" // New Size
    },
        {
        name: "50% Economy Shade Net - 7ft x 50m",
        price: 999, // Made it cheaper to match economy
        category: "Green Nets",
        quality: "Economy",
        imageUrl: "images/green net 50.png", // Keep the greenhouse image
        shadePercentage: 50,
        size: "7ft x 50m" // New Size
    },
    // I'll add one more for the 5.5ft filter
    {
        name: "50% Economy Shade Net - 5.5ft x 50m",
        price: 799, 
        category: "Green Nets",
        quality: "Economy",
        imageUrl: "images/green net 50.png",
        shadePercentage: 50,
        size: "5.5ft x 50m" // New Size
    },
    // --- End of Green Nets ---

    // --- (Keep your Tarpaulins and Accessories sections) ---
// --- Tarpaulins ---
// --- (Keep your Green Nets section above this) ---

// --- Tarpaulins (UPDATED) ---
{
    name: "Premium Tarpaulin Roll (36ft x 50m)",
    price: 8999, // Adjusted price for a large premium roll
    category: "Tarpaulins",
    quality: "Premium",
    imageUrl: "images/premium 36ft.png", // Blue tarp image
    size: "36ft x 50m", // New Size
},
{
    name: "Premium Tarpaulin Roll (30ft x 50m)",
    price: 7999, // Adjusted price for a large premium roll
    category: "Tarpaulins",
    quality: "Premium",
    imageUrl: "images/premium 30ft.png", // Blue tarp image
    size: "30ft x 50m", // New Size
},
{
    name: "Premium Tarpaulin Roll (24ft x 50m)",
    price: 6999, // Adjusted price for a large premium roll
    category: "Tarpaulins",
    quality: "Premium",
    imageUrl: "images/premium 24ft.png", // Blue tarp image
    size: "24ft x 50m", // New Size
},
{
    name: "Premium Tarpaulin Roll (18ft x 50m)",
    price: 5999, // Adjusted price for a large premium roll
    category: "Tarpaulins",
    quality: "Premium",
    imageUrl: "images/premium 18ft.png", // Blue tarp image
    size: "18ft x 50m", // New Size
},
{
    name: "Premium Tarpaulin Roll (12ft x 50m)",
    price: 4999, // Adjusted price for a large premium roll
    category: "Tarpaulins",
    quality: "Premium",
    imageUrl: "images/premium 12ft.png", // Blue tarp image
    size: "12ft x 50m", // New Size
},
{
    name: "Standard Tarpaulin Roll (36ft x 50m)",
    price: 5999, // Adjusted price
    category: "Tarpaulins",
    quality: "Standard",
    imageUrl: "images/standard 36ft.png",
    size: "36ft x 50m", // New Size
},
{
    name: "Standard Tarpaulin Roll (30ft x 50m)",
    price: 4999, // Adjusted price
    category: "Tarpaulins",
    quality: "Standard",
    imageUrl: "images/standard 30ft.png",
    size: "30ft x 50m", // New Size
},
{
    name: "Standard Tarpaulin Roll (24ft x 50m)",
    price: 3999, // Adjusted price
    category: "Tarpaulins",
    quality: "Standard",
    imageUrl: "images/standard 24ft.png",
    size: "24ft x 50m", // New Size
},
{
    name: "Standard Tarpaulin Roll (18ft x 50m)",
    price: 2999, // Adjusted price
    category: "Tarpaulins",
    quality: "Standard",
    imageUrl: "images/standard 18ft.png",
    size: "18ft x 50m", // New Size
},
{
    name: "Standard Tarpaulin Roll (12ft x 50m)",
    price: 1999, // Adjusted price
    category: "Tarpaulins",
    quality: "Standard",
    imageUrl: "images/standard 12ft.png",
    size: "12ft x 50m", // New Size
},
{
    name: "Economy Tarpaulin Roll (36ft x 50m)",
    price: 4999, // Adjusted price
    category: "Tarpaulins",
    quality: "Economy",
    imageUrl: "images/economy 36ft.png",
    size: "36ft x 50m", // New Size
},
{
    name: "Economy Tarpaulin Roll (30ft x 50m)",
    price: 3999, // Adjusted price
    category: "Tarpaulins",
    quality: "Economy",
    imageUrl: "images/economy 30ft.png",
    size: "30ft x 50m", // New Size
},
{
    name: "Economy Tarpaulin Roll (24ft x 50m)",
    price: 2999, // Adjusted price
    category: "Tarpaulins",
    quality: "Economy",
    imageUrl: "images/economy 24ft.png",
    size: "24ft x 50m", // New Size
},
{
    name: "Economy Tarpaulin Roll (18ft x 50m)",
    price: 1999, // Adjusted price
    category: "Tarpaulins",
    quality: "Economy",
    imageUrl: "images/economy 18ft.png",
    size: "18ft x 50m", // New Size
},
{
    name: "Economy Tarpaulin Roll (12ft x 50m)",
    price: 999, // Adjusted price
    category: "Tarpaulins",
    quality: "Economy",
    imageUrl: "images/economy 12ft.png",
    size: "12ft x 50m", // New Size
},
// --- End of Tarpaulins ---

// --- (Keep your Tirpal and Accessories sections below this) ---
    // --- Accessories ---
// --- (Keep all your Green Nets and Tarpaulins products above this) ---

// --- Accessories (Replace this section) ---
{
    name: "Shade Net Installation Clips (Pack of 50)",
    price: 349,
    category: "Fasteners", // <-- CHANGED
    quality: "N/A",
    imageUrl: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
},
{
    name: "Durable Nylon Rope (8mm, 50 meters)",
    price: 499,
    category: "Tensioning", // <-- CHANGED
    quality: "N/A",
    imageUrl: "https://images.unsplash.com/photo-1599494029215-027b41aa5415?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
},
{
    name: "Heavy-Duty Tarp Repair Tape (10 meters)",
    price: 299,
    category: "Repair", // <-- CHANGED
    quality: "N/A",
    imageUrl: "https://images.unsplash.com/photo-1607352317765-a2432ba06461?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
},
// ... (Your Accessories products are above this) ...

// --- NEW TIRPAL SECTION ---
{
    name: "Tirpal Sheet - 250 GSM",
    price: 700,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 9x12ft.png", // Using the blue tarp image
    size: "9ft*12ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 800,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 15x12ft.png", // Using the blue tarp image
    size: "15ft*12ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 900,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 18x12ft.png", // Using the blue tarp image
    size: "18ft*12ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 1000,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 24x18ft.png", // Using the blue tarp image
    size: "24ft*18ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 1100,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 30x30ft.png", // Using the blue tarp image
    size: "30ft*30ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 1200,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 30x36ft.png", // Using the blue tarp image
    size: "30ft*36ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 1300,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 36x36ft.png", // Using the blue tarp image
    size: "36ft*36ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 1400,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 40x24ft.png", // Using the blue tarp image
    size: "40ft*24ft", // From your list
    gsm: 250
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 1500,
    category: "Tirpal",
    quality: "250gsm",
    imageUrl: "images/250gsm 50x51ft.png", // Using the blue tarp image
    size: "50ft*51ft", // From your list
    gsm: 250
},

{
    name: "Tirpal Sheet - 200 GSM",
    price: 600,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 9x12ft.png", // Using the blue tarp image
    size: "9ft*12ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 700,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 15x12ft.png", // Using the blue tarp image
    size: "15ft*12ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 800,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 18x12ft.png", // Using the blue tarp image
    size: "18ft*12ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 900,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 24x18ft.png", // Using the blue tarp image
    size: "24ft*18ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 1000,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 30x30ft.png", // Using the blue tarp image
    size: "30ft*30ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 1100,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 30x36ft.png", // Using the blue tarp image
    size: "30ft*36ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 1200,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 36x36ft.png", // Using the blue tarp image
    size: "36ft*36ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 1300,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 40x24ft.png", // Using the blue tarp image
    size: "40ft*24ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 200 GSM",
    price: 1400,
    category: "Tirpal",
    quality: "200gsm",
    imageUrl: "images/200gsm 50x51ft.png", // Using the blue tarp image
    size: "50ft*51ft", // From your list
    gsm: 200
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 500,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 9x12ft.png", // Using the blue tarp image
    size: "9ft*12ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 600,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 15x12ft.png", // Using the blue tarp image
    size: "15ft*12ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 700,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 18x12ft.png", // Using the blue tarp image
    size: "18ft*12ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 800,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 24x18ft.png", // Using the blue tarp image
    size: "24ft*18ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 900,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 30x30ft.png", // Using the blue tarp image
    size: "30ft*30ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 1000,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 30x36ft.png", // Using the blue tarp image
    size: "30ft*36ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 1100,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 36x36ft.png", // Using the blue tarp image
    size: "36ft*36ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 250 GSM",
    price: 1200,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 40x24ft.png", // Using the blue tarp image
    size: "40ft*24ft", // From your list
    gsm: 160
},
{
    name: "Tirpal Sheet - 160 GSM",
    price: 1300,
    category: "Tirpal",
    quality: "160gsm",
    imageUrl: "images/160gsm 50x51ft.png", // Using the blue tarp image
    size: "50ft*51ft", // From your list
    gsm: 160
}
// --- END NEW TIRPAL SECTION ---

]; // <-- This is the end of the seedProducts array

// --- (The rest of your seeder.js file stays the same) ---



// --- Seeder Function ---
const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected for seeding...');

        // Clear existing products
        await Product.deleteMany();
        console.log('Products destroyed...');

        // Insert new seed products
        await Product.insertMany(seedProducts);
        console.log('Products imported successfully!');

        await mongoose.disconnect();
        console.log('MongoDB disconnected.');
        process.exit();

    } catch (error) {
        console.error(`Error with seeding script: ${error}`);
        process.exit(1); // Exit with failure
    }
};

// --- Run the Seeder ---
// This calls the function immediately when you run `node seeder.js`
importData();