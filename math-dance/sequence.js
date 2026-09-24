/* MIT — deterministic scheduling; curve geometry is already in graphs.js. */
(function(root){
'use strict';
const Timing=typeof module!=='undefined'&&module.exports?require('./timing.js'):root.DanceTiming;
const weights={constant:.4,linear:2,quadratic:3,absolute:1.5,cubic:1,quartic:.55,sin:.25,cos:.20,tan:.12,exp:.3,log:.3};
const presets={1:['constant','linear','quadratic'],2:['constant','linear','quadratic','absolute','cubic','quartic'],3:Object.keys(weights)};
function createPlanner(graphs,scenes=[]){
 const map=new Map(graphs.map(g=>[g.id,g]));
 const get=(kind,a=1,h=0,k=0)=>{const g=map.get(`${kind}_${a}_${h}_${k}`);if(!g)throw Error('Missing graph');return g};
 function plan(options,rng=Math.random){
  const {duration,derivatives,jumps}=options;
  const speed=options.speed||'medium',predict=options.displayMode==='predict';
  const timing=Timing.schedule(duration,speed),steady=timing.round;
  let closing=false;
  const kinds=options.kinds.filter(k=>k in weights);if(!kinds.length)throw Error('Select at least one function.');
  const pick=xs=>xs[Math.min(xs.length-1,Math.floor(rng()*xs.length))];
  let bag=[],previous='',round=0,jumped=false,derived=false;const usedScenes=new Set();
  const refill=()=>{bag=kinds.filter(k=>k!=='constant'||!jumped||kinds.length===1);round++};
  const choose=()=>{if(!bag.length)refill();let pool=bag.filter(k=>k!==previous);if(!pool.length)pool=bag;let n=rng()*pool.reduce((s,k)=>s+weights[k],0);const k=pool.find(k=>(n-=weights[k])<0)||pool.at(-1);bag.splice(bag.indexOf(k),1);previous=k;return k};
  let time=0,footBlocks=0;const frames=[],limit=timing.bodyEnd;
  const base=()=>steady;
  const add=(g,seconds,cue,scene=null)=>{
   if(!closing&&seconds<steady-1e-8)return;
   const end=closing?time+seconds:(frames.length+1)*steady;
   frames.push({start:time,revealAt:time+(predict&&!closing?4*timing.beat:0),end,graph:g.id,cue,scene,bpm:closing?120:timing.bpm,beat:closing?.5:timing.beat,beats:closing?4:8});time=end;
  };
  while(time<limit-1e-8){
   const remain=limit-time;
   if(derivatives&&!derived&&round>=1&&!bag.length&&remain+1e-8>=6*steady){for(let i=0;i<6;i++)add(map.get(`derivative_${i}`),steady,i===0?'derivativeStart':'differentiate');derived=true;continue}
   const kind=choose(),secs=base(time),sign=pick([-1,1]);
   const reserve=bag.length*steady;
   // Complete out-and-back steps; never leave students drifting across the room.
   if(options.footwork&&remain-reserve+1e-8>=3*steady&&(footBlocks===0||rng()<.7)){
    const seconds=steady,block=`footwork_${footBlocks}`;
    if(kind==='constant'){
     const jump=jumps&&!jumped;
     const values=jump?[-4,4,0]:[0,-3,0];
     const cues=jump?['feetBend','jump','feetFinish']:['feetReady','feetBend','feetStand'];
     values.forEach((k,i)=>add(get(kind,1,0,k),seconds,cues[i],block));jumped=true;
    }else{
     const a=sign*(kind==='linear'?pick([.5,1]):['quadratic','absolute'].includes(kind)?.5:kind==='cubic'?.25:1);
     const vertical=footBlocks%3===2;
     const direction=Math.floor(footBlocks/3)%2===0?(footBlocks%3===0?1:-1):(footBlocks%3===0?-1:1);
     for(let i=0;i<3;i++){
      const h=!vertical&&i===1?direction*2:0,k=vertical&&i===1?-2:0;
      const graph=kind==='linear'?get(kind,a,0,k-a*h):get(kind,a,h,k);
      const cue=i===0?'feetReady':i===2?(vertical?'feetStand':'feetReturn'):vertical?'feetBend':direction>0?'stepRight':'stepLeft';
      add(graph,seconds,cue,block);
     }
    }
    footBlocks++;continue;
   }
   if(options.relations!==false){
    const eligible=scenes.filter(s=>s.requires.includes(kind)&&s.requires.every(k=>kinds.includes(k))&&s.cards.length*steady<=remain-reserve+1e-8);
    let fresh=eligible.filter(s=>!usedScenes.has(s.id));
    if(!fresh.length&&eligible.length){eligible.forEach(s=>usedScenes.delete(s.id));fresh=eligible}
    if(fresh.length&&rng()<.8){const scene=pick(fresh);usedScenes.add(scene.id);for(const card of scene.cards)add(map.get(card.graph),steady,card.cue,scene.id);continue}
   }
   let maxFrames=Math.max(1,Math.floor((remain-reserve)/steady+1e-8));
   const long=['quartic','sin','cos','tan','exp','log'].includes(kind),stepSecs=long?steady:secs;
   if(kind==='constant'){
    const values=options.footwork&&jumps&&!jumped?[-4,4]:[pick([-3,-2,2,3]),0];
    values.slice(0,Math.min(2,maxFrames)).forEach((v,i)=>{if(time<limit-1e-8)add(get('constant',1,0,v),Math.min(stepSecs,limit-time),i===1&&v===4?'jump':v>0?'high':v<0?'low':'middle')});jumped=true;continue;
   }
   if(kind==='linear'){
    const k=pick([-2,-1,0,1,2]);let slopes=[.25,.5,1,1.5,2,3];if(rng()<.5)slopes.reverse();
    const start=Math.floor(rng()*4);slopes=slopes.slice(start,start+3).map(v=>v*sign);
    slopes.slice(0,Math.min(3,maxFrames)).forEach(a=>{if(time<limit-1e-8)add(get(kind,a,0,k),Math.min(stepSecs,limit-time),'shape')});continue;
   }
   const a=sign*( ['quadratic','cubic','absolute'].includes(kind)?pick([.25,.5,1,2]):1);
   const axis=pick(['h','k']);const peak=kind==='absolute'&&axis==='h'?3:2;
   const values=long?[pick([-1,0,1])]:[0,sign*peak];
   values.slice(0,maxFrames).forEach((v,i)=>{if(time<limit-1e-8)add(get(kind,a,axis==='h'?v:0,axis==='k'?v:0),Math.min(stepSecs,limit-time),i===0?'shape':axis==='h'?(v>0?'right':'left'):(v>0?'up':'down'))});
  }
  // Exact durations do not always contain a whole number of eight-counts.
  // Keep the last shape during a short uncounted transition; never shorten a question.
  if(timing.closingStart-time>1e-8){frames.push({start:time,revealAt:time,end:timing.closingStart,graph:frames.at(-1).graph,cue:'closingSoon',scene:null,bpm:timing.bpm,beat:timing.beat,beats:0,transition:true});}
  time=timing.closingStart;closing=true;
  [2,0,-2,0,2].forEach((k,i)=>add(get('constant',1,0,k),2,['high','middle','low','middle','high'][i]));
  return frames;
 }
 return {plan,get,map};
}
function frameAt(frames,time){let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].start<=time)lo=mid;else hi=mid-1}return lo}
const api={createPlanner,frameAt,presets,weights};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DanceSequence=api;
})(typeof window!=='undefined'?window:globalThis);
