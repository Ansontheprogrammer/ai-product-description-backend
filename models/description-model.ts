import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the Description schema
const descriptionSchema = new Schema({
  id: { type: Number, required: true },
  userId: { type: Number, required: true },
  description: { type: String, required: true },
  productId: { type: Number, required: true },
  createdAt: { type: String, required: true }
});


// Create an index on createdAt for faster sorting
descriptionSchema.index({ createdAt: -1 });

// Create the models
export const Description = mongoose.model('Description', descriptionSchema);