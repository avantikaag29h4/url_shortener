const db = require('../config/db');
// const {nanoid} = require('nanoid');
const nanoid = require('nanoid').nanoid;
require('dotenv').config();

//POST 
const shortenUrl = async(req,res) => {
const{originalUrl} = req.body;
try{
    const[existing] =await db.query(
        'SELECT * FROM urls WHERE original_url =?',[originalUrl]
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
        'INSERT INTO urls (original_url, short_code) VALUES (?,?)',
        [originalUrl,shortCode]
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
    try{
        const[rows] = await db.query(
            'SELECT * FROM urls WHERE short_code = ?',[shortCode]
        );
        if(rows.length === 0)
            return res.status(404).json({error: 'SHORT URLs not found'});

        //increment click_count
        await db.query(
            'UPDATE urls SET click_count=click_count+1 WHERE short_code =? ',[shortCode]
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
    
    try{
        const[rows] = await db.query(
            'SELECT id, original_url, short_code, click_count, created_at FROM urls ORDER BY created_at DESC' 
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

    try{
        const [result] = await db.query(
            'DELETE FROM urls WHERE short_code =?',[shortCode]
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