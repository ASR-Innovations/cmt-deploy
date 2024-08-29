const Avis = require('../models/avis.model.js');
const Courses = require('../models/courses.model.js');
const mongoose = require('mongoose');
const User = require('../models/users.model.js');
// Create and Save a new Note

exports.getUserPoints = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      res.json({ points: user.points });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

exports.createAvis = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (user.points < req.body.pointsSpent) {
        return res.status(400).json({ error: "Not enough points" });
      }
  
      const newAvis = new Avis({
        // ... existing fields
        pointsSpent: req.body.pointsSpent,
        User: req.user.id,
      });
  
      const savedAvis = await newAvis.save();
  
      // Update user's points
      user.points -= req.body.pointsSpent;
      await user.save();
  
      // Update course average points
      await updateCourseAveragePoints(req.body.CodeCours);
  
      res.status(200).json(savedAvis);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
  
  async function updateCourseAveragePoints(codeCours) {
    const avis = await Avis.find({ CodeCours: codeCours, Approved: 1 });
    const totalPoints = avis.reduce((sum, a) => sum + a.pointsSpent, 0);
    const averagePoints = totalPoints / avis.length;
  
    await Courses.findOneAndUpdate(
      { CodeCours: codeCours },
      { $set: { averagePoints: averagePoints } }
    );
  }
  
  exports.findAvisCours = async (req, res) => {
    const codeCours = req.params.codeCours;
  
    try {
      const course = await Courses.findOne({ CodeCours: codeCours });
      if (!course) {
        return res.status(404).send({
          message: "Course not found with code " + codeCours
        });
      }
  
      const avis = await Avis.find({ CodeCours: codeCours, Approved: 1 })
        .sort({ Annee: -1, Timestre: -1 });

         // Fetch all professors
    const allProfs = await getAllProfessors();
  console.log("All Professors fetched:", allProfs);
      res.render('coursAvis', {
        avis: avis,
        course: course,
        averagePoints: course.averagePoints,
        codeCours: codeCours,
        allProfs: allProfs
      });
    } catch (err) {
      res.status(500).send({
        message: err.message || "Error retrieving course and reviews"
      });
    }
  };


  async function getAllProfessors() {
    try {
      const response = await fetch('http://localhost:3000/profs'); // Adjust URL if necessary
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching professors:", error);
      return [];
    }
  }
exports.create = (req, res) => {
    var professeur = new Array();

    if(req.body.Prof1 !== ''){
        professeur.push(req.body.Prof1);
    }
    if(req.body.Prof2 !== ''){
        professeur.push(req.body.Prof2);
    }
    if(req.body.Prof3 !== ''){
        professeur.push(req.body.Prof3);
    }
    if(req.body.Prof4 !== ''){
        professeur.push(req.body.Prof4);
    }

    var pointsMises = req.body.PointMises != '' ? parseInt(req.body.PointMises) : 'NC';

    var date = new Date();
    const avis = new Avis({
        _id: new mongoose.mongo.ObjectID(),
        NomCours: req.body.NomCours,
        CodeCours: req.body.CodeCours,
        Professeur: professeur,
        CommentCours: req.body.CommentCours,
        CommentProf: req.body.CommentProf,
        NoteCours: parseInt(req.body.NoteCours),
        NoteProf : parseInt(req.body.NoteProf),
        Jour : req.body.Jour,
        Heure : req.body.Heure,
        Tour : req.body.Tour,
        PointMises: pointsMises,
        Timestre : req.body.Trimestre,
        Annee: req.body.Annee,
        BDE: req.body.BDE,
        DatePubli: date,
        StudyId : req.body.StudyId,
        User : req.body.User,
        Approved : 0
    });

    // Save Note in the database
    avis.save()
    .then(data => {
        res.send(data);
        console.log("data sent");
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the Note."
        });
    });
};

// Retrieve and return all notes from the database.
exports.findAll = (req, res) => {
    console.log("find all")
    Avis.find()
    .then(avis => {
        res.send(avis);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving avis."
        });
    });
};

exports.getAvis = (req, res) => {
    var avisId = req.params.avisId;
    Avis.findOne({_id : avisId})
    .then(avis => {
        res.send(avis);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving avis."
        });
    });
};

exports.approveAvis = (req, res) => {
    var avisId = req.params.avisId;

    Avis.findOneAndUpdate({_id : avisId}, { $set: { Approved: 1}}, { new: true }, function (err, avis) {
        if (err) return handleError(err);
        res.send(avis._id);
      });
};

exports.disapproveAvis = (req, res) => {
    var avisId = req.params.avisId;

    Avis.findOneAndUpdate({_id : avisId}, { $set: { Approved: 0}}, { new: true }, function (err, avis) {
        if (err) return handleError(err);
        res.send(avis._id);
      });
};

