import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateScore } from '../src/services/scoringService.js';
const clues=[{title:'Gallery access ledger',playerSummary:'Mira had the staff key.'},{title:'Welcome desk sign-in sheet',playerSummary:'No coverage is recorded during the critical window.'}];
test('scoring caps its three deterministic components at 100',()=>{const result=calculateScore({correct:true,reviewedEvidenceIds:['e1','e2','e3','e4'],totalEvidence:4,reason:'Gallery access ledger, welcome desk sign in sheet and coverage.',decisiveEvidence:clues});assert.deepEqual(result,{score:100,coverageScore:20,reasoningScore:20});});
test('wrong accusations do not receive the culprit points',()=>{const result=calculateScore({correct:false,reviewedEvidenceIds:[],totalEvidence:8,reason:'',decisiveEvidence:clues});assert.equal(result.score,0);assert.equal(result.coverageScore,0);});
