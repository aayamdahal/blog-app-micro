import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    image: {
        type: String,
        required: true,
    },
    instagram: String,
    facebook: String,
    linkedin: String,
    bio: String,
}, {
    timestamps: true,
});
const User = mongoose.model("User", schema);
export default User;
