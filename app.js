const express = require('express');
//
require('dotenv').config();

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

module.exports = app;