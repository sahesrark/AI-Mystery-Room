const STOP_WORDS=new Set(['there','where','which','their','about','after','before','during','this','that','with','from','only','when','while','what','does','have','been','were','clue','evidence']);
export function calculateScore({correct,reviewedEvidenceIds=[],totalEvidence=0,reason='',decisiveEvidence=[]}){
 const reviewed=new Set(reviewedEvidenceIds).size;
 const coverageScore=totalEvidence?Math.min(20,Math.round(reviewed/totalEvidence*20)):0;
 const terms=new Set(decisiveEvidence.flatMap(e=>`${e.title} ${e.playerSummary}`.toLowerCase().split(/[^a-z0-9]+/)).filter(word=>word.length>4&&!STOP_WORDS.has(word)));
 const explanation=reason.toLowerCase();
 const reasoningScore=Math.min(20,[...terms].filter(word=>explanation.includes(word)).length*5);
 return {score:(correct?60:0)+coverageScore+reasoningScore,coverageScore,reasoningScore};
}
