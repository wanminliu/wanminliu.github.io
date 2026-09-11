/* MIT — deterministic scheduling; curve geometry is already in graphs.js. */
(function(root){
'use strict';
const weights={constant:2,linear:2,quadratic:3,absolute:1.5,cubic:1,quartic:.55,sin:.25,cos:.20,tan:.12,exp:.3,log:.3};
const presets={1:['constant','linear','quadratic'],2:['constant','linear','quadratic','absolute','cubic','quartic'],3:Object.keys(weights)};
function createPlanner(graphs){
 const map=new Map(graphs.map(g=>[g.id,g]));
 const get=(kind,a=1,h=0,k=0)=>{const g=map.get(`${kind}_${a}_${h}_${k}`);if(!g)throw Error('Missing graph');return g};
 function plan(options,rng=Math.random){
  const {duration,accelerate,derivatives,jumps}=options;
  if(![120,180].includes(duration))throw Error('Choose 120 or 180 seconds.');
  const kinds=options.kinds.filter(k=>k in weights);if(!kinds.length)throw Error('Select at least one function.');
  const pick=xs=>xs[Math.min(xs.length-1,Math.floor(rng()*xs.length))];
  const choose=()=>{let n=rng()*kinds.reduce((s,k)=>s+weights[k],0);return kinds.find(k=>(n-=weights[k])<0)||kinds.at(-1)};
  let time=0,last='';const frames=[],limit=duration-10;
  const base=p=>!accelerate?4:p<duration*.5?4:p<duration*.75?3:2;
  const add=(g,seconds,cue)=>{frames.push({start:time,end:time+seconds,graph:g.id,cue});time+=seconds;last=g.kind};
  while(time<limit-1e-8){
   const remain=limit-time;
   if(derivatives&&last!=='derivative'&&remain>=24&&rng()<.12){for(let i=0;i<6;i++)add(map.get(`derivative_${i}`),4,i===0?'derivativeStart':'differentiate');continue}
   const secs=base(time);
   if(jumps&&kinds.includes('constant')&&remain>=secs*3&&rng()<.12){add(get('constant',1,0,-4),secs,'low');add(get('constant',1,0,4),secs,'jump');add(get('constant'),secs,'middle');continue}
   const kind=choose(),a=kind==='constant'?1:pick([-1,1]);
   const long=['quartic','sin','cos','tan','exp','log'].includes(kind);const stepSecs=long?4:secs;
   const axis=['constant','linear'].includes(kind)?'k':pick(['h','k']);const sign=pick([-1,1]);const peak=kind==='constant'||(kind==='absolute'&&axis==='h')?3:2;
   const values=[0,sign,sign*peak,sign,0];
   if(remain<stepSecs*values.length){add(get(kind,a),Math.min(stepSecs,remain),'shape');continue}
   values.forEach((v,i)=>add(get(kind,a,axis==='h'?v:0,axis==='k'?v:0),stepSecs,i===0?'shape':v>values[i-1]?(axis==='h'?'right':'up'):(axis==='h'?'left':'down')));
  }
  [2,0,-2,0,2].forEach((k,i)=>add(get('constant',1,0,k),2,['high','middle','low','middle','high'][i]));
  return frames;
 }
 return {plan,get,map};
}
function frameAt(frames,time){let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].start<=time)lo=mid;else hi=mid-1}return lo}
const api={createPlanner,frameAt,presets,weights};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DanceSequence=api;
})(typeof window!=='undefined'?window:globalThis);
