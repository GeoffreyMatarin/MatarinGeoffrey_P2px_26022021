//Importation du package mongoose pour communication optimale avec mongoDB
const mongoose = require('mongoose');

//On importe un package pour éviter les bugs à l'identification 
const uniqueValidator = require('mongoose-unique-validator');

//Création du schéma pour les données de l'utilisateur
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//Pour qu'on ne puisse pas s'inscrire plusieurs fois avec le même mail
userSchema.plugin(uniqueValidator);


//Exportation du schéma sous le nom "User"
module.exports = mongoose.model('User', userSchema);