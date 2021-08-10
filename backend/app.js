const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

//protection des requetes http
const helmet = require('helmet');
const hpp = require('hpp');

//parametre cookie
const cookieSession = require('cookie-session');
const Keygrip = require('keygrip');




const sauceRoutes = require('./routes/sauce');
const userRoutes = require('./routes/user');



//Connexion a la base de données
mongoose.connect('mongodb+srv://geoffrey:hykoner@cluster0.ivzmu.mongodb.net/test?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));



  const app = express();



app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Cookie session
app.use(cookieSession({

  name: 'session',
  keys: new Keygrip([process.env.COOKIESECRET], 'SHA256', 'base64'),

  // Cookie Options
  path: '/',
  httpOnly: true,
  secure: true,
  signed: true,
  maxAge: 600000, // 10 minutes
  sameSite: 'strict'
}));

// Protection contre les attaques DOS
app.use(hpp());




app.use(bodyParser.json());

//définit des en-têtes de réponse HTTP liés à la sécurité pour se protéger contre certaines vulnérabilités Web bien connues
app.use(helmet());

//routes de stockage pour les images
app.use('/images', express.static(path.join(__dirname, 'images')));

// route sauces
app.use('/api/sauces', sauceRoutes);
//route users
app.use('/api/auth', userRoutes);



module.exports = app;