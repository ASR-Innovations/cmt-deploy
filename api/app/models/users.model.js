const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
    Email: { type: String},
    Prenom: { type: String},
    Nom: {type : String},
    BannerID: {type: String},
    Password: {type : String},
    LastConnection: {type : Date},
    Pseudo: {type: String},
    Token: {type: String},
    TokenPassword: {type: String},
    Activated: {type: Number},
    Admin: {type: Number},
    Points: { type: Number, default: 140 },
    walletPoints: { type: Number, default: 140 },
  pointsHistory: [{ 
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    points: Number,
    date: { type: Date, default: Date.now }
}]

})
 
module.exports =  mongoose.model('Users', UsersSchema, 'users')