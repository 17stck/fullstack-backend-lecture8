// index.js - Main entry point
const express = require('express');
const Sequelize = require('sequelize');
const axios = require('axios');
const bodyParser = require('body-parser');

// ========== BACKEND API SETUP (Port 3000) ==========
const apiApp = express();
apiApp.use(express.json());

// Create database connection
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    storage: './database/SQBooks.sqlite',
    logging: false
});

// Define Book model
const Book = sequelize.define('book', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    author: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

// Sync database
sequelize.sync();

// API Routes
apiApp.get('/books', async (req, res) => {
    try {
        const books = await Book.findAll();
        res.json(books);
    } catch (err) {
        res.status(500).send(err);
    }
});

apiApp.get('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            res.status(404).send('Book not found');
        } else {
            res.json(book);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

apiApp.post('/books', async (req, res) => {
    try {
        const book = await Book.create(req.body);
        res.send(book);
    } catch (err) {
        res.status(500).send(err);
    }
});

apiApp.put('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            res.status(404).send('Book not found');
        } else {
            await book.update(req.body);
            res.send(book);
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

apiApp.delete('/books/:id', async (req, res) => {
    try {
        const book = await Book.findByPk(req.params.id);
        if (!book) {
            res.status(404).send('Book not found');
        } else {
            await book.destroy();
            res.send({});
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

// Start API Server
const API_PORT = 3000;
apiApp.listen(API_PORT, () => {
    console.log(`✅ API Server listening on port ${API_PORT}`);
    console.log(`📡 API URL: http://localhost:${API_PORT}/books`);
});

// ========== FRONTEND SERVER SETUP (Port 5500) ==========
const frontendApp = express();
const base_url = "http://localhost:3000";

// Set view engine
frontendApp.set('view engine', 'ejs');

// Middleware
frontendApp.use(bodyParser.json());
frontendApp.use(bodyParser.urlencoded({ extended: false }));

// Serve static files (สำคัญ! - เพิ่มบรรทัดนี้)
frontendApp.use(express.static(__dirname));
frontendApp.use('/css', express.static(__dirname + '/style'));

// Frontend Routes
frontendApp.get("/", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/books');
        res.render("books", { books: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching books');
    }
});

frontendApp.get("/book/:id", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/books/' + req.params.id);
        res.render("book", { book: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching book');
    }
});

frontendApp.get("/create", (req, res) => {
    res.render("create");
});

frontendApp.post("/create", async (req, res) => {
    try {
        const data = { title: req.body.title, author: req.body.author };
        await axios.post(base_url + '/books', data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating book');
    }
});

frontendApp.get("/update/:id", async (req, res) => {
    try {
        const response = await axios.get(base_url + '/books/' + req.params.id);
        res.render("update", { book: response.data });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching book for update');
    }
});

frontendApp.post("/update/:id", async (req, res) => {
    try {
        const data = { title: req.body.title, author: req.body.author };
        await axios.put(base_url + '/books/' + req.params.id, data);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating book');
    }
});

frontendApp.get("/delete/:id", async (req, res) => {
    try {
        await axios.delete(base_url + '/books/' + req.params.id);
        res.redirect("/");
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting book');
    }
});

// Start Frontend Server
const FRONTEND_PORT = 5500;
frontendApp.listen(FRONTEND_PORT, () => {
    console.log(`✅ Frontend Server started on port ${FRONTEND_PORT}`);
    console.log(`🌐 Open your browser at http://localhost:${FRONTEND_PORT}`);
    console.log('\n📚 Book Management System is ready!');
});