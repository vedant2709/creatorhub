import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    fileUrl: {
      type: String,
      required: true
    },
    thumbnail: {
      type: String
    },
     creatorId: {
      type: String,
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    tags: [String]
}, {timestamps: true});

const productModel = mongoose.model("Product", productSchema);

export default productModel;