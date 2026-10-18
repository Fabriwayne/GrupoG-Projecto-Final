import mongoose from 'mongoose';
import Lesson from '../models/lessonModel.js';
import Course from '../models/courseModel.js';
import Chapter from '../models/chapterModel.js';
import Enrollment from '../models/enrollmentModel.js';
import { subirArchivoCloudinary, borrarArchivosCloudinary } from '../utils/cloudinaryFiles.js';

// OBTENER LECCIONES DE UN CURSO
const getLessonsByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { id: userId, role } = req.user;

        if (!mongoose.isValidObjectId(courseId)) {
            return res.status(400).json({ message: 'ID de curso inválido' });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: 'Curso no encontrado'
            });
        }

        // Comprobar si el usuario es el profesor propietario
        const isOwner =
            role === 'teacher' &&
            course.teacher.toString() === userId;

        // Comprobar si el estudiante está inscrito
        if (role === 'student') {
            const enrollment = await Enrollment.findOne({
                student: userId,
                course: courseId
            });

            if (!enrollment) {
                return res.status(403).json({
                    message: 'No estás inscrito en este curso'
                });
            }
        } else if (!isOwner) {
            return res.status(403).json({
                message: 'No tienes permiso para acceder a estas lecciones'
            });
        }

        const lessons = await Lesson.find({
            course: courseId
        })
            .populate('chapter', 'title order')
            .sort({ order: 1 });

        res.status(200).json(lessons);

    } catch (error) {
        res.status(500).json({
            message: 'Error al obtener las lecciones',
            error: error.message
        });
    }
};

//CREAR LECCIÓN 
const createLesson = async (req, res) => {
    const archivosSubidos = [];
    try {
        const { title, content, videoURL, course: courseId, chapter: chapterId } = req.body;

        if (!title || !content || !courseId) {
            return res.status(400).json({
                message: "El título, contenido y curso son obligatorios"
            });
        }

        if (!mongoose.isValidObjectId(courseId) || (chapterId && !mongoose.isValidObjectId(chapterId))) {
            return res.status(400).json({ message: "El curso o el capítulo no son válidos" });
        }

        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({
                message: "Curso no encontrado"
            });
        }

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                message: "No tienes permiso para agregar lecciones a este curso"
            });
        }

        let chapter = null;

        if (chapterId) {
            chapter = await Chapter.findOne({
                _id: chapterId,
                course: courseId
            });

            if (!chapter) {
                return res.status(400).json({
                    message: "El capítulo no pertenece a este curso"
                });
            }
        }

        const filtroOrden = chapter
            ? { course: courseId, chapter: chapter._id }
            : { course: courseId, chapter: null };

        const ultimaLeccion = await Lesson.findOne(filtroOrden)
            .sort({ order: -1 });

        const siguienteOrden = ultimaLeccion
            ? ultimaLeccion.order + 1
            : 1;

        const resources = [];

        for (const file of req.files ?? []) {
            const result = await subirArchivoCloudinary(file);

            archivosSubidos.push(result.publicId);
            resources.push(result);
        }

        const newLesson = await Lesson.create({
            title,
            content,
            videoURL,
            course: course._id,
            chapter: chapter?._id ?? null,
            order: siguienteOrden,
            resources
        });

        return res.status(201).json(newLesson);

    } catch (error) {
        // Si falla la operación, intentamos eliminar los archivos
        // subidos para no dejarlos huérfanos en Cloudinary.
        await borrarArchivosCloudinary(archivosSubidos);

        const status = error.name === 'ValidationError' ? 400 : 500;

        return res.status(status).json({
            message: "Error al crear la lección",
            error: error.message
        });
    }
};

// ACTUALIZAR LECCIÓN 
const updateLesson = async (req, res) => {
    const archivosSubidos = [];
    let guardado = false;

    try {
        const { title, content, videoURL } = req.body;
        const lesson = await Lesson.findById(req.params.id);

        if (!lesson) { return res.status(404).json({ message: 'Lección no encontrada' }); }

        const course = await Course.findById(lesson.course);

        if (!course) { return res.status(404).json({ message: 'Curso no encontrado' }); }

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({
                message: 'No tienes permiso para modificar esta lección'
            });
        }

        // Actualizar los campos de texto
        if (title !== undefined) {
            lesson.title = title;
        }

        if (content !== undefined) {
            lesson.content = content;
        }

        if (videoURL !== undefined) {
            lesson.videoURL = videoURL;
        }

        // Guardar una referencia a los archivos anteriores
        const recursosAnteriores = [...(lesson.resources ?? [])];

        // Solo reemplazar archivos si se seleccionaron archivos nuevos
        if (req.files?.length > 0) {
            const nuevosRecursos = [];

            for (const file of req.files) {
                const resultado = await subirArchivoCloudinary(file);

                archivosSubidos.push(resultado.publicId);
                nuevosRecursos.push(resultado);
            }

            lesson.resources = nuevosRecursos;
        }

        // Guardar los cambios en MongoDB
        await lesson.save();
        guardado = true;

        // Eliminar los archivos anteriores solo después de guardar
        if (req.files?.length > 0 && recursosAnteriores.length > 0) {
            await borrarArchivosCloudinary(
                recursosAnteriores.map(archivo => archivo.publicId)
            );
        }

        return res.status(200).json(lesson);

    } catch (error) {
        // Si la actualización falla, limpiar las nuevas subidas
        // sin eliminar los archivos anteriores.
        if (!guardado && archivosSubidos.length > 0) {
            await borrarArchivosCloudinary(archivosSubidos);
        }

        return res.status(400).json({
            message: "Error al actualizar la lección",
            error: error.message
        });
    }
};

