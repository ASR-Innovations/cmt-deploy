module.exports = (app) => {
    const avis = require('../controllers/avis.controller.js');
    
    app.get('/user/points', avis.getUserPoints);
    // Create a new Note
    app.post('/avis/create', avis.create);

    // Retrieve all Notes
    app.get('/avis', avis.findAll);

    app.get('/avis/:avisId', avis.getAvis);

    app.get('/avis/:avisId/approve', avis.approveAvis);

    app.get('/avis/:avisId/disapprove', avis.disapproveAvis);

    // Retrieve a single Note with noteId
    app.get('/cours/:codeCours/avis', avis.findAvisCours);

    app.get('/cours/:codeCours/overallRates', avis.findOverallRatesCours);

    app.get('/cours', avis.findAllCourses)

    app.get('/bestCourses', avis.findBestCourses)

    app.get('/worstCourses', avis.findWorstCourses)

    app.get('/bestProfs', avis.findBestProfs)

    app.get('/worstProfs', avis.findWorstProfs)

    app.get('/prof/:nomProf/avis', avis.findAvisProf)

    app.get('/prof/:nomProf/overallRatesByCourse', avis.findOverallRatesByCourseProf)

    app.get('/prof/:nomProf/overallRates', avis.findOverallRatesProf)

    app.get('/prof/:nomProf/detailedRatesByCourse', avis.findDetailedRatesByCourseProf)

    app.get('/profs', avis.findAllProfs)

    app.get('/maket', avis.updateMarket);

    // Update a Note with noteId
    app.put('/avis/:noteId', avis.update);

    // Delete a Note with noteId
    app.delete('/avis/:noteId', avis.delete);

    app.get('/studies/:studyId/avis', avis.avisByStudy);

    app.get('/studies/:studyId/statistics', avis.statisticsByStudy);

    app.get('/studies/:studyId/approve', avis.approveStudyAvis);

      // Add this new route for submitting comments
      app.post('/avis/create', avis.createAvis);
}