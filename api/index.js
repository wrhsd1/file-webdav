const express = require('express');
const multer = require('multer');
const fs = require('fs');
const crypto = require('crypto');
const { format } = require('date-fns');
const path = require('path');

const app = express();
const upload = multer({ 
  dest: '/tmp/',
  limits: { fileSize: 200 * 1024 * 1024 } // limit file size to 200MB
});

let webdavClient;

// 响应式CSS样式
const style = `
<style>
  body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    font-size: 28px;
    margin: 0;
    font-family: Arial, sans-serif;
  }
  form, #url, button {
    margin: 10px;
    font-size: 30px;
  }
  input[type="file"], button {
    font-size: 30px;
    padding: 10px;
  }
  @media (max-width: 600px) {
    body {
      font-size: 30px; /* 增大普通文本的字体大小 */
    }
    input[type="file"], button {
      font-size: 28px; /* 增大按钮和文件输入的字体大小 */
      padding: 12px; /* 增大按钮的填充以便于触摸 */
    }
  }
</style>
`;
// Initialize webdav client
(async () => {
  const webdav = await import('webdav');
  webdavClient = webdav.createClient(
    'https://uno.teracloud.jp/dav/',
    {
      username: 'wrhsd',
      password: 'kjLxHLMb9CK7Gi9e'
    }
  );
})();

app.get('/api', (req, res) => {
  res.send(`
    ${style}
    <form action="/upload" method="post" enctype="multipart/form-data">
      <input type="file" name="file">
      <button type="submit">上传</button>
    </form>
    <p>最大上传文件200M</p>
  `);
});

app.post('/api/upload', upload.single('file'), async (req, res, next) => {
  const { file } = req;
  if (!file) {
    return next();
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
    res.send(`
      ${style}
      上传成功
      <input id="url" value="${publicUrl}" size="${publicUrl.length}" readonly>
      <button onclick="copyToClipboard()">复制到剪切板</button>
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <button type="submit">上传新文件</button>
      </form>
      <script>
        function copyToClipboard() {
          const url = document.getElementById('url');
          url.select();
          document.execCommand('copy');
        }
      </script>
    `);
    fs.unlink(file.path, err => {
      if (err) console.error(`Error deleting temporary file: ${err}`);
    });
  } catch (err) {
    console.log(err);
  }
}, (err, req, res, next) => { // error handler

  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    res.send(`
      ${style}
      文件大小超过最大限制200M
      <form action="/upload" method="post" enctype="multipart/form-data">
        <input type="file" name="file">
        <button type="submit">重新上传</button>
      </form>
    `);
  } else {
    next(err);
  }
});

app.get('/api/files/*', async (req, res) => {
  const filePath = req.params[0];
  try {
    const fileContents = await webdavClient.getFileContents(filePath);
    res.send(fileContents);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error retrieving file');
  }
});

module.exports = app;
