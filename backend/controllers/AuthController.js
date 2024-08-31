const Geta3 = require('../models/Geta3');
const User = require('../models/Users');
const UserFavGeta3 = require("../models/UserFavGeta3");
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const mongoose = require('mongoose');


exports.register = async (req, res) => {
  const { FirstName, LastName, Email, PhoneNumber, Password, Username } = req.body;
  try {
    console.log('Register endpoint hit with:', req.body);

    const userExists = await User.findOne({ $or: [{ Email }, { Username }] });
    if (userExists) {
      console.log('User or Username already exists:', Email, Username);
      return res.status(400).json({ msg: "User or Username already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const otpCode = crypto.randomBytes(3).toString('hex');
    const otpExpires = Date.now() + 20 * 60 * 1000; 

    const newUser = new User({
      FirstName,
      LastName,
      Email,
      PhoneNumber,
      Username,
      Password: hashedPassword,
      otp: {
        code: otpCode,
        expiresAt: otpExpires
      }
    });


    await newUser.save();

    const emailOptions = {
      from: process.env.EMAIL,
      to: Email,
      subject: 'Email Verification OTP',
      html: `<h2>Hello ${FirstName},</h2>
             <p>Please use the following OTP to verify your email:</p>
             <p><b>${otpCode}</b></p>
             <p>This OTP will expire in 20 minutes.</p>`
    };

    try {
      await sendEmail(emailOptions);
    } catch (emailError) {
    }

    res.status(201).json({ msg: "User registered. Please check your email to verify your account." });
  } catch (error) {
    console.error('Error in register endpoint:', error);
    res.status(500).json({ msg: error.message });
  }
};

exports.logout = asyncHandler(async (req, res) => {
  const { refreshToken, token } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'No refresh token provided' });
  }
  if (!token) {
    return res.status(400).json({ message: 'No token provided' });
  }
  const user = await User.findOne({ refreshToken }).exec();
  if (!user) {
    return res.status(400).json({ message: 'Invalid refresh token' });
  }

  // Clear the refreshToken (set it to null)
  user.refreshToken = null;
  user.token = null;
  await user.save();

  res.json({ message: 'User logged out successfully' });
});

exports.verifyEmail = async (req, res) => {
  const { Email, code } = req.body;
  try {
    console.log('Verify email endpoint hit with:', req.body);

    const user = await User.findOne({ Email });
    if (!user) {
      console.log('User not found:', Email);
      return res.status(400).json({ msg: "Invalid email or code" });
    }

    console.log('User found:', user);

    const currentTime = new Date();
    if (user.otp.code !== code) {
      console.log('Invalid OTP:', code);
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    if (user.otp.expiresAt < currentTime) {
      console.log('Expired OTP:', user.otp.expiresAt);
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.IsEmailVerified = true;
    user.otp = undefined; // Clear the OTP field
    await user.save();

    console.log('Email verified successfully for user:', Email);

    res.status(200).json({ msg: "Email verified successfully" });
  } catch (error) {
    console.error('Error in verifyEmail endpoint:', error);
    res.status(500).json({ msg: error.message });
  }
};

exports.checkEmail = asyncHandler(async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).json({ msg: 'Email is required' });
  }

  try {
    const user = await User.findOne({ Email });
    if (user) {
      return res.status(200).json({ msg: 'Email exists' });
    } else {
      return res.status(404).json({ msg: 'Email not found' });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});
exports.login = async (req, res) => {
  const { LoginIdentifier, Password } = req.body;

  if (!LoginIdentifier || !Password) {
    return res.status(400).json({ msg: "Login identifier and Password are required" });
  }

  try {
    const user = await User.findOne({
      $or: [
        { Email: LoginIdentifier },
        { PhoneNumber: LoginIdentifier },
        { Username: LoginIdentifier }
      ]
    });

    if (!user) {
      return res.status(400).json({ msg: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(Password, user.Password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.IsEmailVerified) {
      return res.status(400).json({ msg: "Please verify your email to login" });
    }

    const accessToken = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET, { expiresIn: '1h' }); //Login
    const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' }); //Refresh

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        Username: user.Username,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        PhoneNumber: user.PhoneNumber,
        isAdmin: user.isAdmin,
        IsEmailVerified: user.IsEmailVerified
      }
    });
  } catch (error) {
    console.error('Error in login endpoint:', error);
    res.status(500).json({ msg: 'Internal server error' });
  }
};


