require('dotenv').config();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// require('dotenv').config();
const sgMail = require('@sendgrid/mail');
console.log(process.env.SENDGRID_API_KEY);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//POST/api/auth/register
const register = async (req, res) => {
    const { name, username, email, password } = req.body;

    if(!name || !username || !email || !password) {
        return res.status(400).json({error: 'All fields are required'});
    }
     try{
        //check if email already exists
        const [existingEmail] = await db.query(
            'SELECT * FROM users WHERE email = ?', [email]
        );
        if(existingEmail.length > 0) {
            return res.status(400).json({error: 'Email already exists'});
        }
         //check username already exists

         const [existingUsername] = await db.query(
            'SELECT * FROM users WHERE username = ?', [username]
        );
        if(existingUsername.length > 0){
            return res.status(400).json({ error: 'Username already taken'});
        }
        
        //Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Save user to database
        const [result] = await db.query(
            'INSERT INTO users (name,username,email,password) VALUES (?,?,?,?)', [name, username, email, hashedPassword]
        );
         
        res.status(201).json({
            message: 'User registored successfully',
            userId: result.insertId
        });
     }
    catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Registored failed'});
    }
}

//POST/api/auth/login

const login = async (req, res) => {
    const { username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({ error: 'username and passwrod are required'});
    }
    
    try{
        const[rows] = await db.query(
            'SELECT * FROM users WHERE username = ?', [username]
        );
        
        if(rows.length === 0)
            return res.status(401).json({ error: 'Invalid username or password'});

        const user = rows[0];

        //Compare entered password with hashed password
        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch) {
            return res.status(401).json({error: 'Invalid email or password'});
        }

        //Create JWT token
        const token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        );
        
        res.json({
            message: 'Login successful',
            token, 
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email
            }
        });
    }
    catch(err){
        console.error(err);
        res.status(500).json({error: 'Login failed'});
    }
};

const forgotPassword = async(req, res) => {
    const {email} = req.body;

    if(!email){
        return res.status(400).json({ error: 'Email is required'});
    }

    try{
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ?',[email]
        );

        if(rows.length === 0)
            return res.json({ message: 'If this email exist, a reset link has been sent'});

        const user = rows[0];
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Save token to database
        await db.query(
        'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
        [resetToken, resetTokenExpiry, user.id]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // Send email
    // Send email
    const msg = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: 'Password Reset Request',
    html: `
      <h2>Password Reset</h2>
      <p>Hi ${user.name},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `
  };
  
  await sgMail.send(msg);

    res.json({ message: 'If this email exists, a reset link has been sent' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to send reset email' });
      }
    };
    
    // POST /api/auth/reset-password
    const resetPassword = async (req, res) => {
      const { token, newPassword } = req.body;
    
      if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
      }
    
      try {
        // Find user with this token
        const [rows] = await db.query(
          'SELECT * FROM users WHERE reset_token = ?', [token]
        );
    
        if (rows.length === 0) {
          return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
    
        const user = rows[0];
        if (new Date() > new Date(user.reset_token_expiry)) {
            return res.status(400).json({ error: 'Reset token has expired' });
          }
      
          // Hash new password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(newPassword, salt);
      
          // Update password and clear token
          await db.query(
            'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [hashedPassword, user.id]
          );
      
          res.json({ message: 'Password reset successfully' });
      
        } catch (err) {
          console.error(err);
          res.status(500).json({ error: 'Failed to reset password' });
        }
      };
    
module.exports = {register, login, forgotPassword, resetPassword};

