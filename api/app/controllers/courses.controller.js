const Courses = require('../models/courses.model.js');
const Avis = require('../models/avis.model.js');

// Retrieve and return all courses from the database.
exports.findAll = (req, res) => {
    Courses.find()
    .then(courses => {
        res.send(courses);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving courses."
        });
    });
};

exports.search = (req, res) => {

    const query = req.params.query;

    Courses.find(
        { $text : { $search : query } }, 
        { score : { $meta: "textScore" } }
    )
    .sort({ score : { $meta : 'textScore' } })
    .then(courses => {
        res.send(courses);
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving courses."
        });
    });
};

exports.findCourse = (req, res) => {

    const codeCours = req.params.codeCours;

    Courses.findOne({CodeCours: codeCours})
    .then(course => {
        if(course != null)
        {
            res.send(course);
        }
        else
        {
            res.status(404).send({message : "Course not found"});
        }
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving course."
        });
    });
};

exports.findAllCourses = (req, res) => {
    var pipeline = [
        {$group : 
            {"_id" : {CodeCours : "$CodeCours", NomCours : {$toLower: "$NomCours"}},
            }
        },
        {$sort : {"_id.CodeCours": 1}}
    ]
    var notFoundMessage = "All courses not found"
    var errMessage = "Error retrieving courses"

    const insertNewCourse = ((codeCours, nomCours) => {
        return new Promise((resolve, reject) => {

            Courses.findOne({CodeCours: codeCours}, function(err, course){
                if (err) return res.send("error");
                if(course === null){
                    Courses.create({ CodeCours: codeCours, NomCours: nomCours}, function (err, course) {
                        if (err) {
                            resolve(err);
                        }

                        resolve(course);
                      });
                }
                else
                {
                      resolve({message : "cours déjà existant"});
                }
            })
        })
    });

    const loop = (async(avis)=> {
        try {

            var i = 0;
            for(i = 0; i< avis.length; i++)
            {
                var codeCours = avis[i]["_id"]["CodeCours"];
                var nomCours = avis[i]["_id"]["NomCours"];

                const response = await insertNewCourse(codeCours, nomCours);
            }

        } catch (error) {
            console.error('ERROR:');
            console.error(error);
        }
    })

    Avis.aggregate(pipeline).then(avis => {
        if(!avis || avis.length == 0) {
            return res.status(404).send({
                message: notFoundMessage
            });            
        }

        loop(avis);
        
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

};

exports.findAllProfs = (req, res) => {
    var pipeline = [
        {$unwind : "$Professeur"},
        {$group : 
            {"_id" : {"Professeur" : "$Professeur", "CodeCours" :"$CodeCours"}
            }
        }
    ]
    var notFoundMessage = "profs not found"
    var errMessage = "Error retrieving profs"

    const updateCourseWithProf = ((codeCours, nomProf) => {
        return new Promise((resolve, reject) => {

           /* Courses.update({CodeCours: codeCours}, { $push: { "Professeur": nomProf } }, function(err, course){
                if (err) return res.send("error");
                console.log("Prof : " + nomProf + " ajouté au cours : " + codeCours);
                resolve();
            })*/
        })
    });
    
    const loop = (async(courses)=> {
        try {

            var i = 0;
            for(i = 0; i< courses.length; i++)
            {
                var codeCours = courses[i]["_id"]["CodeCours"];
                var nomProf = courses[i]["_id"]["Professeur"];

                //console.log("Prof : " + nomProf + " ajouté au cours : " + codeCours);

                const response = await updateCourseWithProf(codeCours, nomProf);
            }

        } catch (error) {
            console.error('ERROR:');
            console.error(error);
        }
    })

    Avis.aggregate(pipeline).then(profs => {
        if(!profs || profs.length == 0) {
            return res.status(404).send({
                message: notFoundMessage
            });            
        }

        loop(profs);
        
        res.send(profs);
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

};




exports.modify = (req, res) => {

    var codeCours = req.params.codeCours;
    var nomCours = req.body.nomCours;


    Courses.update({CodeCours: codeCours}, { $set: { "NomCours": nomCours } }, function(err, course){
        Avis.updateMany({CodeCours : codeCours}, { $set: { "NomCours": nomCours } },  function(err, course){

            if (err) return res.send("error");
            console.log("c'est ok !")
            res.send({message: "nom du cours changé avec succès"})
        })
        
    })
}
