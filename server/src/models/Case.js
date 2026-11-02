import mongoose from 'mongoose';
const CaseSchema=new mongoose.Schema({caseId:{type:String,unique:true,index:true},ownerId:{type:String,index:true},schemaVersion:String,title:String,premise:String,genre:String,difficulty:String,status:{type:String,index:true},setting:mongoose.Schema.Types.Mixed,incident:mongoose.Schema.Types.Mixed,suspects:[mongoose.Schema.Types.Mixed],timeline:[mongoose.Schema.Types.Mixed],evidence:[mongoose.Schema.Types.Mixed],solution:mongoose.Schema.Types.Mixed,generation:mongoose.Schema.Types.Mixed,accused:Boolean,result:mongoose.Schema.Types.Mixed},{timestamps:true});
CaseSchema.index({ownerId:1,createdAt:-1});
CaseSchema.index({status:1,createdAt:-1});
export default mongoose.models.Case||mongoose.model('Case',CaseSchema);
