import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    container: {
        type: String,
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    orden: {
        type: Number,
        default: 0
    }
});

export default mongoose.model('Lesson', lessonSchema);
