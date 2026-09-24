/* MIT — deterministic scheduling; curve geometry is already in graphs.js. */
(function(root){
'use strict';
const weights={constant:.4,linear:2,quadratic:3,absolute:1.5,cubic:1,quartic:.55,sin:.25,cos:.20,tan:.12,exp:.3,log:.3};
const presets={1:['constant','linear','quadratic'],2:['constant','linear','quadratic','absolute','cubic','quartic'],3:Object.keys(weights)};
function createPlanner(graphs,scenes=[]){
 const map=new Map(graphs.map(g=>[g.id,g]));
 const get=(kind,a=1,h=0,k=0)=>{const g=map.get(`${kind}_${a}_${h}_${k}`);if(!g)throw Error('Missing graph');return g};
 function plan(options,rng=Math.random){
  const {duration,accelerate,derivatives,jumps}=options;
  if(![120,180].includes(duration))throw Error('Choose 120 or 180 seconds.');
  const kinds=options.kinds.filter(k=>k in weights);if(!kinds.length)throw Error('Select at least one function.');
  const pick=xs=>xs[Math.min(xs.length-1,Math.floor(rng()*xs.length))];
  let bag=[],previous='',round=0,jumped=false,derived=false;const usedScenes=new Set();
  const refill=()=>{bag=kinds.filter(k=>k!=='constant'||!jumped||kinds.length===1);round++};
  const choose=()=>{if(!bag.length)refill();let pool=bag.filter(k=>k!==previous);if(!pool.length)pool=bag;let n=rng()*pool.reduce((s,k)=>s+weights[k],0);const k=pool.find(k=>(n-=weights[k])<0)||pool.at(-1);bag.splice(bag.indexOf(k),1);previous=k;return k};
  let time=0,footBlocks=0;const frames=[],limit=duration-10;
  const base=p=>!accelerate?4:p<duration*.5?4:p<duration*.75?3:2;
  const add=(g,seconds,cue,scene=null)=>{frames.push({start:time,end:time+seconds,graph:g.id,cue,scene});time+=seconds};
  while(time<limit-1e-8){
   const remain=limit-time;
   if(derivatives&&!derived&&round>=1&&!bag.length&&remain>=24){for(let i=0;i<6;i++)add(map.get(`derivative_${i}`),4,i===0?'derivativeStart':'differentiate');derived=true;continue}
   const kind=choose(),secs=base(time),sign=pick([-1,1]);
   const reserve=bag.length*4;
   // Complete out-and-back steps; never leave students drifting across the room.
   if(options.footwork&&remain-reserve>=12&&(footBlocks===0||rng()<.7)){
    const seconds=4,block=`footwork_${footBlocks}`;
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
    const eligible=scenes.filter(s=>s.requires.includes(kind)&&s.requires.every(k=>kinds.includes(k))&&s.cards.length*4<=remain-reserve);
    let fresh=eligible.filter(s=>!usedScenes.has(s.id));
    if(!fresh.length&&eligible.length){eligible.forEach(s=>usedScenes.delete(s.id));fresh=eligible}
    if(fresh.length&&rng()<.8){const scene=pick(fresh);usedScenes.add(scene.id);for(const card of scene.cards)add(map.get(card.graph),4,card.cue,scene.id);continue}
   }
   let maxFrames=Math.max(1,Math.floor((remain-reserve)/4));
   const long=['quartic','sin','cos','tan','exp','log'].includes(kind),stepSecs=long?4:secs;
   if(kind==='constant'){
    const values=options.footwork&&jumps&&!jumped?[-4,4]:[pick([-3,-2,2,3]),0];
    values.slice(0,Math.min(2,maxFrames)).forEach((v,i)=>{if(time<limit)add(get('constant',1,0,v),Math.min(stepSecs,limit-time),i===1&&v===4?'jump':v>0?'high':v<0?'low':'middle')});jumped=true;continue;
   }
   if(kind==='linear'){
    const k=pick([-2,-1,0,1,2]);let slopes=[.25,.5,1,1.5,2,3];if(rng()<.5)slopes.reverse();
    const start=Math.floor(rng()*4);slopes=slopes.slice(start,start+3).map(v=>v*sign);
    slopes.slice(0,Math.min(3,maxFrames)).forEach(a=>{if(time<limit)add(get(kind,a,0,k),Math.min(stepSecs,limit-time),'shape')});continue;
   }
   const a=sign*( ['quadratic','cubic','absolute'].includes(kind)?pick([.25,.5,1,2]):1);
   const axis=pick(['h','k']);const peak=kind==='absolute'&&axis==='h'?3:2;
   const values=long?[pick([-1,0,1])]:[0,sign*peak];
   values.slice(0,maxFrames).forEach((v,i)=>{if(time<limit)add(get(kind,a,axis==='h'?v:0,axis==='k'?v:0),Math.min(stepSecs,limit-time),i===0?'shape':axis==='h'?(v>0?'right':'left'):(v>0?'up':'down'))});
  }
  [2,0,-2,0,2].forEach((k,i)=>add(get('constant',1,0,k),2,['high','middle','low','middle','high'][i]));
  return frames;
 }
 return {plan,get,map};
}
function frameAt(frames,time){let lo=0,hi=frames.length-1;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(frames[mid].start<=time)lo=mid;else hi=mid-1}return lo}
const api={createPlanner,frameAt,presets,weights};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DanceSequence=api;
})(typeof window!=='undefined'?window:globalThis);
