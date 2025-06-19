require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let urlDatabase = [];
let urlId = 1;

// POST endpoint to create a short URL
app.post('/api/shorturl', (req, res) => {
  let original_url = req.body.url;
  // Validate URL format
  try {
    let urlObj = new URL(original_url);
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return res.json({ error: 'invalid url' });
    }
    // DNS lookup
    dns.lookup(urlObj.hostname, (err) => {
      if (err) {
        return res.json({ error: 'invalid url' });
      } else {
        // Store and return short url
        let found = urlDatabase.find(entry => entry.original_url === original_url);
        if (found) {
          return res.json({ original_url: found.original_url, short_url: found.short_url });
        }
        let entry = { original_url, short_url: urlId };
        urlDatabase.push(entry);
        urlId++;
        return res.json(entry);
      }
    });
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }
});

// GET endpoint to redirect to original URL
app.get('/api/shorturl/:short_url', (req, res) => {
  let short_url = parseInt(req.params.short_url);
  let entry = urlDatabase.find(e => e.short_url === short_url);
  if (entry) {
    return res.redirect(entry.original_url);
  } else {
    return res.json({ error: 'invalid url' });
  }
});



app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
