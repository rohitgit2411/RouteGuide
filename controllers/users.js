const User = require('../models/user');
const Route = require('../models/route');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to RouteGuide!');
            res.redirect('/routes');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = async (req, res) => {
    const user = await User.findById(req.user);
    req.flash('success', `welcome back '${user.username}'!`);
    const redirectUrl = req.session.returnTo || '/routes';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.renderProfile = async (req, res) => {
        const routes = await Route.find({});
        res.render('users/profile', { routes });
}

module.exports.logout = async (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/routes');
      });
    req.flash('success', "Wish to see you back soon!");
    // res.redirect('/routes');
}