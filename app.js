const express = require('express');
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const rateLimit = require('express-rate-limit'); // package rate limiter (imposer une limite aux de requetes envoyees au serveur dans un temps imparti)
const toobusy = require('toobusy-js'); // lorsque le serveur lag et qu'il recoit beaucoup trop de requete, toobusy previent en retournant un serveur toobusy et stop le processus
require('dotenv').config(); // package dotenv permettant de cacher les informations d'acces a la DB dans le code

const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const userRoutes = require('./routes/user');
const stuffRoutes = require('./routes/stuff');

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.elhxp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, 
{   useNewUrlParser: true,
    useUnifiedTopology: true    })
    .then(() => console.log('Connexion MongoDB réussie!'))
    .catch(() => console.log('Connexion MongoDB échouée'));

const app = express();
app.use(helmet());
app.use(cors());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/auth', userRoutes);
app.use('/api/sauces', stuffRoutes);


// cookie session //

app.use(cookieSession({
    name: 'session',
    keys: [`${process.env.FIRST_COOKIE_KEY}`, `${process.env.SECOND_COOKIE_KEY}`],
  
    maxAge: 24 * 60 * 60 * 1000 // 24 heures avant expiration
  }))

// express-rate-limiter // limite a un certain temps et un nombre de requetes par session 
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes par session
    max: 100, // Limite a 100 requetes par session
});

app.use(limiter);

// toobusy // middleware qui bloque le serveur lorsque le serveur est trop occupe 
app.use(function(req, res, next) {
    if (toobusy()) {
        res.send(503, "Le serveur est occupé");
    } else {
        next();
    }
});

app.get('/', function(req, res) {
    let i = 0;
    while (i < 1e5) i++;
    res.send("J'ai compté jusqu'à " + i);
});

process.on('SINGINT', function() {
    server.close();
    toobusy.shutdown();
    process.exit();
});

module.exports = app;