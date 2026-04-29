const axios = require('axios');

async function ensureAuthenticated(req, res, next) {
  
  if (!req.body || !req.body.accessToken) {
    return res.status(401).send('Unauthorized: Access token is required');
  }

  const accessToken = req.body.accessToken;

  try {
    const response = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'tictactoe-server'
      }
    });
    req.user = response.data;
    
    next();
  } catch (error) {
    console.log('Error verifying access token with GitHub:', error);
    res.status(401).send('Unauthorized: Invalid access token');
  }
}

module.exports = { ensureAuthenticated };
