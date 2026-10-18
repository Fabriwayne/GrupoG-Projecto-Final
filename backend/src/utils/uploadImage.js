import cloudinary from '../config/cloudinary.js';

const uploadImage = (fileBuffer, carpeta = 'lms courses' ) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: carpeta },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        stream.end(fileBuffer);
    });
export default uploadImage;

