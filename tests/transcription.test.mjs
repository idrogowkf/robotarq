import test from 'node:test';import assert from 'node:assert/strict';import {validateAudioUpload} from '../lib/transcription.mjs';
test('voice upload accepts supported audio and rejects invalid or oversized files',()=>{assert.equal(validateAudioUpload({size:1024,type:'audio/webm'}),true);assert.throws(()=>validateAudioUpload({size:1024,type:'text/plain'}),/formato/i);assert.throws(()=>validateAudioUpload({size:9*1024*1024,type:'audio/webm'}),/8 MB/i);});

