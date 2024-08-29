const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const AvisSchema = new Schema({
  _id: Schema.Types.ObjectId,
  NomCours: { type: String },
  CodeCours: { type: String },
  Professeur: { type: Array },
  CommentCours: { type: String },
  CommentProf: { type: String },
  // NoteCours: {type : Number},
  // NoteProf : {type : Number},
  NoteCours: { type: Number, min: 0, max: 10, required: true },
  NoteProf: { type: Number, min: 0, max: 10, required: true },
  PointMises: { type: Number, required: true },
  Jour: { type: String, required: true },
  // PointMises: { type: Number, required: true },
  Timestre: { type: String, required: true },
  Annee: { type: String, required: true },
  Heure: { type: String },
  Tour: { type: String },
  // PointMises: Schema.Types.Mixed,
  pointsSpent: { type: Number, required: true },
  Timestre: { type: String },
  Annee: { type: String },
  BDE: { type: String },
  DatePubli: { type: Date },
  StudyId: { type: String },
  User: { type: String },
  Approved: { type: Number },
});

module.exports = mongoose.model("Avis", AvisSchema, "avisDetails");
