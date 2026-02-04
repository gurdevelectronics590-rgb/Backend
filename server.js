const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middleware ---
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ Gurdev Database Connected Successfully"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    brand: { type: String, required: true },
    image: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },
    createdAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching inventory" });
    }
});


app.get('/api/products/active', async (req, res) => {
    try {
        const activeProducts = await Product.find({ status: 'active' }).sort({ createdAt: -1 });
        res.json(activeProducts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching public catalog" });
    }
});


app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product({
            name: req.body.name,
            brand: req.body.brand,
            image: req.body.image,
            status: 'active' // New items are active by default
        });
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: "Error saving product. Check fields." });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: "Error updating status" });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted permanently" });
    } catch (err) {
        res.status(400).json({ message: "Error deleting product" });
    }
});

app.get("/ping", (req, res) => {
  res.status(200).send("Gurdev API is running ✅");
});

// --- 4. Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Gurdev Backend live on http://localhost:${PORT}`);
});