// Find a single note with a noteId
// const Courses = require('../models/courses.model.js');
// const Avis = require('../models/avis.model.js');





exports.findAvisCours = (req, res) => {
    const codeCours = req.params.codeCours;

    Courses.findOne({ CodeCours: codeCours })
        .then(course => {
            if (!course) {
                console.log(`Course not found: ${codeCours}`);
                return res.status(404).send({
                    message: "Course not found with code " + codeCours
                });
            }

            const pipeline = [
                { $match: { "CodeCours": codeCours, "Approved": 1 } },
                { $sort: { "Annee": -1, "Timestre": -1 } }
            ];

            Avis.aggregate(pipeline)
                .then(avis => {
                    let averagePoints = 0;
                    if (avis && avis.length > 0) {
                        averagePoints = avis.reduce((sum, a) => sum + (a.PointMises || 0), 0) / avis.length;
                    }

                    res.render('coursAvis', {
                        avis: avis,
                        course: course,
                        averagePoints: averagePoints,
                        codeCours: codeCours
                    });
                })
                .catch(err => {
                    console.error(`Error retrieving reviews: ${err.message}`);
                    res.status(500).send({
                        message: err.message || "Error retrieving reviews for course with code " + codeCours
                    });
                });
        })
        .catch(err => {
            console.error(`Error retrieving course: ${err.message}`);
            res.status(500).send({
                message: err.message || "Error retrieving course with code " + codeCours
            });
        });
};
exports.findOverallRatesCours = (req, res) => {
    const pipeline = [
        {$match : {"CodeCours" : req.params.codeCours, "Approved" : 1}},
        {$unwind : "$Professeur"},
        {$group : {
            "_id" : "$Professeur",
            "moyenneCours" : {$avg : "$NoteCours"},
            "moyenneProf" : {$avg : "$NoteProf"},
            "moyennePointsMises" : {"$avg" : "$PointMises"},
            "nbAvis" : {$sum : 1}
        }}
    ]

    const notFoundMessage = "Course not found with id " + req.params.codeCours
    const errMessage = "Error retrieving note with id " + req.params.codeCours

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
}

