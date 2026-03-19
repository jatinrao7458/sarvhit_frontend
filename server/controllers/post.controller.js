const Post = require('../models/Post');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  try {
    const { content, image, tags } = req.body;
    const trimmedContent = (content || '').trim();

    if (!trimmedContent && !image) {
      return res.status(400).json({
        success: false,
        message: 'Post content or image is required',
      });
    }

    if (image) {
      const isBase64Image = /^data:image\/(png|jpe?g|webp|gif);base64,/.test(image);
      if (!isBase64Image) {
        return res.status(400).json({
          success: false,
          message: 'Invalid image format',
        });
      }
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const post = new Post({
      authorId: req.user.userId,
      authorRole: user.userType,
      content: trimmedContent,
      image: image || null,
      tags: tags || [],
      likes: 0,
      comments: [],
      shares: 0,
    });

    const savedPost = await post.save();
    await savedPost.populate('authorId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: savedPost,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating post',
      error: error.message,
    });
  }
};

exports.getPostFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .populate('authorId', 'firstName lastName email userType')
      .populate('likedBy', 'firstName lastName')
      .populate('comments.userId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments();

    res.json({
      success: true,
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalPosts: total,
      },
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching posts',
      error: error.message,
    });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const isLiked = post.likedBy.includes(userId);

    if (isLiked) {
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.json({
      success: true,
      message: isLiked ? 'Post unliked' : 'Post liked',
      post,
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking post',
      error: error.message,
    });
  }
};

exports.commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.comments.push({
      userId: req.user.userId,
      text,
      createdAt: new Date(),
    });

    await post.save();
    await post.populate('comments.userId', 'firstName lastName');

    res.json({
      success: true,
      message: 'Comment added',
      post,
    });
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({
      success: false,
      message: 'Error commenting on post',
      error: error.message,
    });
  }
};

exports.sharePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    post.shares += 1;
    await post.save();

    res.json({
      success: true,
      message: 'Post shared',
      post,
    });
  } catch (error) {
    console.error('Error sharing post:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing post',
      error: error.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    if (post.authorId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this post',
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting post',
      error: error.message,
    });
  }
};
