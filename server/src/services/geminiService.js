import { GoogleGenAI } from '@google/genai';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

const settingSchema=z.object({locationName:z.string(),date:z.string(),timezone:z.string(),incidentWindow:z.object({start:z.string(),end:z.string()})});
const suspectSchema=z.object({id:z.string(),name:z.string(),role:z.string(),profile:z.string(),publicMotive:z.string(),statement:z.string(),alibi:z.string(),knownFacts:z.array(z.string()).default([])});
const blueprintSchema=z.object({schemaVersion:z.string(),title:z.string(),genre:z.string(),difficulty:z.enum(['easy','medium','hard']),setting:settingSchema,incident:z.object({type:z.string(),summary:z.string(),objective:z.string()}),suspects:z.array(suspectSchema).min(3).max(5),timeline:z.array(z.object({id:z.string(),time:z.string(),description:z.string(),locationId:z.string(),relatedSuspectIds:z.array(z.string()).default([]),confidence:z.enum(['confirmed','claimed','uncertain'])})).min(4),solution:z.object({culpritSuspectId:z.string(),motive:z.string(),method:z.string(),summary:z.string(),decisiveClueConcepts:z.array(z.string()).min(3),redHerringExplanations:z.array(z.string()).min(2),reveal:z.string()})});
const evidenceSchema=z.object({id:z.string(),type:z.enum(['chat','photo','cctv','document','witness_statement','access_log','audio_transcript']),title:z.string(),description:z.string(),createdAt:z.string(),eventTime:z.string(),locationId:z.string(),source:z.string(),reliability:z.enum(['high','medium','low']),asset:z.object({kind:z.string(),url:z.string().nullable().default(null),mimeType:z.string().nullable().default(null),altText:z.string()}),content:z.record(z.unknown()),relatedSuspectIds:z.array(z.string()).default([]),relatedEventIds:z.array(z.string()).default([]),tags:z.array(z.string()).default([]),playerSummary:z.string(),internalPurpose:z.string()});
const evidenceResponseSchema=z.object({evidence:z.array(evidenceSchema)});
const MODEL=()=>process.env.GEMINI_MODEL||'gemini-3.8-flash';
async function withTimeout(promise,milliseconds){let timer;try{return await Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Gemini request timed out.')),milliseconds);})]);}finally{clearTimeout(timer);}}
async function generateStage(ai,stage,prompt,config){const requestId=randomUUID(),started=Date.now();try{const response=await withTimeout(ai.models.generateContent({model:MODEL(),contents:prompt,config}),30000),usage=response.usageMetadata||{};console.info(JSON.stringify({event:'gemini_request_succeeded',requestId,stage,model:MODEL(),latencyMs:Date.now()-started,inputTokens:usage.promptTokenCount,outputTokens:usage.candidatesTokenCount}));return response;}catch(err){console.error(JSON.stringify({event:'gemini_request_failed',requestId,stage,model:MODEL(),latencyMs:Date.now()-started,errorName:err.name,status:err.status}));throw err;}}
function toMinutes(value){const m=/^(\d{2}):(\d{2})$/.exec(value);if(!m)throw new Error('Case times must use 24-hour HH:mm format.');return Number(m[1])*60+Number(m[2]);}
export function validateBlueprint(bp,difficulty){
 const suspectCount=difficulty==='easy'?3:difficulty==='hard'?5:4;
 if(bp.difficulty!==difficulty||bp.suspects.length!==suspectCount)throw new Error('Blueprint difficulty or suspect count is invalid.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(bp.setting.date)||!(Date.parse(`${bp.setting.date}T00:00:00Z`)))throw new Error('Blueprint date is invalid.');
 try{new Intl.DateTimeFormat('en',{timeZone:bp.setting.timezone});}catch{throw new Error('Blueprint timezone must be a valid IANA timezone.');}
 const sids=new Set(bp.suspects.map(s=>s.id)),tids=new Set(bp.timeline.map(t=>t.id));
 if(sids.size!==bp.suspects.length||tids.size!==bp.timeline.length||!sids.has(bp.solution.culpritSuspectId))throw new Error('Blueprint contains duplicate or missing references.');
 const start=toMinutes(bp.setting.incidentWindow.start),end=toMinutes(bp.setting.incidentWindow.end);if(end<=start)throw new Error('Incident window must have a positive duration within one day.');let previous=-1;
 for(const event of bp.timeline){const time=toMinutes(event.time);if(time<start||time>end||time<previous)throw new Error('Blueprint timeline is out of order or outside the incident window.');previous=time;if((event.relatedSuspectIds||[]).some(id=>!sids.has(id)))throw new Error('Blueprint timeline references an unknown suspect.');}
}
export function validateCase(parsed,difficulty,evidenceIntensity='standard'){
 const expectedSuspects=difficulty==='easy'?3:difficulty==='hard'?5:4,evidenceCount=difficulty==='easy'?(evidenceIntensity==='rich'?9:8):difficulty==='medium'?(evidenceIntensity==='rich'?10:9):(evidenceIntensity==='rich'?12:10);
 if(parsed.difficulty!==difficulty||parsed.suspects.length!==expectedSuspects||parsed.evidence.length!==evidenceCount)throw new Error('Generated case counts do not match difficulty and evidence intensity.');
 const sids=new Set(parsed.suspects.map(s=>s.id)),eids=new Set(parsed.evidence.map(e=>e.id)),tids=new Set(parsed.timeline.map(e=>e.id));
 if(sids.size!==parsed.suspects.length||eids.size!==parsed.evidence.length||tids.size!==parsed.timeline.length)throw new Error('Generated case contains duplicate IDs.');
 if(!sids.has(parsed.solution.culpritSuspectId)||parsed.solution.decisiveEvidenceIds.length<3||parsed.solution.decisiveEvidenceIds.some(id=>!eids.has(id)))throw new Error('Solution references unknown case data or lacks decisive clues.');
 if(parsed.solution.redHerringExplanations.length<2)throw new Error('Generated case does not explain enough red herrings.');
 if(parsed.timeline.some(e=>(e.relatedSuspectIds||[]).some(id=>!sids.has(id))||(e.sourceEvidenceIds||[]).some(id=>!eids.has(id))))throw new Error('Timeline references unknown suspects or evidence.');
 if(parsed.evidence.some(e=>(e.relatedSuspectIds||[]).some(id=>!sids.has(id))))throw new Error('Evidence references an unknown suspect.');
 const start=toMinutes(parsed.setting.incidentWindow.start),end=toMinutes(parsed.setting.incidentWindow.end);if(end<=start)throw new Error('Incident window must have a positive duration within one day.');let previous=-1;
 for(const event of parsed.timeline){const time=toMinutes(event.time);if(time<start||time>end||time<previous)throw new Error('Timeline order or incident window is invalid.');previous=time;}
 if(parsed.evidence.some(e=>{const time=toMinutes(e.eventTime),stamp=/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2}):\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.exec(e.createdAt);return time<start||time>end||Number.isNaN(Date.parse(e.createdAt))||!e.createdAt.startsWith(parsed.setting.date)||!stamp||Number(stamp[1])*60+Number(stamp[2])!==time;}))throw new Error('Evidence time or timestamp is outside the case window.');
}
function ensureTimelineCoverage(blueprint,evidence){return blueprint.timeline.map(event=>{const sourceEvidenceIds=evidence.filter(e=>e.relatedEventIds.includes(event.id)).map(e=>e.id);if(!sourceEvidenceIds.length)throw new Error(`Timeline event ${event.id} has no player-visible evidence.`);return {...event,sourceEvidenceIds};});}
function selectDecisiveEvidence(concepts,evidence){const ids=concepts.map(concept=>{const normalized=concept.trim().toLowerCase();return evidence.find(e=>e.internalPurpose.toLowerCase().includes(normalized)||`${e.title} ${e.playerSummary}`.toLowerCase().includes(normalized))?.id;}).filter(Boolean);const unique=[...new Set(ids)];if(unique.length<3)throw new Error('The evidence set does not support three decisive clue concepts.');return unique;}

export async function generateWithGemini({scenario,genre,difficulty,evidenceIntensity='standard',titlePreference},onProgress=()=>{}){
 if(!process.env.GEMINI_API_KEY)return null;
 const [blueprintTemplate,evidenceTemplate]=await Promise.all([readFile(new URL('../prompts/case-v1.md',import.meta.url),'utf8'),readFile(new URL('../prompts/evidence-v1.md',import.meta.url),'utf8')]);
 const count=difficulty==='easy'?(evidenceIntensity==='rich'?9:8):difficulty==='medium'?(evidenceIntensity==='rich'?10:9):(evidenceIntensity==='rich'?12:10),safeScenario=scenario.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const blueprintPrompt=blueprintTemplate.replace('{{scenario}}',safeScenario).replace('{{difficulty}}',difficulty).replace('{{genre}}',genre||'choose a fitting genre').replace('{{title}}',titlePreference||'choose an evocative title');
 const ai=new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY}),generationConfig={responseMimeType:'application/json',maxOutputTokens:8192};
 let blueprint,rawBlueprint='',lastError;
 for(let attempt=0;attempt<2;attempt++){try{const prompt=attempt?`${blueprintPrompt}\nRepair this blueprint JSON. Validation issue: ${lastError.message}\nPrevious output:\n${rawBlueprint}`:blueprintPrompt;const response=await generateStage(ai,'blueprint',prompt,{...generationConfig,temperature:attempt?0.2:0.7});rawBlueprint=response.text;blueprint=blueprintSchema.parse(JSON.parse(rawBlueprint));validateBlueprint(blueprint,difficulty);break;}catch(err){lastError=err;if(attempt===1)throw err;}}
 await onProgress('generating_evidence');
 const evidencePrompt=evidenceTemplate.replace('{{blueprint}}',JSON.stringify(blueprint)).replace('{{count}}',String(count));
 let rawEvidence='',evidenceError,complete;
 for(let attempt=0;attempt<2;attempt++){try{
  const prompt=attempt?`${evidencePrompt}\nRepair this evidence JSON without changing the accepted blueprint. Validation issue: ${evidenceError.message}\nPrevious output:\n${rawEvidence}`:evidencePrompt;
  const response=await generateStage(ai,'evidence',prompt,{...generationConfig,temperature:attempt?0.2:0.5});rawEvidence=response.text;
  const evidence=evidenceResponseSchema.parse(JSON.parse(rawEvidence)).evidence;if(evidence.length!==count)throw new Error('Evidence count does not match the request.');
  const suspectIds=new Set(blueprint.suspects.map(s=>s.id)),timelineIds=new Set(blueprint.timeline.map(t=>t.id));
  if(new Set(evidence.map(e=>e.id)).size!==evidence.length)throw new Error('Evidence IDs are not unique.');
  if(evidence.some(e=>e.relatedSuspectIds.some(id=>!suspectIds.has(id))||e.relatedEventIds.some(id=>!timelineIds.has(id))))throw new Error('Evidence references unknown case data.');
  const decisiveEvidenceIds=selectDecisiveEvidence(blueprint.solution.decisiveClueConcepts,evidence),timeline=ensureTimelineCoverage(blueprint,evidence);
  const solution={culpritSuspectId:blueprint.solution.culpritSuspectId,motive:blueprint.solution.motive,method:blueprint.solution.method,summary:blueprint.solution.summary,decisiveEvidenceIds,redHerringExplanations:blueprint.solution.redHerringExplanations,reveal:blueprint.solution.reveal};
  complete={...blueprint,premise:scenario,title:titlePreference||blueprint.title,timeline,evidence:evidence.map(({relatedEventIds,...item})=>item),solution,status:'ready'};
  validateCase(complete,difficulty,evidenceIntensity);break;
 }catch(err){evidenceError=err;if(attempt===1)throw err;}}
 await onProgress('checking_consistency');
 return {...complete,generation:{provider:'gemini',model:MODEL(),promptVersion:'case-v1+evidence-v1',generatedAt:new Date().toISOString(),validationStatus:'passed'}};
}
