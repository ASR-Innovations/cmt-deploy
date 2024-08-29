module.exports = (app) => {
    const users = require('../controllers/users.controller.js');

    // Retrieve all Users
    app.get('/users', users.findAll);

    // Reset User
    app.get('/user/:bannerID/reset', users.resetUser);

    // Make Admin
    app.get('/user/:bannerID/make-admin', users.makeAdmin);

    // Retrieve a single User with BannerID
    app.get('/user/:bannerID', users.findUser);

    app.post('/user/create', users.createUser);

    app.put('/user/:bannerID', users.update);

    // Activate a User with BannerID
    app.put('/user/:bannerID/activate/:token', users.activate);

    // Retrieve a single User with BannerId that has forgotten his password
    app.put('/user/:bannerID/create-token', users.createToken);

    // Verify token of reinitiation of password
    app.get('/user/:bannerID/reinitiate-password/:token', users.verifyTokenPassword);

    // Reinitiate the Password
    app.put('/user/:bannerID/reinitiate-password/:token', users.reinitiatePassword);

    app.put('/user/:bannerID/update-points', users.updatePoints);

    // Delete a Note with noteId
    app.delete('/user/:bannerID', users.delete);
}