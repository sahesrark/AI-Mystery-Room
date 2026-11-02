import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCase } from '../src/services/caseFactory.js';
import { validateBlueprint,validateCase } from '../src/services/geminiService.js';

test('case validator accepts authored cases at all difficulty settings',()=>{for(const difficulty of ['easy','medium','hard'])for(const evidenceIntensity of ['standard','rich'])assert.doesNotThrow(()=>validateCase(makeCase({scenario:'A fictional artifact disappears from a quiet museum after closing.',difficulty,evidenceIntensity}),difficulty,evidenceIntensity));});
test('case validator rejects a timeline that falls outside the incident window',()=>{const c=makeCase({scenario:'A fictional artifact disappears from a quiet museum after closing.',difficulty:'easy'});c.timeline[0].time='21:30';assert.throws(()=>validateCase(c,'easy','standard'),/incident window/);});
test('blueprint validator requires fixed culprit, exact suspect count, and ordered timeline',()=>{const c=makeCase({scenario:'A fictional artifact disappears from a quiet museum after closing.',difficulty:'easy'}),bp={...c,timeline:c.timeline.map(({sourceEvidenceIds,...event})=>event),solution:{culpritSuspectId:c.solution.culpritSuspectId,decisiveClueConcepts:['key access','alibi contradiction','desk gap'],redHerringExplanations:c.solution.redHerringExplanations}};assert.doesNotThrow(()=>validateBlueprint(bp,'easy'));bp.timeline.reverse();assert.throws(()=>validateBlueprint(bp,'easy'),/out of order/);});
