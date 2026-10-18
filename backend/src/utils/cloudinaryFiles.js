import { randomUUID } from 'node:crypto';
import path from 'node:path';
import cloudinary from '../config/cloudinary.js';

// multer entrega el nombre original en latin1; lo pasamos a UTF-8 para no romper tildes y ñ
const nombreOriginal = (file) => Buffer.from(file.originalname, 'latin1').toString('utf8');

// Sube un archivo de lección (PDF, DOC, PPT...) como recurso "raw" y devuelve lo que guarda el modelo.
const subirArchivoCloudinary = (file, carpeta = 'lms lessons') =>
    new Promise((resolve, reject) => {
        const name = nombreOriginal(file);
        const format = path.extname(name).slice(1).toLowerCase();
        const publicId = `${randomUUID()}${format ? `.${format}` : ''}`;

        const stream = cloudinary.uploader.upload_stream(
            { folder: carpeta, resource_type: 'raw', public_id: publicId },
            (error, result) => {
                if (error) return reject(error);
                resolve({
                    name,
                    url: result.secure_url,
                    publicId: result.public_id,
                    format,
                    size: result.bytes ?? file.size ?? 0
                });
            }
        );
        stream.end(file.buffer);
    });

// Borra recursos raw de Cloudinary sin lanzar error si alguno falla
const borrarArchivosCloudinary = (publicIds = []) =>
    Promise.allSettled(
        publicIds
            .filter(Boolean)
            .map((id) => cloudinary.uploader.destroy(id, { resource_type: 'raw' }))
    );

export { subirArchivoCloudinary, borrarArchivosCloudinary };
