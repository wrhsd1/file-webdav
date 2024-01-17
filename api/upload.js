const multer = require('multer');
const webdav = require('webdav');
const upload = multer({ dest: 'uploads/' });

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  upload.single('file')(req, res, (err) => {
    if (err) {
      res.status(500).send(err);
      return;
    }

    const file = req.file;
    const client = webdav.createClient(process.env.WEBDAV_URL, {
      username: process.env.WEBDAV_USERNAME,
      password: process.env.WEBDAV_PASSWORD,
    });

    client.putFileContents('/' + file.originalname, file.buffer).then(() => {
      res.json({ webdavUrl: process.env.WEBDAV_URL + file.originalname });
    });
  });
};
