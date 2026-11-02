import mongoose from 'mongoose';
const JobSchema=new mongoose.Schema({jobId:{type:String,unique:true,index:true},caseId:{type:String,index:true},ownerId:{type:String,index:true},status:{type:String,index:true},request:mongoose.Schema.Types.Mixed,errorCode:String,errorMessage:String,startedAt:Date,completedAt:Date},{timestamps:true});
JobSchema.index({status:1,createdAt:1});
export default mongoose.models.GenerationJob||mongoose.model('GenerationJob',JobSchema);
