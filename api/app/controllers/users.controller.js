const Users = require('../models/users.model.js');


// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    console.log("find all")
    Users.find()
    .then(users => {
        res.send(users);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    });
};

exports.updatePoints = (req, res) => {
    const { bannerID, pointsSpent } = req.body;
    
    Users.findOneAndUpdate(
      { BannerID: bannerID },
      { $inc: { points: -pointsSpent } },
      { new: true }
    )
    .then(updatedUser => {
      if (!updatedUser) {
        return res.status(404).send({ message: "User not found" });
      }
      res.send({ points: updatedUser.points });
    })
    .catch(err => res.status(500).send({ message: err.message }));
  };
  
// Find a single note with a noteId
exports.findUser = (req, res) => {

    const pipeline = [
        {$match : {"BannerID" : req.params.bannerID}}
    ]

    const notFoundMessage = "User not found with bannerid " + req.params.bannerID
    const errMessage = "Error retrieving user with bannerid " + req.params.bannerID

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.createUser = (req, res) => {

    var bannerID = req.body.bannerID.toUpperCase();
    var prenom = req.body.prenom;
    var nom = req.body.nom;

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            Users.create({ BannerID: bannerID, Email: bannerID+"@essec.edu", Prenom: prenom, Nom: nom, Password:"", Activated : 0, Pseudo:"", Token:"" }, function (err, user) {
                if (err) return res.status(404).send({
                    message: err
                });

                return res.status(200).send(user);
              });
        }
        else
        {
              return res.status(404).send({
                message: "L'utilisateur existe déjà"
            });
        }
    })
};

// Update a note identified by the noteId in the request
exports.update = (req, res) => {

    var bannerID = req.body.bannerID;
    var password = req.body.password;
    var pseudo = req.body.pseudo;

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            return res.status(404).send({
                message: "Le bannerID n'est pas autorisé à accéder au CMT"
            });
        }
        else if(user.Password !== "" && user.Password !== null && user.Password !== undefined){
            return res.status(404).send({
                message: "L'utilisateur est déjà inscrit dans la base du CMT"
            });
        }
        else
        {
            var token = require('crypto').randomBytes(48).toString('hex');
            Users.updateOne({ BannerID : bannerID }, { $set: {"Password": password, "Pseudo": pseudo, "Token": token, "Activated" : 0 }}, function (err, user) {
                if (err) return res.send("error");

                res.status(200).send({bannerID: bannerID, token: token});
              });
        }
    })
};

exports.resetUser = (req, res) => {

    var bannerID = req.params.bannerID.toUpperCase();

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            return res.status(404).send({
                message: "Le bannerID n'existe pas"
            });
        }
        else
        {
            Users.updateOne({ BannerID : bannerID }, { $set: {"Password": "", "Activated" : 0 }}, function (err, user) {
                if (err) return res.send("error");

                res.status(200).send({message : "Le compte a été réinitialisé"});
              });
        }
    })
};

exports.makeAdmin = (req, res) => {

    var bannerID = req.params.bannerID.toUpperCase();

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            return res.status(404).send({
                message: "Le bannerID n'existe pas"
            });
        }
        else
        {
            Users.updateOne({ BannerID : bannerID }, { $set: {"Admin": 1}}, function (err, user) {
                if (err) return res.send("error");

                res.status(200).send({message : "Le compte est désormais Admin"});
              });
        }
    })
};

exports.createToken = (req, res) => {

    var bannerID = req.body.bannerID;

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            return res.status(404).send({
                message: "Le bannerID n'est pas autorisé à accéder au CMT"
            });
        }
        else if(user.Password === "" || user.Password === null || user.Password === undefined){
            return res.status(404).send({
                message: "L'utilisateur n'est pas inscrit dans la base du CMT. Veuillez créer votre compte"
            });
        }
        else
        {
            var token = require('crypto').randomBytes(48).toString('hex');
            Users.updateOne({ BannerID : bannerID }, { $set: {"TokenPassword": token}}, function (err, user) {
                if (err) return res.send("error");

                res.status(200).send({bannerID: bannerID, token: token});
              });
        }
    })
};

exports.reinitiatePassword = (req, res) => {

    var bannerID = req.body.bannerID;
    var password = req.body.password;

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            return res.status(404).send({
                message: "Le bannerID n'est pas autorisé à accéder au CMT"
            });
        }
        else
        {
            Users.updateOne({ BannerID : bannerID }, { $set: {"Password": password, "TokenPassword": ""}}, function (err, user) {
                if (err) return res.send("error");

                return res.status(200).send({user: user});
              });
        }
    })
};

// Update a note identified by the noteId in the request
exports.verifyTokenPassword = (req, res) => {

    var bannerID = req.params.bannerID;
    var token = req.params.token;
    

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            return res.status(404).send({
                message: "Le bannerID n'est pas autorisé à accéder au CMT"
            });
        }
        else if(user.TokenPassword !== token){
            return res.status(404).send({
                message: "Token Invalid"
            });
        }
        else
        {
            return res.status(200).send({user: user});
        }
    })
};

exports.activate = (req, res) => {

    var bannerID = req.body.bannerID;
    var token = req.body.token;

    Users.findOne({BannerID: bannerID}, function(err, user){
        if (err) return res.send("error");
        if(user === null){
            return res.status(404).send({
                message: "Le bannerID n'est pas autorisé à accéder au CMT"
            });
        }
        else if(user.Activated == 1){
            return res.status(404).send({
                message: "L'utilisateur est déjà activé"
            });
        }
        else if(user.Token != token){
            return res.status(404).send({
                message: "Clé d'activation incorrecte"
            });
        }
        else
        {
            Users.updateOne({ BannerID : bannerID }, { $set: {"Token": "", "Activated": 1}}, function (err, user) {
                if (err) return res.send("error");
                res.status(200).send(user);
              });
        }
    })
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    console.log("delete")
}; 

var aggregate = (pipeline, notFoundMessage, errMessage, req, res) => {

    Users.aggregate(pipeline).then(users => {
        if(!users || users.length == 0) {
            return res.status(404).send({
                message: notFoundMessage
            });            
        }
        res.send(users);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: notFoundMessage
            });                
        }
        return res.status(500).send({
            message: errMessage
        });
    });
}