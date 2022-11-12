require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const app = express();
const connectDB = require('./db/connect');

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users = [];

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));
app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


// Routes
app.get('/', (req, res) => {
    res.render('index', {
        title: "HOME",
        name: req.user.name
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        title: "LOGIN"
    });
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

app.get('/register', (req, res) => {
    res.render('register', {
        title: "REGISTER"
    });
});

app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log(users);
});


// Server
const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.DB_URI);
        app.listen(PORT, () => {
            console.log(`Server started on port: ${PORT}`)
        });
    } catch (error) {
        console.log(error);
    }
};

start();