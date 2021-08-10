const Sauce = require('../models/sauce');//Importation du modèles Sauce
const fs = require('fs');//Importation du package fs, qui permet entre autres de supprimer des fichiers


//Fontion qui gère la logique métier de la route POST (ajout d'une nouvelle sauce)
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
};




//Fontion qui gère la logique métier de la route PUT (modification d'une sauce existante)
exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
};




//Fontion qui gère la logique métier de la route DELETE (suppression d'une sauce existante)
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};




//Fontion qui gère la logique métier de la route GET (récupération d'une sauce spécifique)
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};



//Fontion qui gère la logique métier de la route GET (récupération de toutes les sauces)
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};



/*Fontion qui gère la logique métier de la route POST (Like/Dislike):
- Ajout du like quand on clique sur like + ajout du user au tableau UsersLiked
- Ajout du dislike quand on clique sur dislike + ajout du user au tableau UsersDisliked
- Suppression du like ou du dislike quand le user clique à nouveau + suppression du user dans le tableau correspondant */
exports.likeSauce = (req, res, next) => {
  switch (req.body.like) {
      case 1:
          //Si le user a cliqué sur like, on met à jour le produit sauce en incrémentant les likes de 1 et en intégrand l'id du user dans le tableau usersLiked
          Sauce.updateOne({_id: req.params.id}, {
              _id: req.params.id,
              $inc: {likes: + req.body.like},
              $push: {usersLiked: req.body.userId},
          })
          .then(() => res.status(201).json({message: "Like enregistré !"}))
          .catch(error => res.status(400).json({error}));
          break;
      case -1:
          //Si le user a cliqué sur dislike, on met à jour le produit sauce en incrémentant les dislikes de 1 et en intégrand l'id du user dans le tableau usersDisliked
          Sauce.updateOne({_id: req.params.id}, {
              _id: req.params.id,
              $inc: {dislikes: + req.body.like * -1},
              $push: {usersDisliked: req.body.userId},
          })
          .then(() => res.status(201).json({message: "Dislike enregistré !"}))
          .catch(error => res.status(400).json({error}));
          break;
      case 0:
           //Si le user reclique sur like ou dislike, annulation du like ou du dislike précédent
          Sauce.findOne({_id: req.params.id})
              .then(sauce => {
              console.log(sauce);
              //Si l'id du user est présent dans le tableau des usersLiked, c'est qu'il a liké précédemment, donc on annule son like
                  if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
                      Sauce.updateOne({_id: req.params.id}, {
                          _id: req.params.id,
                          $inc: {likes: -1},
                          $pull: {usersLiked: req.body.userId},
                      })
                      .then(() => res.status(201).json({message: "Annulation du like enregistrée !"}))
                      .catch(error => res.status(400).json({error}));
                  }
              //Si l'id du user est présent dans le tableau des usersDisliked, c'est qu'il a disliké précédemment, donc on annule son dislike
                  if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
                      Sauce.updateOne({_id: req.params.id}, {
                          _id: req.params.id,
                          $inc: {dislikes: -1},
                          $pull: {usersDisliked: req.body.userId}
                      })
                      .then(() => res.status(201).json({message: "Annulation du dislike enregistrée !"}))
                      .catch(error => res.status(400).json({error}));
                  }
              })
              .catch(error => res.status(500).json({error}));
          break;
      default:
          throw error;
      } 
};