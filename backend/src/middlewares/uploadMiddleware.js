import multer from "multer";

const MAX_MB = 10;

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_MB * 1024 * 1024,
        files: 5
    },
    fileFilter: (req, file, cb) => {
        const tiposPermitidos = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ];

        if (tiposPermitidos.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Tipo de archivo no permitido. Solo se permiten archivos PDF, DOC, DOCX, PPT y PPTX."));
        }
    }
});

export default upload;