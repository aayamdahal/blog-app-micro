import mongoose from "mongoose";

const connectDB = async()=>{
    try {
        mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "blog"
        })
        console.log("connected to mongo")
    } catch (error) {
        console.log(error,"here error")
    }

} 

export default connectDB