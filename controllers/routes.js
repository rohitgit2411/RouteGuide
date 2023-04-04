const Route = require('../models/route');
const User = require('../models/user');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    // const user = await User.findById(req.user);
    const routes = await Route.find({});
    res.render('routes/index', { routes })
}

module.exports.renderNewForm = (req, res) => {
    res.render('routes/new');
}

module.exports.createRoute = async (req, res, next) => {
    const route = new Route(req.body.route);
    const user = await User.findById(req.user._id);
    route.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // const user = req.user._id;
    route.author = req.user._id;
    await route.save();
    req.flash('success', `Successfully created '${route.title}'!`);
    res.redirect(`/routes/${route._id}`)
}

module.exports.showRoute = async (req, res) => {
    var fav = false;
    const user = await User.findById(req.user);
    if(user){ 
        for(let route of user.routes){
            if(route && route._id.equals(req.params.id)){
                fav=true;
            }
        }
    }
    const route = await Route.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!route) {
        req.flash('error', 'Cannot find that route!');
        return res.redirect('/routes');
    }
    res.render('routes/show', { route, fav });
}

module.exports.renderFav = async (req, res) => {
    const user = await User.findById(req.user);
    const routes = [];
    for(let route of user.routes){
        const routess = await Route.findById(route);
        routes.push(routess);
    }
    res.render('routes/fav', { routes })
}

module.exports.markFav = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user);
    user.routes.push(id);
    await user.save();
    // const redirectUrl = req.session.returnTo || '/routes';
    // delete req.session.returnTo;
    // res.redirect(redirectUrl);
    res.redirect(`/routes/${id}`)
}

module.exports.UnFav = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(req.user);
    await User.findByIdAndUpdate(req.user, { $pull: { routes: id } });
    var fav = false;
    const route = await Route.findById(id);
    res.redirect('/routes/fav')
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const route = await Route.findById(id)
    if (!route) {
        req.flash('error', 'Cannot find that route!');
        return res.redirect('/routes');
    }
    res.render('routes/edit', { route });
}

module.exports.updateRoute = async (req, res) => {
    const { id } = req.params;
    // console.log(req.body);
    const route = await Route.findByIdAndUpdate(id, { ...req.body.route });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    route.images.push(...imgs);
    await route.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await route.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated route!');
    res.redirect(`/routes/${route._id}`)
}

module.exports.deleteRoute = async (req, res) => {
    const { id } = req.params;
    const route = await Route.findById(id);
    const name = route.title;
    await Route.findByIdAndDelete(id);
    req.flash('success', `Successfully deleted ${name}`)
    res.redirect('/routes');
}