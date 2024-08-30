const multer = require('multer');
const path = require('path');
const Geta3 = require("../models/Geta3");
const Comment = require("../models/Comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const UserFavGeta3 = require("../models/UserFavGeta3");
const mongoose = require('mongoose');
const User = require("../models/Users");
const express = require('express');

const app = express(); // This is where 'app' is defined

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!'); // Ensure that only image files are allowed
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit per file
});


exports.Geta3_create_post = [
  upload.array('img', 10), // Allow up to 10 images
  body("title", "Title must not be empty!").trim().isLength({ min: 1 }).escape(),
  body("description", "Description must not be empty").isLength({ min: 1 }).escape(),
  body("related_link").trim().escape(),
  body("condition", "Condition must be 'new', 'used', or 'like new'").trim().isIn(['new', 'used', 'like new']).escape(),
  body("carType", "Car type must not be empty").trim().isLength({ min: 1 }).escape(),
  body("carModel", "Car model must not be empty").trim().isLength({ min: 1 }).escape(),
  body("carManufacturingYear", "Car Manufacturing Year must be a valid year").isInt({ min: 1886, max: new Date().getFullYear() }), // Validate year
  body("price", "Price must be a valid number").isFloat({ min: 0 }).escape(), // Validate price
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User must be logged in to create a post." });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const images = req.files.map(file => `./uploads/${file.filename}`); // Store all images in an array

      // Ensure there is at least one image
      if (images.length === 0) {
        return res.status(400).json({ message: "At least one image is required." });
      }

      const geta3 = new Geta3({
        User: req.user._id,
        Title: req.body.title,
        isAuthorized: req.user.isAdmin,
        Description: req.body.description,
        Related_link: req.body.related_link,
        condition: req.body.condition,
        brand: req.body.carType,
        carModel: req.body.carModel,
        carManufacturingYear: req.body.carManufacturingYear,
        price: req.body.price,
        imgs: images, // Save all images in the imgs array
      });

      await geta3.save();

      // Increment post count
      await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: 1 } });

      return res.status(201).json({ message: "Geta3 created successfully", geta3 });
    } catch (err) {
      console.error("Error occurred while creating Geta3", err);
      res.status(500).json({ err: err, error: "Internal Server Error" });
    }
  }),
];


