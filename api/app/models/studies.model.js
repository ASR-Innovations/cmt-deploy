const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StudiesSchema = new Schema({
    _id : Schema.Types.ObjectId,
    Identifiant : { type: String},
    Trimestre: { type: String},
    Annee: { type: String},
    BDE: { type: String},
    DateCreation: { type: Date},
    Intensive : {type : Array},
    Lundi : {type : Array},
    Mardi : {type : Array},
    Mercredi : {type : Array},
    Jeudi : {type : Array},
    Vendredi : {type : Array},
    Activated : {type : Number}
})

module.exports =  mongoose.model('Studies', StudiesSchema, 'studies')