import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'The title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'The content is required'],
        trim: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    order: {
        type: Number,
        default: 0,
        min: 0
    },
    videoURL: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator: (v) => !v || /^https?:\/\/\S+$/i.test(v),
            message: 'The video link should start with  http:// o https://'
        }
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chapter',
        default: null
    },
    resources: [
        {
            name: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: true
            },
            format: {
                type: String,
                default: ''
            },
            size: {
                type: Number,
                default: 0
            }
        }
    ]
}, {
    timestamps: true
});

lessonSchema.index({ course: 1, order: 1 });

export default mongoose.model('Lesson', lessonSchema);