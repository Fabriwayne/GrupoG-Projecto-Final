import multer from "multer";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

const uploadImage = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_MB * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        if (TIPOS_PERMITIDOS.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new
                Error('Tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG o WEBP.'), false
            );
        }
    }
});

export default uploadImage;