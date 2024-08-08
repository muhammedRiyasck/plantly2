//  Path :-
const fs = require('fs');
const path = require('path')
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../public/productImages');

        // Check if directory exists, if not create it
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        cb(null, true); // You can add more advanced file filtering here
    },
});

module.exports={
    upload
}
