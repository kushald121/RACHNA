import multer from "multer";
import path from "path";

// Accept images and videos
const fileFilter = (req, file, cb) => {
    const allowedImageTypes = /jpeg|jpg|png|webp/;
    const allowedVideoTypes = /mp4|mov|avi|webm/;

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (
        allowedImageTypes.test(fileExtension) ||
        allowedVideoTypes.test(fileExtension)
    ) {
        cb(null, true);
    } else {
        cb(new Error("Only Images (jpeg, jpg, png, webp) and Videos (mp4, mov, avi, webm) are allowed"));
    }
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/uploads");
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, fileExtension).replace(/\s+/g, '-').toLowerCase();
        cb(null, `${baseName}-${Date.now()}${fileExtension}`);
    }
});

// 80MB max for video uploads
export const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 80 * 1024 * 1024 } // 80 MB limit
});
