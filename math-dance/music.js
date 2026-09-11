/* MIT — original procedural score. No recordings, soundfonts or samples. */
(function(root){
'use strict';
function render(duration,sampleRate=22050){
 const intro=8,tail=1.5,end=intro+duration,data=new Float32Array(Math.ceil((end+tail)*sampleRate));
 let randomState=73017;const noise=()=>{randomState=(1664525*randomState+1013904223)>>>0;return randomState/2147483648-1};
 function sound(at,len,fn,gain){const start=Math.round(at*sampleRate),n=Math.round(len*sampleRate);for(let i=0;i<n&&start+i<data.length;i++){const u=i/sampleRate;data[start+i]+=fn(u,i)*gain}}
 const envelope=(t,len)=>Math.min(1,t/.008)*Math.exp(-t/(len*.23));
 function note(at,freq,len,gain){sound(at,len,t=>(Math.sin(2*Math.PI*freq*t)+.2*Math.sin(4*Math.PI*freq*t))*envelope(t,len),gain)}
 function kick(at,gain){sound(at,.24,t=>Math.sin(2*Math.PI*(45*t+90*.025*(1-Math.exp(-t/.025))))*Math.exp(-t*23),gain)}
 function hat(at,gain){sound(at,.055,t=>noise()*Math.exp(-t*95),gain)}
 function snare(at,gain){sound(at,.14,t=>(.75*noise()+.25*Math.sin(2*Math.PI*180*t))*Math.exp(-t*32),gain)}
 // Quiet pitched cues reinforce the spoken preparation countdown.
 [5,6,7].forEach(t=>note(t,660,.15,.075));note(8,880,.18,.09);
 const roots=[110,130.8128,97.9989,146.8324];
 const melody=[0,7,12,7,3,7,10,7,0,7,15,12,10,7,3,7];
 for(let b=0;b<duration*2;b++){
  const relative=b*.5,at=intro+relative,closing=relative>=duration-10;
  const gain=closing?.36:.70;
  const bar=Math.floor(b/8),root=roots[bar%roots.length];
  kick(at,.40*gain);hat(at,.11*gain);hat(at+.25,.065*gain);if(b%2===1)snare(at,.20*gain);
  note(at,closing?110:root,.32,.20*gain);
  if(b%2===0)note(at,closing?440:root*2*Math.pow(2,melody[Math.floor(b/2)%melody.length]/12),.38,.07*gain);
 }
 // A short resolved ending, at the exact zero of the visual timer.
 [220,277.1826,329.6276,440].forEach(f=>note(end,f,1.2,.05));
 let peak=0;for(const v of data)peak=Math.max(peak,Math.abs(v));if(peak>.9){const scale=.9/peak;for(let i=0;i<data.length;i++)data[i]*=scale}
 return {data,sampleRate,intro,duration};
}
const api={render};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DanceMusic=api;
})(typeof window!=='undefined'?window:globalThis);
