const express = require('express');
const Geta3Controller = require('../controllers/Geta3Controller');
const passport = require('passport');
const router = express.Router();

router.delete('/delete-geta3/:geta3Id', passport.authenticate('jwt', { session: false }), Geta3Controller.deleteGeta3);
router.get('/list/:carKind', Geta3Controller.Geta3_list);
router.get('/Geta3-detail/:id', Geta3Controller.Geta3_detail);
router.get('/comments/:id', Geta3Controller.fetch_comments);
router.post('/comments/:id', passport.authenticate('jwt', { session: false }), Geta3Controller.add_comment);
router.put('/comments/:id/:commentId', passport.authenticate('jwt', { session: false }), Geta3Controller.edit_comment);
router.delete('/comments/:id/:commentId', passport.authenticate('jwt', { session: false }), Geta3Controller.delete_comment);
router.post('/add-favorite/:id', passport.authenticate('jwt', { session: false }), Geta3Controller.addFavorite);
router.post('/remove-favorite/:id', passport.authenticate('jwt', { session: false }), Geta3Controller.removeFavorite);
router.get('/top-favorites', Geta3Controller.fetch_top_favorites);
router.get('/top-retailers', Geta3Controller.getTopRetailers);
router.get('/search', Geta3Controller.search_Geta3);
router.post('/create', passport.authenticate('jwt', { session: false }), Geta3Controller.Geta3_create_post);
router.get('/geta3/:id/images', Geta3Controller.get_images);

// Add this line for the edit functionality
router.put('/edit-post/:postId', passport.authenticate('jwt', { session: false }), Geta3Controller.editPost);

module.exports = router;
