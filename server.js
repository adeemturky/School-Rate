const { name } = require('ejs');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3006;

// Connect to MongoDB
mongoose.connect('mongodb://0.0.0.0:27017/SchoolRate', { useNewUrlParser: true, useUnifiedTopology: true });

// Schema and Model
const flowerSchema = new mongoose.Schema({
    name: String,
    rate: Number,
    description: String,
    imagePath: String
});

const Flower = mongoose.model('Flower', flowerSchema);

// Set up EJS and static directory
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Set up multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
app.get('/', async (req, res) => {
    const flowers = await Flower.find();
    res.render('index', { flowers: flowers });
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/flowers', upload.single('image'), async (req, res) => {
    const flower = new Flower({
        name: req.body.name,
        rate: req.body.rate,
        description: req.body.description,
        imagePath: '/images/' + req.file.filename
    });
    await flower.save();
    res.redirect('/');
});

app.get('/flowers/:id/edit', async (req, res) => {
    const flower = await Flower.findById(req.params.id);
    res.render('edit', { flower: flower });
});

app.post('/flowers/:id', upload.single('image'), async (req, res) => {
    const flower = await Flower.findById(req.params.id);
    flower.name = req.body.name;
    flower.rate = req.body.rate;
    flower.description = req.body.description;
    
    if (req.file) {
        flower.imagePath = '/images/' + req.file.filename;
    }
    await flower.save();
    res.redirect('/');
});

app.post('/flowers/:id/delete', async (req, res) => {
    await Flower.findByIdAndDelete(req.params.id);
    res.redirect('/');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
