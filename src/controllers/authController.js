const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

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
            'SELECT * FROM users WHERE username = ?', [email]
        );
        
        if(rows.length === 0)
            return res.status(401).json({ error: 'Invalid email or password'});

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
module.exports = {register, login};
