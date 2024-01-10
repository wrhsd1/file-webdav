// api/upload.js

const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const { format } = require('date-fns');
const path = require('path');
const webdav = require('webdav');

const upload = multer({ 
  dest: '/tmp/',
  limits: { fileSize: 200 * 1024 * 1024 } // limit file size to 200MB
});

let webdavClient;

// Initialize webdav client
(async () => {
  webdavClient = webdav.createClient(
    'https://uno.teracloud.jp/dav/',
    {
      username: 'wrhsd',
      password: 'kjLxHLMb9CK7Gi9e'
    }
  );
})();

module.exports = async (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      res.send(`文件大小超过最大限制200M`);
      return;
    } else if (err) {
      console.error(err);
      res.status(500).send('Error uploading file');
      return;
    }

    const { file } = req;
    if (!file) {
      res.status(400).send('No file uploaded');
      return;
    }

    const fileStream = fs.createReadStream(file.path);

    // Generate a 4-character random string
    const randomString = crypto.randomBytes(2).toString('hex');

    // Get the extension of the original file
    const ext = path.extname(file.originalname);

    // Get today's date and format it as 'YYYY-MM-DD'
    const today = format(new Date(), 'yyyy-MM-dd');

    // Construct the file name and path
    const dirName = `imgs/${today}`;
    const fileName = `${randomString}${ext}`;

    try {
      // Create the directory if it doesn't exist
      if (!(await webdavClient.exists(dirName))) {
        await webdavClient.createDirectory(dirName);
      }

      await webdavClient.putFileContents(`${dirName}/${fileName}`, fileStream);
      const publicUrl = `http://138.2.119.225:3122/files/${dirName}/${fileName}`;
      res.send(`上传成功，URL: ${publicUrl}`);

      fs.unlink(file.path, err => {
        if (err) console.error(`Error deleting temporary file: ${err}`);
      });
    } catch (err) {
      console.log(err);
      res.status(500).send('Error uploading file');
    }
  });
};
