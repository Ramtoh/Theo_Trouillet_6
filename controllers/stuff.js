const Sauce = require('../models/sauce');
const fs = require('fs');
const { ServerResponse } = require('http');

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

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Objet supprimé'}))
            .catch(error => res.status(404).json({ error }));
        });
      })
      .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => res.status(200).json(sauce))
      .catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
      .then(sauces => res.status(200).json(sauces))
      .catch(error => res.status(400).json({ error }));
};

exports.likeDislikeSauce = (req, res) => {
  const sauce = Sauce.findByIdAndUpdate(req.params.id);
  sauce.then((s) => {
      switch (req.body.like) {
          case 1:
              Sauce.updateOne(
                  { _id: s.id },
                  {
                      likes: s.likes + 1,
                      $push: { usersLiked: req.body.userId },
                  }
              ).then(() => res.status(200).json(s));
              console.log("Liked");
              break;

          case -1:
              Sauce.updateOne(
                  { _id: s.id },
                  {
                      dislikes: s.dislikes + 1,
                      $push: { usersDisliked: req.body.userId },
                  }
              ).then(() => res.status(200).json(s));
              console.log("Disliked");
              break;

          case 0:
            Sauce.findOne({_id : req.params.id})
            .then(sauce => {
                if (sauce.usersLiked.includes(req.body.userId)){
                  Sauce.updateOne({_id : req.params.id}, {$inc : {likes : -1 }, /*Suppress like*/
                    $pull : { usersLiked : req.body.userId} /*Delete user id from table*/
                  })
                    .then(() => res.status(201).json({message : "j'aime a été retiré !"}))
                    .catch(error => res.status(500).json({error}))
                }
                else{
                  Sauce.updateOne({_id : req.params.id}, {$inc : {dislikes : -1 }, /*Suppress dislike*/
                    $pull : { usersDisliked : req.body.userId} /*Delete user id from table*/
                  })
                    .then(() => res.status(201).json({message : "je n'aime pas été retiré !"}))
                    .catch(error => res.status(500).json({ error }))
                }

            }) 
            .catch(error => res.status(500).json({ error}))
              break;
      }
  });
};