exports.findAvisProf = (req, res) => {
    var pipeline = [
        {$match : {"Professeur" : req.params.nomProf, "Approved" : 1}},
        {$sort : {"DatePubli" : -1}}
    ]
    var notFoundMessage = "Avis not found with id " + req.params.nomProf
    var errMessage = "Error retrieving avis with id " + req.params.nomProf

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.findAllCourses = (req, res) => {
    var pipeline = [
        {$match : {"Approved" : 1}},
        {$group : 
            {"_id" : {CodeCours : "$CodeCours", NomCours : "$NomCours"},
            "moyenneCours" : {$avg : "$NoteCours"},
            "moyenneProfs" : {$avg : "$NoteProf"},
            "moyennePoints": {$avg : "$PointMises"},
            "nbAvis" : {$sum : 1}
            }
        },
        {$sort : {"_id.CodeCours": 1}}
    ]
    var notFoundMessage = "All courses not found"
    var errMessage = "Error retrieving avis with id " + req.params.nomProf

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.findBestCourses = (req, res) => {
    var pipeline = [
        {$match : {"Approved" : 1}},
        {$group : 
            {"_id" : {CodeCours : "$CodeCours", NomCours : "$NomCours"},
            "moyenneCours" : {$avg : "$NoteCours"},
            "nbAvis" : {$sum : 1}
            }
        },
        { $match : { nbAvis : {$gt: 20}} },
        {$sort : {"moyenneCours": -1}},
        {$limit : 5}
    ]
    var notFoundMessage = "Best courses not found"
    var errMessage = "Error retrieving best courses"

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.findBestProfs = (req, res) => {
    var pipeline = [
        {$match : {"Approved" : 1}},
        {$unwind : "$Professeur"},
        {$group : 
            {"_id" : "$Professeur",
            "moyenneProf" : {$avg : "$NoteProf"},
            "nbAvis" : {$sum : 1}
            }
        },
        { $match : { nbAvis : {$gt: 20}} },
        {$sort : {"moyenneProf": -1}},
        {$limit : 5}
    ]
    var notFoundMessage = "Best profs not found"
    var errMessage = "Error retrieving best profs"

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.findWorstProfs = (req, res) => {
    var pipeline = [
        {$match : {"Approved" : 1}},
        {$unwind : "$Professeur"},
        {$group : 
            {"_id" : "$Professeur",
            "moyenneProf" : {$avg : "$NoteProf"},
            "nbAvis" : {$sum : 1}
            }
        },
        { $match : { nbAvis : {$gt: 20}} },
        {$sort : {"moyenneProf": 1}},
        {$limit : 5}
    ]
    var notFoundMessage = "Worst profs not found"
    var errMessage = "Error retrieving worst profs"

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.findWorstCourses = (req, res) => {
    var pipeline = [
        {$match : {"Approved" : 1}},
        {$group : 
            {"_id" : {CodeCours : "$CodeCours", NomCours : "$NomCours"},
            "moyenneCours" : {$avg : "$NoteCours"},
            "nbAvis" : {$sum : 1}
            }
        },
        { $match : { nbAvis : {$gt: 20}} },
        {$sort : {"moyenneCours": 1}},
        {$limit : 5}
    ]
    var notFoundMessage = "All courses not found"
    var errMessage = "Error retrieving avis with id " + req.params.nomProf

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.updateMarket = (req, res) => {
    Avis.updateMany({CodeCours : "MKGM31129"}, { $set: { NomCours: 'Marketing Management (in English)' }}, { new: true }, function (err, avis) {
        if (err) return handleError(err);
        res.send(avis);
      });
}

exports.findAllProfs = (req, res) => {
    var pipeline = [
        {$match : {"Approved" : 1}},
        {$unwind : "$Professeur"},
        {$group : 
            {"_id" : "$Professeur",
            "moyenneCours" : {$avg : "$NoteCours"},
            "moyenneProfs" : {$avg : "$NoteProf"},
            "moyennePoints": {$avg : "$PointMises"},
            "nbAvis" : {$sum : 1}
            }
        },
        {$sort : {"_id": 1}}
    ]
    var notFoundMessage = "All courses not found"
    var errMessage = "Error retrieving avis with id " + req.params.nomProf

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.findOverallRatesByCourseProf = (req, res) => {
    const pipeline = [
        {$match : {"Professeur" : req.params.nomProf, "Approved" : 1}},
        { $group : {
            "_id" : "$NomCours",
            "minPoints" : {$min : "$PointMises"},
            "maxPoints" : {$max : "$PointMises"},
            "avgPoints" : {$avg : "$PointMises"},
            "minProf" : {$min : "$NoteProf"},
            "maxProf" : {$max : "$NoteProf"},
            "avgProf" : {$avg : "$NoteProf"},
            "minCours" : {$min : "$NoteCours"},
            "maxCours" : {$max : "$NoteCours"},
            "avgCours" : {$avg : "$NoteCours"},
            "nombreAvis" : {$sum : 1}
        }}
    ]

    const notFoundMessage = "Professor not found with id " + req.params.nomProf
    const errMessage = "Error retrieving prof with id " + req.params.nomProf
    
    aggregate(pipeline, notFoundMessage, errMessage, req, res);

};

exports.findOverallRatesProf = (req, res) => {
    const pipeline = [
        {$match : {"Professeur" : req.params.nomProf, "Approved" : 1}},
        { $group : {
            "_id" : null,
            "minPoints" : {$min : "$PointMises"},
            "maxPoints" : {$max : "$PointMises"},
            "avgPoints" : {$avg : "$PointMises"},
            "minProf" : {$min : "$NoteProf"},
            "maxProf" : {$max : "$NoteProf"},
            "avgProf" : {$avg : "$NoteProf"},
            "minCours" : {$min : "$NoteCours"},
            "maxCours" : {$max : "$NoteCours"},
            "avgCours" : {$avg : "$NoteCours"},
            "nombreAvis" : {$sum : 1}
        }}
    ]

    const notFoundMessage = "Professor not found with id " + req.params.nomProf
    const errMessage = "Error retrieving prof with id " + req.params.nomProf
    
    aggregate(pipeline, notFoundMessage, errMessage, req, res);

};

exports.findDetailedRatesByCourseProf = (req, res) => {
    const pipeline = [
        {$match : {"Professeur" : req.params.nomProf, "Approved" : 1}},
        { $group : {
            "_id" : {
                "CodeCours" : "$CodeCours",
                "NomCours" : "$NomCours",
                "Trimestre" : "$Timestre",
                "Annee" : "$Annee"},
            "minPoints" : {$min : "$PointMises"},
            "maxPoints" : {$max : "$PointMises"},
            "avgPoints" : {$avg : "$PointMises"},
            "minProf" : {$min : "$NoteProf"},
            "maxProf" : {$max : "$NoteProf"},
            "avgProf" : {$avg : "$NoteProf"},
            "minCours" : {$min : "$NoteCours"},
            "maxCours" : {$max : "$NoteCours"},
            "avgCours" : {$avg : "$NoteCours"},
            "nombreAvis" : {$sum : 1}
        }},
        {$sort : {"_id.NomCours":1, "_id.Annee" : -1, "_id.Trimestre" : -1}},
    ]

    const notFoundMessage = "Professor not found with id " + req.params.nomProf
    const errMessage = "Error retrieving prof with id " + req.params.nomProf
    
    aggregate(pipeline, notFoundMessage, errMessage, req, res);
}

// Update a note identified by the noteId in the request
exports.update = (req, res) => {
    console.log("update")
};

// Delete a note with the specified noteId in the request
exports.delete = (req, res) => {
    console.log("delete")
}; 

exports.avisByStudy = (req, res) => {
    var pipeline = [
        {$match : {"StudyId" : req.params.studyId}},
        {$sort : {"DatePubli" : -1}}
    ]
    var notFoundMessage = "Avis not found with id " + req.params.studyId
    var errMessage = "Error retrieving avis with id " + req.params.studyId

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.statisticsByStudy = (req, res) => {
    var pipeline = [
        {$match : {"StudyId" : req.params.studyId}},
        { $group : {
            "_id" : {
                "StudyId" : "$StudyId"},
            "minPoints" : {$min : "$PointMises"},
            "maxPoints" : {$max : "$PointMises"},
            "avgPoints" : {$avg : "$PointMises"},
            "minProf" : {$min : "$NoteProf"},
            "maxProf" : {$max : "$NoteProf"},
            "avgProf" : {$avg : "$NoteProf"},
            "minCours" : {$min : "$NoteCours"},
            "maxCours" : {$max : "$NoteCours"},
            "avgCours" : {$avg : "$NoteCours"},
            "nombreAvis" : {$sum : 1}
        }}
    ]
    var notFoundMessage = "Avis not found with id " + req.params.studyId
    var errMessage = "Error retrieving avis with id " + req.params.studyId

    aggregate(pipeline, notFoundMessage, errMessage, req, res)
};

exports.approveStudyAvis = (req, res) => {
    Avis.updateMany({StudyId : req.params.studyId}, { $set: { Approved: 1 }}, { new: true }, function (err, avis) {
        if (err) return handleError(err);
        res.send({message : "All Aproved"});
      });
}


var aggregate = (pipeline, notFoundMessage, errMessage, req, res) => {

    Avis.aggregate(pipeline).collation({ locale: 'fr', strength: 2 }).then(avis => {
        if(!avis || avis.length == 0) {
            return res.status(404).send({
                message: notFoundMessage
            });            
        }
        res.send(avis);
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

var find = (pipeline, notFoundMessage, errMessage, req, res) => {
    Avis.find(pipeline)
    .then(avis => {
        if(!avis || avis.length == 0) {
            return res.status(404).send({
                message: notFoundMessage
            });            
        }
        res.send(avis);
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


// Add this function to calculate average points
exports.calculateAveragePoints = async (codeCours) => {
    const avis = await Avis.find({ CodeCours: codeCours });
    const totalPoints = avis.reduce((sum, a) => sum + a.PointMises, 0);
    return totalPoints / avis.length;
  };
  
  
  
  // Add a new function to handle comment submission
  exports.createAvis = async(req, res) => {
    try {

        const user = await User.findById(req.user.id);
    if (user.points < req.body.pointsSpent) {
      return res.status(400).json({ error: "Not enough points" });
    }
    const newAvis = new Avis({
        NomCours: req.body.nomCours,
        CodeCours: req.body.codeCours,
        Professeur: [req.body.professor],
        CommentCours: req.body.comment,
        CommentProf: req.body.comment,
        NoteCours: req.body.courseRating,
        NoteProf: req.body.professorRating,
        Jour: req.body.dayOfClass,
        PointMises: req.body.pointsSpent,
        Timestre: req.body.trimester,
        Annee: req.body.year,
        DatePubli: new Date(),
        Approved: 0,
        User: req.user.id,
    });

    const savedAvis = await newAvis.save();
        res.status(200).json(savedAvis);


        // Update user's points
    user.points -= req.body.pointsSpent;
    await user.save();

    // Update course average points
    await updateCourseAveragePoints(req.body.CodeCours);

    res.status(200).json(savedAvis);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


async function updateCourseAveragePoints(codeCours) {
    const avis = await Avis.find({ CodeCours: codeCours, Approved: 1 });
    const totalPoints = avis.reduce((sum, a) => sum + a.pointsSpent, 0);
    const averagePoints = totalPoints / avis.length;
  
    await Courses.findOneAndUpdate(
      { CodeCours: codeCours },
      { $set: { averagePoints: averagePoints } }
    );
  }