// ELIMINAR LECCIÓN 
const deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) { return res.status(404).json({ message: 'Lección no encontrada' }); }
        const course = await Course.findById(lesson.course);
        if (!course) { return res.status(404).json({ message: 'Curso no encontrado' }); }

        if (course.teacher.toString() !== req.user.id) { return res.status(403).json({ message: 'No tienes permiso para eliminar esta lección' }); }
        await Lesson.findByIdAndDelete(req.params.id);

        // Limpiar los archivos en Cloudinary y las referencias de progreso de los estudiantes
        await borrarArchivosCloudinary(lesson.resources.map((r) => r.publicId));
        await Enrollment.updateMany(
            { course: lesson.course },
            { $pull: { completedLessons: lesson._id } }
        );

        res.status(200).json({ message: 'Lección eliminada correctamente' });
    } catch (error) {
        res.status(400).json({ message: 'Error al eliminar la lección', error: error.message });
    }
};

const getResourceLesson = async (req, res) => {
    try {
        const { id, resourceIndex } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "ID de lección inválido" });
        }

        const lesson = await Lesson.findById(id);

        if (!lesson) {
            return res.status(404).json({
                message: "Lección no encontrada"
            });
        }

        const course = await Course.findById(lesson.course);

        if (!course) {
            return res.status(404).json({
                message: "Curso no encontrado"
            });
        }

        const { id: userId, role } = req.user;

        const esProfesorPropietario =
            role === "teacher" &&
            course.teacher.toString() === userId;

        if (role === "student") {
            const enrollment = await Enrollment.findOne({
                student: userId,
                course: course._id
            });

            if (!enrollment) {
                return res.status(403).json({
                    message: "No estás inscrito en este curso"
                });
            }
        } else if (!esProfesorPropietario) {
            return res.status(403).json({
                message: "No tienes permiso para ver este archivo"
            });
        }

        const index = Number(resourceIndex);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= lesson.resources.length
        ) {
            return res.status(404).json({
                message: "Archivo no encontrado"
            });
        }

        const archivo = lesson.resources[index];

        const formato = (archivo.format || "").toLowerCase();
        const esPdf = formato === "pdf";

        // Solicitar el PDF a Cloudinary
        const respuesta = await fetch(archivo.url);

        if (!respuesta.ok) {
            console.error(
                "Error de Cloudinary:",
                respuesta.status,
                respuesta.statusText
            );

            return res.status(502).json({
                message: "No se pudo obtener el archivo almacenado"
            });
        }

        if (!respuesta.body) {
            return res.status(502).json({
                message: "Cloudinary no devolvió el contenido del archivo"
            });
        }

        // Preparar la respuesta para mostrar el PDF
        const nombreSeguro = archivo.name
            .replace(/[\r\n"]/g, "_");

        const tiposMime = {
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ppt: "application/vnd.ms-powerpoint",
            pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        };

        // El PDF se muestra en el navegador; los demás formatos se descargan
        res.setHeader("Content-Type", tiposMime[formato] ?? "application/octet-stream");
        res.setHeader(
            "Content-Disposition",
            `${esPdf ? "inline" : "attachment"}; filename="${encodeURIComponent(nombreSeguro)}"`
        );
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("Cache-Control", "private, no-store");

        // Transmitir el contenido sin almacenarlo completo en memoria
        const { Readable } = await import("node:stream");
        const { pipeline } = await import("node:stream/promises");

        await pipeline(
            Readable.fromWeb(respuesta.body),
            res
        );

    } catch (error) {
        console.error("Error al mostrar el recurso:", error);

        if (!res.headersSent) {
            return res.status(500).json({
                message: "Error al mostrar el archivo"
            });
        }

        res.destroy(error);
    }
};
export {
    getLessonsByCourse,
    getResourceLesson,
    createLesson,
    updateLesson,
    deleteLesson
};
