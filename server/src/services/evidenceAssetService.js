const VISUAL_TYPES=new Set(['photo','cctv']);
/** The MVP has no configured image provider; convert visual requests to honest, inspectable text artefacts. */
export function applyEvidenceFallbacks(caseData){
 return {...caseData,evidence:caseData.evidence.map(e=>{
  if(!VISUAL_TYPES.has(e.type))return e;
  const description=e.content?.text||e.description||e.playerSummary;
  return {...e,asset:{kind:'text',url:null,mimeType:null,altText:description},content:{...e.content,text:e.content?.text||description},assetNote:e.type==='cctv'?'Fictional CCTV-style observation; no footage generated.':'Text-based photo evidence; no image generated.'};
 })};
}
