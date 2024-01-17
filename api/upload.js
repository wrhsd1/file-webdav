const express = require('express');
const multer = require('multer');
const webdav = require('webdav');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const client = webdav.createClient(process.env.WEBDAV_URL, {
    username: process.env.WEBDAV_USERNAME,
    password: process.env.WEBDAV_PASSWORD,
  });

  client.putFileContents('/' + file.originalname, file.buffer).then(() => {
    res.json({ webdavUrl: process.env.WEBDAV_URL + file.originalname });
  });
});

module.exports = app;
