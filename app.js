// 创建一个名为app.js的文件，并添加以下代码
const express = require('express');
const multer = require('multer');
const webdav = require('webdav');

const app = express();
const upload = multer({ dest: 'uploads/' });

const client = webdav.createClient(
    'https://uno.teracloud.jp/dav/',
    {
        username: 'wrhsd',
        password: 'kjLxHLMb9CK7Gi9e'
    }
);

app.get('/', (req, res) => {
    res.send(`
        <form action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="file">
            <button type="submit">Upload</button>
        </form>
    `);
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { path } = req.file;
        await client.putFileContents('imgs', fs.readFileSync(path));
        res.send('File uploaded successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred');
    }
});

app.listen(3000, () => console.log('Server started on port 3000'));
