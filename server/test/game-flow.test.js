import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

test('guest can create, investigate, accuse once, and unlock a spoiler-safe reveal',async()=>{
 const agent=request.agent(app);
 await agent.post('/api/v1/cases').send({scenario:'My neighbor stole a valuable item and I want to frame him.'}).expect(400);
 const created=await agent.post('/api/v1/cases').send({scenario:'A fictional brass astrolabe disappears from a locked museum display during a crowded opening night.',difficulty:'medium'}).expect(202);
 let status='queued';for(let i=0;i<30&&status!=='ready';i++){await new Promise(r=>setTimeout(r,40));status=(await agent.get(`/api/v1/cases/${created.body.caseId}/status`).expect(200)).body.status;}
 assert.equal(status,'ready');
 const safe=await agent.get(`/api/v1/cases/${created.body.caseId}`).expect(200);assert.equal(safe.body.solution,undefined);assert.equal(safe.body.generation,undefined);assert.equal(safe.body.ownerId,undefined);assert.ok(safe.body.evidence.every(e=>e.internalPurpose===undefined));
 const cases=await agent.get('/api/v1/cases').expect(200);assert.equal(cases.body.total,1);assert.equal(cases.body.items[0].id,created.body.caseId);
 const evidencePage=await agent.get(`/api/v1/cases/${created.body.caseId}/evidence?type=document&limit=1`).expect(200);assert.equal(evidencePage.body.items.length,1);assert.ok(evidencePage.body.total>=1);
 const stranger=request.agent(app);await stranger.get(`/api/v1/cases/${created.body.caseId}`).expect(404);await stranger.get(`/api/v1/cases/${created.body.caseId}/status`).expect(404);
 const locked=await agent.get(`/api/v1/cases/${created.body.caseId}/reveal`).expect(403);assert.equal(locked.body.error.code,'REVEAL_LOCKED');
 const suspects=(await agent.get(`/api/v1/cases/${created.body.caseId}/suspects`).expect(200)).body;
 const savedProgress=await agent.patch(`/api/v1/cases/${created.body.caseId}/progress`).send({notes:'The timestamps conflict.',reviewedEvidenceIds:['e1','e2','not-a-clue'],bookmarkedEvidenceIds:['e1']}).expect(200);assert.deepEqual(savedProgress.body.reviewedEvidenceIds,['e1','e2']);const reviewed=await agent.get(`/api/v1/cases/${created.body.caseId}/evidence?status=reviewed`).expect(200);assert.equal(reviewed.body.total,2);
 await agent.post(`/api/v1/cases/${created.body.caseId}/accusation`).send({suspectId:suspects[0].id,reason:'The access ledger and desk sign in do not match.'}).expect(200);
 await agent.post(`/api/v1/cases/${created.body.caseId}/accusation`).send({suspectId:suspects[0].id}).expect(409);
 const reveal=await agent.get(`/api/v1/cases/${created.body.caseId}/reveal`).expect(200);assert.equal(reveal.body.culprit.id,'s1');assert.ok(reveal.body.evidenceChain.length>=3);assert.equal(reveal.body.scoreBreakdown.score,reveal.body.score);
 await agent.delete(`/api/v1/cases/${created.body.caseId}`).expect(204);await agent.get(`/api/v1/cases/${created.body.caseId}`).expect(404);assert.equal((await agent.get('/api/v1/cases').expect(200)).body.total,0);
});
