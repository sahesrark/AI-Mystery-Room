import mongoose from 'mongoose';
const ProgressSchema=new mongoose.Schema({userId:String,caseId:String,status:{type:String,default:'investigating'},reviewedEvidenceIds:[String],bookmarkedEvidenceIds:[String],notes:{type:String,default:''},accusation:mongoose.Schema.Types.Mixed,score:Number},{timestamps:true});
ProgressSchema.index({userId:1,caseId:1},{unique:true});
export default mongoose.models.PlayerProgress||mongoose.model('PlayerProgress',ProgressSchema);
