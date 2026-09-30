import Course from '../models/courseModel.js';

// GET /api/courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find().populate('teacher', 'username email');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener los cursos', error: error.message });
    }
};

// GET /api/courses/:id
const getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('teacher', 'username email');
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el curso', error: error.message });
    }
};

// POST /api/courses (requiere rol teacher)
const createCourse = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: 'El título y la descripción son obligatorios' });
        }

        const newCourse = await Course.create({
            title,
            description,
            teacher: req.usuario.id
        });

        res.status(201).json(newCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el curso', error: error.message });
    }
};

// PUT /api/courses/:id (requiere rol teacher y ser dueño del curso)
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        if (course.teacher.toString() !== req.usuario.id) {
            return res.status(403).json({ message: 'No tienes permiso para editar este curso' });
        }

        const { title, description } = req.body;
        if (title) course.title = title;
        if (description) course.description = description;

        await course.save();
        res.status(200).json(course);
    } catch (error) {
        res.status(400).json({ message: 'Error al actualizar el curso', error: error.message });
    }
};

// DELETE /api/courses/:id (requiere rol teacher y ser dueño del curso)
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Curso no encontrado' });
        }

        if (course.teacher.toString() !== req.usuario.id) {
            return res.status(403).json({ message: 'No tienes permiso para eliminar este curso' });
        }

        await course.deleteOne();
        res.status(200).json({ message: 'Curso eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el curso', error: error.message });
    }
};

export {
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
