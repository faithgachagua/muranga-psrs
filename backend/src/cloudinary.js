const { v2: cloudinary } = require('cloudinary');

cloudinary.config({ secure: true });

const isConfigured = () => Boolean(process.env.CLOUDINARY_URL);

function uploadImage(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: 'muranga-psrs', resource_type: 'image' }, (err, result) => (err ? reject(err) : resolve(result)))
      .end(buffer);
  });
}

const deleteImages = (publicIds) => Promise.allSettled(publicIds.map((id) => cloudinary.uploader.destroy(id)));

module.exports = { isConfigured, uploadImage, deleteImages };
