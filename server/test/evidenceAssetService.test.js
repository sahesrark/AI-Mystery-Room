import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEvidenceFallbacks } from '../src/services/evidenceAssetService.js';
test('visual evidence without generated files becomes a labelled text artefact',()=>{const c=applyEvidenceFallbacks({evidence:[{id:'p',type:'photo',description:'A cracked display case',asset:{kind:'image',url:'https://unowned.invalid/image.png'}},{id:'d',type:'document',asset:{kind:'text',url:null}}]});assert.equal(c.evidence[0].asset.kind,'text');assert.equal(c.evidence[0].asset.url,null);assert.match(c.evidence[0].assetNote,/no image generated/);assert.equal(c.evidence[1].asset.url,null);});