exports.fetch_top_favorites = asyncHandler(async (req, res) => {
  try {
    const topFavorites = await Geta3.find({ isAuthorized: true })
      .sort({ favoritesCount: -1 })
      .limit(10)
      .populate('User')
      .exec();

    if (!topFavorites || topFavorites.length === 0) {
      return res.status(404).json({ message: 'No top favorite posts found' });
    }

    // Update the imgs field with the correct URL paths
    const updatedFavorites = topFavorites.map(post => ({
      ...post._doc,
      imgs: post.imgs.map(img => `${req.protocol}://${req.get('host')}/uploads/${path.basename(img)}`),
    }));

    return res.status(200).json(updatedFavorites);
  } catch (error) {
    console.error('Error fetching top favorite posts:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});





exports.search_Geta3 = asyncHandler(async (req, res, next) => {
  const { searchTerm, carKind, condition, carModel, minPrice, maxPrice } = req.query;

  try {
    let query = {
      isAuthorized: true,
    };

    if (searchTerm) {
      query.$text = { $search: searchTerm };
    }

    if (carKind) {
      query.brand = { $regex: new RegExp(`^${carKind}$`, 'i') };
    }

    if (condition) {
      query.condition = condition;
    }

    if (carModel) {
      query.carModel = carModel;
    }

    if (minPrice) {
      query.price = { ...query.price, $gte: parseFloat(minPrice) };
    }

    if (maxPrice) {
      query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    }

    const searchResults = await Geta3.find(query)
      .select("Title Description Cover brand carModel price")
      .limit(10)
      .exec();

    if (searchResults.length === 0) {
      return res.status(404).json({ message: 'No matching Geta3s found' });
    }

    const updatedResults = searchResults.map(post => ({
      ...post._doc,
      Cover: `${req.protocol}://${req.get('host')}/uploads/${path.basename(post.Cover)}`,
    }));

    res.status(200).json({ results: updatedResults });
  } catch (error) {
    console.error('Error searching Geta3s:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



exports.Geta3_list = asyncHandler(async (req, res) => {
  const carKind = req.params.carKind.toLowerCase();
  console.log('Car Kind received:', carKind);

  try {
    const posts = await Geta3.find({ brand: { $regex: new RegExp(`^${carKind}$`, 'i') }, isAuthorized: true })
      .sort({ Title: 1 })
      .populate('User')
      .exec();

    if (posts.length === 0) {
      console.log('No posts available');
      return res.status(404).json({ message: 'No posts available' });
    }

    // Update the imgs field to only include the first image URL
    const updatedPosts = posts.map(post => {
      const firstImageUrl = post.imgs.length > 0 ? `${req.protocol}://${req.get('host')}/uploads/${path.basename(post.imgs[0])}` : '/path/to/default-placeholder.png';
      return {
        ...post._doc,
        imgs: [firstImageUrl], // Ensure imgs array only has the first image URL
      };
    });

    return res.status(200).json(updatedPosts);
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});




exports.deleteGeta3 = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const post = await Geta3.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.User.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.remove();
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Internal Server Error:', error.message);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

  
exports.editPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await Geta3.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.User.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to edit this post' });
    }

    // Update post details
    post.Title = req.body.title || post.Title;
    post.Description = req.body.description || post.Description;
    post.condition = req.body.condition || post.condition;
    post.brand = req.body.brand || post.brand;
    post.carModel = req.body.carModel || post.carModel;
    post.carManufacturingYear = req.body.carManufacturingYear || post.carManufacturingYear;
    post.price = req.body.price || post.price;

    // Update images if provided
    if (req.files && req.files.length > 0) {
      const coverImage = `./uploads/${req.files[0].filename}`;
      const otherImages = req.files.slice(1).map((file) => `./uploads/${file.filename}`);
      post.Cover = coverImage;
      post.imgs = [...(post.imgs || []), ...otherImages]; // Append new images
    }

    await post.save();
    res.status(200).json({ message: 'Post updated successfully', post }); // Return updated post
  } catch (error) {
    console.error('Error editing post:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});




exports.fetch_comments = asyncHandler(async (req, res) => {
  try {
    const comments = await Comment.find({ Geta3: req.params.id }).populate('User').exec();
    if (!comments) {
      return res.status(404).json({ message: 'No comments found' });
    }
    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.add_comment = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Please log in to add a comment' });
  }
  
  try {
    const comment = new Comment({
      Geta3: req.params.id,
      User: req.user._id,
      Comment: req.body.text,
    });
    await comment.save();
    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.edit_comment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.User.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    comment.Comment = req.body.text;
    comment.edited = true;
    await comment.save();
    return res.status(200).json(comment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.delete_comment = asyncHandler(async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    if (comment.User.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await comment.remove();
    return res.status(200).json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Adding a favorite
exports.addFavorite = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Please log in to add to favorites' });
  }

  const userId = req.user._id;
  const geta3Id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(geta3Id)) {
    return res.status(400).json({ message: 'Invalid Geta3 ID' });
  }

  try {
    // Check if the post is already favorited by the user
    const favoriteExists = await UserFavGeta3.findOne({ User: userId, Geta3: geta3Id });
    if (favoriteExists) {
      return res.status(200).json({ message: 'Geta3 already favorited', favoritesCount: favoriteExists.favoritesCount, isFavorited: true });
    }

    // Create new favorite entry
    const newFavorite = new UserFavGeta3({ User: userId, Geta3: geta3Id });
    await newFavorite.save();

    // Update favorites count in the Geta3 document
    const geta3 = await Geta3.findById(geta3Id);
    geta3.favoritesCount += 1;
    await geta3.save();

    res.status(201).json({ favoritesCount: geta3.favoritesCount, isFavorited: true });
  } catch (error) {
    console.error('Error in addFavorite:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.removeFavorite = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Please log in to remove from favorites' });
  }

  const userId = req.user._id;
  const geta3Id = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(geta3Id)) {
    return res.status(400).json({ message: 'Invalid Geta3 ID' });
  }

  try {
    // Find and delete the favorite entry
    const favorite = await UserFavGeta3.findOneAndDelete({ User: userId, Geta3: geta3Id });
    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    // Decrement the favorites count in the Geta3 document
    const geta3 = await Geta3.findById(geta3Id);
    geta3.favoritesCount = Math.max(0, geta3.favoritesCount - 1); // Ensure the count doesn't go below zero
    await geta3.save();

    res.status(200).json({ favoritesCount: geta3.favoritesCount, isFavorited: false });
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.Geta3_detail = asyncHandler(async (req, res) => {
  try {
    const geta3 = await Geta3.findById(req.params.id)
      .populate('User', 'Username FirstName LastName Email PhoneNumber Location')
      .exec();

    if (!geta3) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isFavorited = req.user ? await UserFavGeta3.exists({ User: req.user._id, Geta3: geta3._id }) : false;

    // Convert the image paths to URLs for the main post
    const imagesUrls = geta3.imgs.map(img => `${req.protocol}://${req.get('host')}/uploads/${path.basename(img)}`);

    // Fetch related posts based on the same car kind (brand)
    const relatedPosts = await Geta3.find({
      brand: geta3.brand, // Match posts with the same car kind
      _id: { $ne: geta3._id }, // Exclude the current post
      isAuthorized: true,
    })
      .limit(5)
      .populate('User', 'Username FirstName LastName')
      .exec();

    // Update the related posts to include the first image URL
    const updatedRelatedPosts = relatedPosts.map(post => {
      const firstImageUrl = post.imgs.length > 0 ? `${req.protocol}://${req.get('host')}/uploads/${path.basename(post.imgs[0])}` : null;
      return {
        ...post._doc,
        imgs: post.imgs.map(img => `${req.protocol}://${req.get('host')}/uploads/${path.basename(img)}`), // Include all images URLs
        firstImage: firstImageUrl, // Include the first image URL
      };
    });

    return res.status(200).json({
      geta3: { ...geta3._doc, imgs: imagesUrls }, // Include all image URLs
      isFavorited,
      relatedPosts: updatedRelatedPosts, // Send updated related posts with all images
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});






exports.deleteGeta3 = asyncHandler(async (req, res) => {
  const { geta3Id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(geta3Id)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const post = await Geta3.findById(geta3Id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.User.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();  // Updated to use deleteOne instead of remove

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error in deleteGeta3:', error);  // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

exports.getTopRetailers = asyncHandler(async (req, res) => {
  try {
    const topRetailers = await User.aggregate([
      {
        $lookup: {
          from: 'geta3', // Ensure 'geta3s' is the correct collection name
          localField: '_id',
          foreignField: 'User', // Ensure 'User' is the correct field in 'geta3s'
          as: 'posts'
        }
      },
      {
        $addFields: {
          postCount: { $size: '$posts' } // Calculate the number of posts for each user
        }
      },
      {
        $match: {
          postCount: { $gt: 0 } // Only include users with at least one post
        }
      },
      {
        $sort: { postCount: -1 } // Sort users by post count in descending order
      },
      {
        $project: {
          FirstName: 1,
          LastName: 1,
          Email: 1,
          Username: 1,
          PhoneNumber: 1,
          postCount: 1, // Include post count in the result
          posts: {
            $map: {
              input: { $slice: ['$posts', 10] }, // Include the first 10 posts for each user
              as: 'post',
              in: {
                _id: '$$post._id',
                Title: '$$post.Title',
                Description: '$$post.Description',
                price: '$$post.price',
                condition: '$$post.condition',
                imgs: {
                  $cond: {
                    if: { $gt: [{ $size: '$$post.imgs' }, 0] },
                    then: { $concat: [`${req.protocol}://${req.get('host')}/uploads/`, { $arrayElemAt: ['$$post.imgs', 0] }] },
                    else: null
                  }
                }
              }
            }
          }
        }
      },
      {
        $limit: 6 // Limit the results to the top 6 retailers
      }
    ]);

    console.log('Top Retailers:', topRetailers); // Debugging output

    if (topRetailers.length === 0) {
      console.log('No retailers found with posts.');
      return res.status(404).json({ message: 'No retailers found' });
    }

    return res.status(200).json(topRetailers);
  } catch (error) {
    console.error('Error fetching top retailers:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


exports.get_images = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return res.status(400).json({ message: 'Invalid post ID' });
  }

  try {
    const geta3 = await Geta3.findById(postId).select('imgs').exec();

    if (!geta3) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const imagesUrls = geta3.imgs.map(img => `${req.protocol}://${req.get('host')}/uploads/${path.basename(img)}`);

    res.status(200).json({ images: imagesUrls });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