exports.forgotPassword = async (req, res) => {
  const { Email } = req.body;
  try {
    const user = await User.findOne({ Email });
    if (!user) return res.status(400).json({ msg: "User does not exist" });

    const otpCode = crypto.randomBytes(3).toString('hex');
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();

    const emailOptions = {
      from: process.env.EMAIL,
      to: Email,
      subject: 'Password Reset OTP',
      html: `<h2>Hello ${user.FirstName},</h2>
             <p>Please use the following OTP to reset your password:</p>
             <p><b>${otpCode}</b></p>
             <p>This OTP will expire in 10 minutes.</p>`
    };

    await sendEmail(emailOptions);

    res.status(200).json({ msg: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};


exports.refresh_token = async (req, res) => {
  const { refreshToken } = req.body;
  console.log('Refresh token: ', refreshToken);

  if (!refreshToken) {
    return res.status(400).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    console.log('Token content: ', decoded);

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const accessToken = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ accessToken, user });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


exports.sendPhoneVerification = async (req, res) => {
  const { PhoneNumber } = req.body;
  const otpCode = crypto.randomBytes(3).toString('hex');
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  try {
    const user = await User.findOne({ PhoneNumber });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    user.otp = { code: otpCode, expiresAt: otpExpires };
    await user.save();

    const response = await axios.post(process.env.TELESIGN_VOICE_URL, {
      phone_number: PhoneNumber,
      message: `Your verification code is ${otpCode}`,
      message_type: "OTP"
    }, {
      headers: {
        "Authorization": `Bearer ${process.env.TELESIGN_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (response.status === 200) {
      res.status(200).json({ msg: "Verification code sent to phone" });
    } else {
      throw new Error("Failed to send verification code");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.verifyPhoneNumber = async (req, res) => {
  const { PhoneNumber, code } = req.body;

  try {
    const user = await User.findOne({ PhoneNumber });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.otp.code !== code || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.IsPhoneVerified = true;
    user.otp = undefined;
    await user.save();

    res.status(200).json({ msg: "Phone number verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { newPassword, otpCode } = req.body;
  
  try {
    let user;
    
    // Check if user is logged in
    if (req.user) {
      user = await User.findById(req.user.id);
    } else {
      // Check OTP for non-logged-in users
      const { Email } = req.body;
      if (!Email || !otpCode) {
        return res.status(400).json({ msg: 'Email and OTP code are required' });
      }

      user = await User.findOne({ Email });
      if (!user) return res.status(400).json({ msg: 'User does not exist' });

      if (user.otp.code !== otpCode || user.otp.expiresAt < Date.now()) {
        return res.status(400).json({ msg: 'Invalid or expired OTP' });
      }
    }

    const salt = await bcrypt.genSalt(10);
    user.Password = await bcrypt.hash(newPassword, salt);

    // Clear OTP after successful password change
    if (!req.user) {
      user.otp = undefined;
    }

    await user.save();

    res.status(200).json({ msg: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ msg: error.message });
  }
};


exports.updateLocation = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the location pattern to include shortened URLs
    const locationPattern = /^https:\/\/(www\.google\.com\/maps\/place\/.+|maps\.app\.goo\.gl\/.+)/;
    if (!locationPattern.test(req.body.Location)) {
      return res.status(400).json({ message: 'Invalid location link format' });
    }

    user.Location = req.body.Location;
    await user.save();

    res.status(200).json({ message: 'Location updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userGeta3s = await Geta3.find({ User: new mongoose.Types.ObjectId(userId) }).exec();
    const userFavorites = await UserFavGeta3.find({ User: new mongoose.Types.ObjectId(userId) }).populate('Geta3').exec();

    res.status(200).json({
      profile: {
        Username: user.Username,
        Email: user.Email,
        isAdmin: user.isAdmin,
        Location: user.Location,
        IsEmailVerified: user.IsEmailVerified,
        PhoneNumber: user.PhoneNumber,
        IsPhoneVerified: user.IsPhoneVerified,
        postCount: userGeta3s.length
      },
      UserGeta3s: userGeta3s,
      userFavorites: userFavorites.map(fav => fav.Geta3),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});



exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.params.userId;

    // Delete all posts by the user
    await Geta3.deleteMany({ User: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User and their posts deleted successfully." });
  } catch (error) {
    console.error("Error deleting user and their posts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

exports.Geta3_authorize = asyncHandler(async (req, res, next) => {
  const Geta3s = await Geta3.find({ isAuthorized: false }).populate('User').exec();
  if (!Geta3s || Geta3s.length === 0) {
    return res.status(404);
  }
  return res.status(200).json({ Geta3s });
});

exports.admin_acceptance = asyncHandler(async (req, res, next) => {
  try {
    const { accept } = req.body;
    const geta3 = await Geta3.findById(req.params.id).populate('User').exec();

    if (!geta3) {
      return res.status(404).json({ message: 'Geta3 not found' });
    }

    if (accept) {
      geta3.isAuthorized = true;
      await geta3.save();
      return res.status(200).json({ message: 'Geta3 accepted', data: geta3 });
    } else {
      await Geta3.findByIdAndDelete(req.params.id);
      return res.status(200).json({ message: 'Geta3 unauthorized and deleted' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

exports.fetchUserPosts = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    const posts = await Geta3.find({ User: userId }).exec();

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: 'No posts found for this user' });
    }

    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});