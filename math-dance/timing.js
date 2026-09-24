/* MIT — shared clock geometry for synthesized music and visual questions. */
(function(root){
'use strict';
const tempos=Object.freeze({slow:100,medium:120,fast:140});
function schedule(duration,speed='medium'){
 if(![120,180].includes(duration))throw Error('Choose 120 or 180 seconds.');
 if(!Object.hasOwn(tempos,speed))throw Error('Invalid speed');
 const bpm=tempos[speed],beat=60/bpm,round=8*beat,closingStart=duration-10;
 const rounds=Math.floor(closingStart/round+1e-9),bodyEnd=rounds*round;
 return {duration,speed,bpm,beat,round,rounds,bodyEnd,closingStart,intro:8};
}
const api={tempos,schedule};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.DanceTiming=api;
})(typeof window!=='undefined'?window:globalThis);
