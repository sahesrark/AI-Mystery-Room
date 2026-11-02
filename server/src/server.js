import 'dotenv/config';
import mongoose from 'mongoose';
import app from './app.js';
import { resumePendingJobs } from './routes/api.js';

const port=process.env.PORT||5000;
async function start(){
 if(process.env.MONGODB_URI){
  try{await mongoose.connect(process.env.MONGODB_URI,{serverSelectionTimeoutMS:10000});console.log('MongoDB connected');await resumePendingJobs();}
  catch(err){console.warn('MongoDB unavailable; running in-memory mode:',err.message);}
 }
 const server=app.listen(port,()=>console.log(`Mystery Room API listening on ${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await mongoose.disconnect();process.exit(0);}));
}
start();
