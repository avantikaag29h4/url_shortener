const validateUrl =(req,res,next) => {
    const {originalUrl} = req.body;

    if(!originalUrl){
        return res.status(400).json({error: 'originalUrl is required'});
    }

    try {
        new URL(originalUrl);
    }
    catch{
        return res.status(400).json({error: 'Invalid URL format'});
    }

    next();
};
module.exports = validateUrl;