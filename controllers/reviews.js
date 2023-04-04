const Route = require('../models/route');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const route = await Route.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    route.reviews.push(review);
    await review.save();
    await route.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/routes/${route._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Route.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/routes/${id}`);
}