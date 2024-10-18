import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new Schema({
  id: { type: Number, required: true },
  storeId: { type: Number, required: true },
  createdAt: { type: String, required: true }
});


// Create the models
export const User = mongoose.model('User', userSchema);

