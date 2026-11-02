import test from 'node:test';
import assert from 'node:assert/strict';
import { caseRequestSchema,moderatePremise } from '../src/validators/caseSchema.js';

test('case requests enforce scenario size and default safe settings',()=>{
 assert.equal(caseRequestSchema.safeParse({scenario:'x'.repeat(29)}).success,false);
 const parsed=caseRequestSchema.parse({scenario:'x'.repeat(30)});assert.equal(parsed.difficulty,'medium');assert.equal(parsed.evidenceIntensity,'standard');
 assert.equal(caseRequestSchema.safeParse({scenario:'x'.repeat(1001)}).success,false);
});
test('basic premise safety filter rejects direct real-person targeting and graphic requests',()=>{
 assert.equal(moderatePremise('My neighbor stole the museum key and I want a mystery about him.'),true);
 assert.equal(moderatePremise('A fictional curator steals an artifact from a museum after closing.'),false);
});
