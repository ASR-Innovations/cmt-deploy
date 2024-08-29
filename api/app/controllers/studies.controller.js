const Studies = require('../models/studies.model.js');
const mongoose = require('mongoose');

exports.findAll = (req, res) => {
    Studies.find()
    .sort({DateCreation: -1}).then(studies => {
        res.send(studies);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving studies."
        });
    });
};

exports.find = (req, res) => {

    var identifiant = req.params.id;

    Studies.findOne({ Identifiant: identifiant}, function (err, study) {
        if (err) return res.status(404).send({
            message: err
        });

        if(study === null){
            return res.status(404).send({
                message: "Etude inexistante"
            });
        }

        return res.status(200).send(study);
      });
}

exports.create = (req, res) => {

    var trimestre = req.body.trimestre;
    var year = req.body.year;
    var bdeName = req.body.bdeName;
    var identifiant = require('crypto').randomBytes(10).toString('hex');
    var dateCreation = new Date(Date.now());

    Studies.create({ _id: new mongoose.mongo.ObjectID(), Trimestre: trimestre, Annee: year, BDE: bdeName, Identifiant: identifiant, DateCreation:dateCreation, Intensive : [], Lundi:[], Mardi:[], Mercredi:[], Jeudi:[], Vendredi:[], Activated:0 }, function (err, study) {
        if (err) return res.status(404).send({
            message: err
        });

        return res.status(200).send(study);
      });

}

exports.fillday = (req, res) => {

    var days = ['Intensive', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

    var identifiant = req.body.identifiant;
    var day = days[req.body.day];
    var courses = JSON.parse(req.body.courses)

    Studies.updateOne({Identifiant : identifiant}, { $set: {[day]: courses}}, function (err, study) {
        if (err) return res.send("error");

        return res.status(200).send(study);
      });

}

exports.modify = (req, res) => {

    var identifiant = req.params.id;
    var trimestre = req.body.trimestre;
    var annee = req.body.annee;
    var bde = req.body.bde;

    Studies.updateOne({Identifiant : identifiant}, { $set: {Trimestre: trimestre, Annee: annee, BDE: bde}}, function (err, study) {
        if (err) return res.send("error");

        return res.status(200).send(study);
      });

}

exports.activate = (req, res) => {
    var studyId = req.params.id;

    Studies.findOneAndUpdate({_id : studyId}, { $set: { Activated: 1}}, { new: true }, function (err, study) {
        if (err) return handleError(err);
        res.send(study._id);
      });
};

exports.deactivate = (req, res) => {
    var studyId = req.params.id;

    Studies.findOneAndUpdate({_id : studyId}, { $set: { Activated: 0}}, { new: true }, function (err, study) {
        if (err) return handleError(err);
        res.send(study._id);
      });
};