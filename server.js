require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const MOVIES = require('./movies-data-small.json');
const cors = require('cors');
const helmet = require('helmet');


const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
  console.log('validate bearer token middleware');
  const authToken = req.get('Authorization').split(' ')[1] || '';
  const apiToken = process.env.API_TOKEN;
  if (authToken !== apiToken) {
    return res.status(401).json({ error: 'Unauthorized request' });
  }
  next();
});

app.get('/movie', (req, res) => {
  const { genre ='',country ='', num= 0 } = req.query;

  if (!['Animation', 'Drama', 'Romantic', 'Comedy', 'Spy', 'Thriller', 'Crime', 'Adventure', 'Documentary', ''].includes(genre)) {
    return res
      .status(400)
      .send('genre is not available');
  }
  if (!['','United States', 'Italy', 'Great Britain', 'France', 'Hungary', 'China'].includes(country)) {
    return res
      .status(400)
      .send('country is not available');
  }
  const co=MOVIES;
  let results = MOVIES;
  if (num && num !==0) {
    results=co
      .filter(movie => {
        return movie.avg_vote >= num;
      })
      .sort((a, b) => {
        return a.avg_vote > b.avg_vote ? 1 : a.avg_vote < b.avg_vote ? -1 : 0;
      });
  }
  if (genre && genre !=='') {
    results=co.filter(a=> a 
      .genre
      .toLowerCase() 
      .includes(genre.toLowerCase())
    );
  }
  if (country && country !=='') {
    results=co.filter(a=> a 
      .country
      .toLowerCase() 
      .includes(country.toLowerCase())
    );
  }

  res.json(results);
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});