const API=import.meta.env.VITE_API_BASE_URL||'http://localhost:5000/api/v1';
export async function request(path,options={}){
 let response;
 try{response=await fetch(`${API}${path}`,{credentials:'include',headers:{'Content-Type':'application/json',...options.headers},...options});}
 catch{throw new Error(`Could not reach the API at ${API}. Check the deployed API URL and CORS settings.`);}
 const body=await response.text();
 let data=null;
 if(body){try{data=JSON.parse(body);}catch{data={error:{message:body}};}}
 if(!response.ok)throw new Error(data?.error?.message||data?.message||`Request failed (${response.status}).`);
 return data;
}
export const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
