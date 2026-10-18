import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (options) =>
        options.length >= 2 &&
        options.every((option) => option.trim().length > 0),
      message: "Cada pregunta necesita al menos dos opciones.",
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
  },
  points: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) => questions.length > 0,
        message: "El quiz debe tener al menos una pregunta.",
      },
    },
    maxAttempts: {
      type: Number,
      required: true,
      min: 1,
      default: 3,
      validate: {
        validator: Number.isInteger,
        message: "Los intentos deben ser un número entero.",
      },
    },
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
