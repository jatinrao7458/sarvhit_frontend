const express = require('express');
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create post
router.post('/', authMiddleware, postController.createPost);

// Get social feed
router.get('/', postController.getPostFeed);

// Like post
router.post('/:postId/like', authMiddleware, postController.likePost);

// Comment on post
router.post('/:postId/comment', authMiddleware, postController.commentOnPost);

// Share post
router.post('/:postId/share', authMiddleware, postController.sharePost);

// Delete post
router.delete('/:postId', authMiddleware, postController.deletePost);

module.exports = router;
