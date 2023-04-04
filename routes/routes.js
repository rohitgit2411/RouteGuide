const express = require('express');
const router = express.Router();
const routes = require('../controllers/routes');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateRoute } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Route = require('../models/route');

router.route('/')
    .get(catchAsync(routes.index))
    .post(isLoggedIn, upload.array('image'), validateRoute, catchAsync(routes.createRoute))

router.route('/fav')
    .get(isLoggedIn, routes.renderFav); 

router.get('/new', isLoggedIn, routes.renderNewForm)

router.route('/:id/fav')
    .post(isLoggedIn, catchAsync(routes.markFav))
    // .get(isLoggedIn, catchAsync(routes.renderFav)) 

router.route('/:id/Unfav')
    .post(isLoggedIn, catchAsync(routes.UnFav))

router.route('/:id')
    .get(catchAsync(routes.showRoute))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateRoute, catchAsync(routes.updateRoute))
    .delete(isLoggedIn, isAuthor, catchAsync(routes.deleteRoute));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(routes.renderEditForm))  

module.exports = router;