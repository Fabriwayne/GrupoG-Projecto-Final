import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'The title is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'The description is required']
    },
    image: {
        type: String,
        default: ""
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'draft'
    }
}, {
    timestamps: true
});

export default mongoose.model('Course', courseSchema);
