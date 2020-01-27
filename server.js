require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const MOVIES = require('./movies-data-small.json');
const cors = require('cors');
const helmet = require('helmet');


const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
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
  let results = MOVIES;
  if (num && num !==0) {
    results=results
      .filter(movie => {
        return movie.avg_vote >= num;
      })
      .sort((a, b) => {
        return a.avg_vote > b.avg_vote ? 1 : a.avg_vote < b.avg_vote ? -1 : 0;
      });
  }
  if (genre && genre !=='') {
    results=results.filter(a=> a 
      .genre
      .toLowerCase() 
      .includes(genre.toLowerCase())
    );
  }
  if (country && country !=='') {
    results=results.filter(a=> a 
      .country
      .toLowerCase() 
      .includes(country.toLowerCase())
    );
  }

  res.json(results);
});

app.use((error, req, res, next) => {
  let response
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' }}
  } else {
    response = { error }
  }
  res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});