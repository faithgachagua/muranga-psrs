const multer = require('multer');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Photos are held in memory and passed straight on to Cloudinary
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) =>
    IMAGE_TYPES.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG or WEBP photos are allowed')),
});
