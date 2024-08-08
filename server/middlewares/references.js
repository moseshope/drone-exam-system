const fs = require('fs');
const multer = require('multer');

const uploader = {
    storage: function () {
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                const dir = `public/upload`;
                if (!fs.existsSync(dir)) fs.mkdirSync(dir);
                cb(null, dir);
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + '_' + req.user._id + '_' + file.originalname.replace(/ /g, '_'));
            },
        });
        return storage;
    },
    fileFilter: function (req, file, cb) {
        if (!file.originalname.match(/\.(doc|txt|pdf|docx)$/i)) {
            return cb(new Error('Only document file type are allowed!', false));
        }
        cb(null, true);
    },
};

const upload = multer({
    storage: uploader.storage(),
    fileFilter: uploader.fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});

module.exports = upload.single('file');
