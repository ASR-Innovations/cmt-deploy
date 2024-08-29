module.exports = (app) => {
    const studies = require('../controllers/studies.controller.js');

    // Retrieve all Studies
    app.get('/studies', studies.findAll);

    app.get('/studies/:id', studies.find);

    app.post('/studies/create', studies.create);

    app.post('/studies/fillday', studies.fillday);

    app.post('/studies/:id/modify', studies.modify);

    app.get('/studies/:id/activate', studies.activate);

    app.get('/studies/:id/deactivate', studies.deactivate);
}