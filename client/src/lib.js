const API=import.meta.env.VITE_API_BASE_URL||'http://localhost:5000/api/v1';
export async function request(path,options={}){const r=await fetch(`${API}${path}`,{credentials:'include',headers:{'Content-Type':'application/json',...options.headers},...options});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||'Request failed');return data;}
export const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
