import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },

    enrolledAt: {
        type: Date,
        default: Date.now
    },

    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    completedLessons :[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson'
    }]
}, {
    timestamps: true
});

enrollmentSchema.index(
    { student: 1, course: 1 },
    { unique: true }
);

export default mongoose.model('Enrollment', enrollmentSchema);

