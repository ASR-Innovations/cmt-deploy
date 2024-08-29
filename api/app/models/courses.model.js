const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CoursesSchema = new Schema({
    NomCours: { type: String},
    CodeCours: { type: String},
    Professeur: { type: Array},
    averagePoints: { type: Number, default: 0 },
})

CoursesSchema.index({ NomCours: 'text', CodeCours: 'text'});

module.exports =  mongoose.model('Courses', CoursesSchema, 'courses')