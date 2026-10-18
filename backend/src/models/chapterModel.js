import mongoose from 'mongoose'

const chapterSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'The title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ""

    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true, 
    },
    order: {
        type: Number,
        required: true,
        min: 1
    }
},{
    timestamps: true
});

export default mongoose.model('Chapter', chapterSchema)