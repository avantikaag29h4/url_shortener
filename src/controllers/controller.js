const db = require('../config/db');
// const {nanoid} = require('nanoid');
const nanoid = require('nanoid').nanoid;
require('dotenv').config();

//POST 
const shortenUrl = async(req,res) => {
const{originalUrl} = req.body;
const userId = req.user.userId;

try{
    const[existing] =await db.query(
        'SELECT * FROM urls WHERE original_url =? AND user_id = ? ',[originalUrl, userId]
    );
    if(existing.length>0){
        const url = existing[0];
        return res.json({
            shortUrl: `${process.env.BASE_URL}/${url.short_code}`,
            shortCode: url.short_code,
            originalUrl: url.original_url,
        });
    }

    const shortCode= nanoid(6);
    await db.query(
        'INSERT INTO urls (original_url, short_code, user_id) VALUES (?,?,?)',
        [originalUrl, shortCode, userId]
    );

    res.status(201).json({
        shortUrl: `${process.env.BASE_URL}/${shortCode}`,
        shortCode,
        originalUrl,
      });

    } 
    catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to shorten URL' });
    }
  };
 //GET 

 const redirectUrl = async(req, res) =>{
    const {shortCode} = req.params;
    const userId = req.user.userId;
    try{
        const[rows] = await db.query(
            'SELECT * FROM urls WHERE short_code = ? AND user_id = ? ',[shortCode,userId]
        );
        if(rows.length === 0)
            return res.status(404).json({error: 'SHORT URLs not found'});

        //increment click_count
        await db.query(
            'UPDATE urls SET click_count=click_count+1 WHERE short_code = ? AND user_id = ?',[shortCode, userId]
        );
        res.redirect(302, rows[0].original_url)
    }
    catch(err) {
        console.error(err);
        res.status(500).json({error: 'Redirect failed'});
    }
 };

 // getAllUrls
  
const getAllUrls = async(req,res) =>{

    const userId = req.user.userId;
    
    try{
        const[rows] = await db.query(
            'SELECT id, original_url, short_code, click_count, created_at FROM urls WHERE user_id = ? ORDER BY created_at DESC', 
            [userId]
        );

        res.json(rows);
    }
    catch(err){
        res.status(500).json({error: 'Failed to fetch all URLs '});
    }
};

//delete

const deleteUrl = async(req,res) => {
    const{shortCode} = req.params;
    const userId = req.user.userId;

    try{
        const [result] = await db.query(
            'DELETE FROM urls WHERE short_code =? AND user_id = ?',[shortCode, userId]
        );
        if(result.affectedRows === 0)
            return res.status(404).json({error: 'Short URLs not found'});

        res.status(204).send();

    }
    catch(err){
        res.status(500).json({ error: 'Failed to delete URL'});
    }
};

module.exports = { shortenUrl, redirectUrl, getAllUrls, deleteUrl };