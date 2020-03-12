//declare all imports
const express = require('express');
const fs = require('fs');
//allow upload files to server
const multer = require('multer');
//reads images
const { TesseractWorker } = require('tesseract.js');
//analize images
const worker = new TesseractWorker();
//initialize express
const app = express();

//initilaize storage
const storage = multer.diskStorage({
    //create callback for where uploads will be stored
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
//upload
const upload = multer({ storage: storage }).single('avatar');

//views
app.set('view engine', 'ejs');
app.use(express.static('public'));
//Routes
app.get('/', (req, res) => {
    res.render('index');
});

//route for upload
app.post('/upload', (req, res) => {
    upload(req, res, err => {
        fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
            if (err) return console.log(`This is you errors ${err}`);

            worker
                .recognize(data, 'eng', { tessjs_create_pdf: '1' })
                .progress(progress => {
                    console.log(progress);
                })
                .then(result => {
                    res.redirect('/download');
                })
                .finally(() => worker.terminate());
        });
    });
});

app.get('./download', (req, res) => {
    const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
    res.download(file);
});

//Start up server
const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Port is running on port ` + PORT));