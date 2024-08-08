const express = require('express')
const app = express()

const User = require('../model/user_model')

const axios = require('axios')
const tokken = require('otp-generator')
require('dotenv').config()

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI

// Initiates the Google Login flow
app.get('/auth/google',  (req, res) => {
  const scope = encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  res.redirect(url);
});


// Callback URL for handling the Google Login response
app.get('/auth/google/callback',async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token, id_token, refresh_token } = data;

    // Use access_token or id_token to fetch user profile
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let user = await User.findOne({ email: profile.email });

    if (!user) {
      user = new User({
        password: profile.id,
        fullName: profile.name,
        email: profile.email,
        refreshToken: refresh_token, // Store the refresh token
        refferal:tokken.generate(16)
      });
      await user.save();
      req.session.user = user;
      console.log('new user loggedin using google auth')
      res.redirect('/');
    } 

    else if(user.is_blocked === true){
        delete req.session.user;
        req.flash('message','Your account has been blocked by an administrator.')
        return res.redirect('/login')
      }

    else {
      console.log('exiisting user loggedin using google auth')
      user.refreshToken = refresh_token; // Update refresh token if necessary
      await user.save();
      req.session.user = user;
      return res.redirect('/');
    }

    // Set user session
  
    
  } catch (error) {
    res.redirect('/login');
    console.error('Error:', error.response.data.error);
  }
});

const refreshAccessToken = async (refreshToken) => {
  try {
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });
    return {
      accessToken: data.access_token,
      expiresIn: data.expires_in,
    };
  } catch (error) {
    console.error('Error refreshing access token:', error.response.data.error);
    throw error;
  }
};

const isTokenExpired = (expiryDate) => {
  const now = new Date();
  return now >= expiryDate;
};

const getUserProfile = async (user) => {
  let accessToken = user.accessToken;

  // Check if access token is expired and refresh if necessary
  if (!accessToken || isTokenExpired(user.accessTokenExpiresAt)) {
    const { accessToken: newAccessToken, expiresIn } = await refreshAccessToken(user.refreshToken);
    accessToken = newAccessToken;
    
    // Update user's access token and expiration time
    user.accessToken = newAccessToken;
    user.accessTokenExpiresAt = new Date(Date.now() + expiresIn * 1000); // Convert expiresIn to milliseconds
    await user.save();
  }

  // Use the refreshed access token to fetch user profile
  const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  return profile;
};


  
  module.exports = app;
