module.exports = (app) => {
    const courses = require('../controllers/courses.controller.js');

    // Retrieve all Courses
    app.get('/courses', courses.findAll);

    app.get('/courses/:codeCours', courses.findCourse);

    app.get('/courses/findall', courses.findAllCourses);

    app.get('/profs/findall', courses.findAllProfs);

    app.get('/courses/:query/search', courses.search);

    app.post('/courses/:codeCours/modify', courses.modify);
    

    app.get('/profs', courses.findAllProfs);
}