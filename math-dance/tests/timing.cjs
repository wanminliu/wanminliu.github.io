'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const c={window:{}};for(const f of ['graphs.js','scenes.js'])vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..',f),'utf8'),c);
const seq=require('../sequence.js'),Timing=require('../timing.js'),music=require('../music.js'),planner=seq.createPlanner(c.window.MATH_GRAPHS,c.window.MATH_SCENES);
const near=(a,b)=>assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);
let seed=82;const rng=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);let runs=0;
for(const speed of ['slow','medium','fast'])for(const displayMode of ['together','predict'])for(const duration of [120,180])for(const footwork of [false,true])for(const kinds of Object.values(seq.presets))for(let run=0;run<10;run++){
 const t=Timing.schedule(duration,speed),frames=planner.plan({speed,displayMode,duration,footwork,kinds,derivatives:true,relations:true},rng);runs++;
 assert.equal(frames[0].start,0);assert.equal(frames.at(-1).end,duration);
 let questions=0;
 for(let i=0;i<frames.length;i++){
  const f=frames[i];assert(f.end>f.start);if(i)near(frames[i-1].end,f.start);
  if(f.transition){near(f.start,t.bodyEnd);near(f.end,t.closingStart);assert.equal(f.beats,0);assert.equal(f.graph,frames[i-1].graph);continue}
  if(f.start>=duration-10){assert.equal(f.bpm,120);assert.equal(f.revealAt,f.start);continue}
  questions++;near(f.end-f.start,8*60/t.bpm);assert.equal(f.beats,8);near(f.start,Math.round(f.start/t.round)*t.round);
  near(f.revealAt-f.start,displayMode==='predict'?4*60/t.bpm:0);
  if(f.scene&&(i===0||frames[i-1].scene!==f.scene)){
   const count=f.scene.startsWith('footwork_')?3:c.window.MATH_SCENES.find(s=>s.id===f.scene).cards.length;
   for(let j=0;j<count;j++){assert.equal(frames[i+j].scene,f.scene);assert(frames[i+j].end<=t.bodyEnd+1e-8)}
  }
  if(f.graph==='derivative_0')for(let j=0;j<6;j++)assert.equal(frames[i+j].graph,'derivative_'+j);
 }
 assert.equal(questions,t.rounds);
 frames.slice(-5).forEach((f,i)=>{assert.equal(f.start,duration-10+i*2);assert.equal(f.end-f.start,2)});
}
for(const speed of ['slow','medium','fast'])for(const duration of [120,180]){
 const t=Timing.schedule(duration,speed),score=music.render(duration,8000,speed);
 assert.equal(score.bpm,{slow:100,medium:120,fast:140}[speed]);assert.equal(score.events.length,t.rounds*8+20);
 for(let i=0;i<t.rounds*8;i++){near(score.events[i].time,i*60/t.bpm);assert.equal(score.events[i].closing,false)}
 score.events.slice(-20).forEach((e,i)=>{near(e.time,duration-10+i*.5);assert(e.closing)});
 let energy=0;for(const v of score.data){assert(Number.isFinite(v)&&Math.abs(v)<=.901);energy+=v*v}assert(energy>10);
 const opts={duration,speed,kinds:seq.presets[3],footwork:true,derivatives:true};
 const together=planner.plan({...opts,displayMode:'together'},()=>.4),predict=planner.plan({...opts,displayMode:'predict'},()=>.4);
 assert.deepEqual(together.map(f=>[f.start,f.end,f.graph]),predict.map(f=>[f.start,f.end,f.graph]));
 for(const f of predict.filter(f=>!f.transition&&f.start<duration-10)){
  const beatIndex=Math.round(f.start/t.beat);near(score.events[beatIndex].time,f.start);near(score.events[beatIndex+4].time,f.revealAt);
 }
}
console.log(`PASS: ${runs} session combinations; 8 beats per question, reveal on beat 5, identical mode lengths, and music event/visual alignment at all three BPM values.`);
