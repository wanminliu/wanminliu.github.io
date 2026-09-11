/* App state-machine test with a minimal DOM/audio adapter; not browser UI QA. */
'use strict';
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
class Element{constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.style={};this.listeners={};this.value='';this.checked=false;this.hidden=false;this.classList={toggle(){},remove(){}}}append(...els){for(const e of els)this.children.push(...(e.tagName==='FRAGMENT'?e.children:[e]))}replaceChildren(...els){this.children=[];this.append(...els)}setAttribute(k,v){this[k]=v}addEventListener(k,fn){this.listeners[k]=fn}disconnect(){}}
const nodes=new Map(),get=id=>{if(!nodes.has(id))nodes.set(id,new Element());return nodes.get(id)};
get('duration').value='120';get('level').value='1';get('volume').value='45';get('accelerate').checked=true;get('formula-toggle').checked=true;get('speech').checked=true;get('jumps').checked=true;
const descendants=e=>e.children.flatMap(x=>[x,...descendants(x)]);
const listeners={};const document={documentElement:new Element('html'),getElementById:get,createElement:t=>new Element(t),createElementNS:(_,t)=>new Element(t),createDocumentFragment:()=>new Element('fragment'),querySelectorAll(q){if(q.startsWith('#function-options'))return descendants(get('function-options')).filter(e=>e.tagName==='INPUT'&&(!q.includes(':checked')||e.checked));return []},addEventListener(k,f){listeners[k]=f},body:new Element('body')};
let clock=0,raf,spoken=[],suspended=false;
class AudioContext{get currentTime(){return clock}async resume(){suspended=false}suspend(){suspended=true}createGain(){return {connect(){},disconnect(){},gain:{value:0,setTargetAtTime(){}}}}createBuffer(){return {copyToChannel(){}}}createBufferSource(){return {connect(){},start(){},stop(){}}}}
const speechSynthesis={getVoices:()=>[{localService:true,lang:'en-US',name:'Samantha'}],addEventListener(){},cancel(){},speak:u=>spoken.push(u.text)};
const c={document,window:{AudioContext,speechSynthesis,addEventListener(){}},speechSynthesis,SpeechSynthesisUtterance:class{constructor(t){this.text=t}},requestAnimationFrame:f=>{raf=f},console};vm.createContext(c);const root=path.resolve(__dirname,'..');vm.runInContext(fs.readFileSync(path.join(root,'graphs.js'),'utf8'),c);c.DanceSequence=require('../sequence.js');c.DanceMusic={render:()=>({data:new Float32Array(1),sampleRate:22050})};vm.runInContext(fs.readFileSync(path.join(root,'app.js'),'utf8'),c);
(async()=>{
 await vm.runInContext('start()',c);assert.equal(vm.runInContext('state',c),'running');assert.equal(spoken[0],'Let’s do the math dance together!');
 const at=t=>{clock=t+.08;raf()};at(3.4);at(5);at(6);at(7);assert.deepEqual(spoken.slice(1),['Are you ready?','Three','Two','One']);at(8);assert.equal(get('clock').textContent,'02:00');assert.equal(get('intro').hidden,true);
 at(20);vm.runInContext('pause()',c);assert(suspended);assert.equal(vm.runInContext('state',c),'paused');await vm.runInContext('resume()',c);assert(!suspended);
 at(118);assert.equal(get('countdown').textContent,10);assert.equal(vm.runInContext('current.id',c),'constant_1_0_2');at(120);assert.equal(vm.runInContext('current.id',c),'constant_1_0_0');at(122);assert.equal(vm.runInContext('current.id',c),'constant_1_0_-2');at(127);assert.equal(get('countdown').textContent,1);at(128);assert.equal(vm.runInContext('state',c),'finished');assert.equal(get('clock').textContent,'00:00');assert.equal(get('done').hidden,false);assert.equal(spoken.at(-1),'Well done!');
 vm.runInContext('reset()',c);assert.equal(vm.runInContext('state',c),'ready');assert.equal(get('clock').textContent,'02:00');assert.equal(get('done').hidden,true);
 console.log('PASS: opening speech, 3–2–1, start, pause/resume, closing graph/number alignment, zero, finish and reset.');
})().catch(e=>{console.error(e);process.exitCode=1});
