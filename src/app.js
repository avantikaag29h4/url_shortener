const express = require('express');
const dotenv =  require('dotenv');
dotenv.config();
const cors = require('cors');  
app.use(cors());               
const { router: urlRoutes, redirectUrl } = require('./routes/urls');
const app = express();
const db=require('./config/db');
const PORT = process.env.PORT||3000;
app.use(express.json());
app.get('/:shortCode', redirectUrl);  
app.use('/api/urls',urlRoutes);

app.get('/',(req,res) => {
    res.json({message: 'URL SHORTNER API RUNNING'});
});

app.use((req,res) => {
    res.status(404).json({error: 'Route not found'});
})

app.use((err,req,res,next) => {
    console.error(err.stack);
    res.status(500).json({error:'Something went wrong'});
});

db.query('SELECT 1')
  .then(() => {
    console.log('MySQL connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('MySQL connection failed:', err.message);
    process.exit(1);
  });
