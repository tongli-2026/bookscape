const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcrypt');
const config = require('./config');
const connection = require('./db/connection');

//set up passport to use Google OAuth 2.0 for authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: config.google_client_id,
      clientSecret: config.google_client_secret,
      callbackURL: config.google_callback_url,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        const query = 'SELECT * FROM users WHERE email = $1';
        const result = await connection.query(query, [email]);

        // check if user exist, if yes, return user info
        // else, create a new user and return the new user
        if (result.rows.length > 0) {
          return done(null, result.rows[0]);
        } else {
          const crypto = require("crypto");
          const temp = crypto.randomBytes(32).toString("hex"); 
          const placeholderPassword= await bcrypt.hash(temp,10);
          const insertQuery = `
            INSERT INTO users (name, email, password) 
            VALUES ($1, $2, $3) 
            RETURNING *
          `;
          const newUser = await connection.query(insertQuery, [
            profile.displayName,
            email,
            placeholderPassword,
          ]);

          return done(null, newUser.rows[0]);
        }
      } catch (error) {
        console.error('error happend during Google authentication:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
