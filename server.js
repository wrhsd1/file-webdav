const express = require('express');
const multer = require('multer');
const webdav = require('webdav');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();


const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(express.static(__dirname));


const davClient = webdav.createClient(
    process.env.WEBDAV_URL,
    {
        username: process.env.WEBDAV_USERNAME,
        password: process.env.WEBDAV_PASSWORD,
    }
);


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const localFilePath = req.file.path;


        // Generate a random 4-digit code
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        // Get the file extension
        const ext = path.extname(req.file.originalname);
        const newfilename = `${code}${ext}`;

        // Add the date string to the remote file path



        // Get the current date and format it as 'YYYY-MM-DD'
        const date = new Date();
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        // Add the date string to the remote file path
        const remoteFilePath = `/imgs/${dateString}/${code}${ext}`;

        const data = fs.readFileSync(localFilePath);

        // Check if the directory exists, if not, create it
        if (!await davClient.exists(`/imgs/${dateString}`)) {
            await davClient.createDirectory(`/imgs/${dateString}`);
        }

        await davClient.putFileContents(remoteFilePath, data);

        const newUrl = `https://wrhcn001.cachefly.net/webdav/proxy.php?path=${dateString}/${newfilename}`;
        res.json({ message: 'File uploaded successfully', url: newUrl });

        fs.unlinkSync(localFilePath);
    } catch (err) {
        console.error('Error handling upload:', err);
        res.status(500).json({ message: 'Error uploading file', error: err.toString() });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});