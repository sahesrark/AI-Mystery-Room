import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { resumePendingJobs } from './routes/api.js';

const port=process.env.PORT||5000;
const requireDatabase=process.env.NODE_ENV==='production'||process.env.REQUIRE_DATABASE==='true';
async function start(){
 if(requireDatabase&&!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required when REQUIRE_DATABASE is enabled or NODE_ENV is production.');
 if(process.env.MONGODB_URI){
  try{await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});console.log('MongoDB connected');await resumePendingJobs();}
  catch(err){if(requireDatabase)throw new Error(`MongoDB connection failed in production: ${err.message}`);console.warn('MongoDB unavailable; running in-memory mode:',err.message);}
 }
 const server=app.listen(port,'0.0.0.0',()=>console.log(`Mystery Room API listening on ${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await mongoose.disconnect();process.exit(0);}));
}
start().catch(err=>{console.error('API startup failed:',err.message);process.exitCode=1;});
