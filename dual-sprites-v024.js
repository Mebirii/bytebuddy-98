/* ByteBuddy '98 V0.24 — five handmade dual-type pixel variants.
   No new species, images, textures or colors: same original 24x24 four-tone LCD.
   Every variant is a visual attribute of a single evolved companion. */
(()=>{
"use strict";
const variants=Object.freeze({
 "flamme/ombre":{title:"BRAISE NOCTURNE",mark:"✦"},
 "nature/lumière":{title:"SYLVE CÉLESTE",mark:"✦"},
 "eau/foudre":{title:"MARÉE ORAGEUSE",mark:"ϟ"},
 "foudre/ombre":{title:"ORAGE NOCTURNE",mark:"ϟ"},
 "foudre/lumière":{title:"AURORE ÉLECTRIQUE",mark:"✦"}
});
function variant(primary,secondary){
 return variants[primary+"/"+secondary]||null;
}
function label(primary,secondary){
 const v=variant(primary,secondary);
 return v?v.title:secondary?primary.toUpperCase()+" / "+secondary.toUpperCase():null;
}
function draw(primary,secondary,pix,palette,t=0,still=false){
 if(!secondary||!primary||secondary===primary)return false;
 const {dark,mid,light,pale}=palette;
 const p=(x,y,w=1,h=1,c=dark)=>pix(x,y,w,h,c);
 const stroke=()=>{p(1,20,2,2,dark);p(21,21,2,2,dark)};
 const twinkle=still||Math.floor(t/330)%3!==0;
 switch(primary+"/"+secondary){
  case "flamme/ombre": {
   // Two broken crescent horns, ragged cape and a split smoldering tail.
   p(3,2,2,4,dark);p(4,4,3,4,dark);p(6,6,2,2,mid);
   p(19,1,2,5,dark);p(17,4,3,3,dark);p(16,6,2,2,light);
   p(1,10,5,2,dark);p(0,12,5,3,mid);p(1,15,3,3,dark);p(2,17,4,2,light);
   p(19,13,4,2,dark);p(21,15,3,2,dark);p(21,18,2,3,mid);
   p(8,6,2,2,pale);p(14,5,2,3,pale);
   if(twinkle){p(3,8,2,2,pale);p(20,9,2,2,pale);}
   break;
  }
  case "nature/lumière": {
   // A floating leaf crown, symmetric long feather wings, and luminous petals.
   p(10,0,5,1,dark);p(8,1,2,2,pale);p(15,1,2,2,pale);
   p(10,2,5,1,light);p(12,0,1,3,pale);
   p(0,7,4,2,dark);p(2,9,4,2,mid);p(0,11,5,2,dark);
   p(2,13,5,2,light);p(3,16,4,2,mid);p(4,18,3,2,pale);
   p(20,7,4,2,dark);p(18,9,4,2,mid);p(19,11,5,2,dark);
   p(17,13,5,2,light);p(17,16,4,2,mid);p(17,18,3,2,pale);
   p(10,6,2,2,pale);p(15,6,2,2,pale);
   if(twinkle){p(2,3,2,2,pale);p(20,3,2,2,pale);}
   break;
  }
  case "eau/foudre": {
   // Lightning dorsal fin, twin electric flippers, charged waves and whiskers.
   p(11,0,4,2,dark);p(9,2,5,2,light);p(12,4,4,2,dark);p(10,6,3,2,pale);
   p(1,11,4,2,dark);p(3,13,4,2,light);p(1,15,4,2,dark);
   p(19,8,4,2,dark);p(21,10,3,3,light);p(18,12,4,2,pale);
   p(0,20,5,2,dark);p(3,18,3,2,light);p(19,20,5,2,dark);
   p(7,17,3,2,pale);p(13,19,3,2,light);
   if(twinkle){p(2,5,2,2,pale);p(22,4,2,2,pale);}
   break;
  }
  case "foudre/ombre": {
   // Forked shadow antennae, bat-wing lightning spikes and black veil.
   p(3,2,3,2,dark);p(5,4,3,2,mid);p(7,6,2,2,dark);
   p(20,1,3,2,dark);p(18,3,3,2,mid);p(16,5,3,2,dark);
   p(0,9,4,3,dark);p(2,12,3,3,mid);p(0,15,5,2,dark);
   p(21,10,3,3,dark);p(19,13,5,2,mid);p(21,16,3,2,dark);
   p(5,19,3,3,dark);p(17,19,3,3,dark);p(10,9,4,2,light);
   if(twinkle){p(1,5,2,2,pale);p(21,6,2,2,pale);}
   break;
  }
  case "foudre/lumière": {
   // Seven-point solar crown, streaming spark-feathers, two star glints.
   p(12,0,2,5,pale);p(8,2,2,3,light);p(16,2,2,3,light);
   p(5,5,4,2,dark);p(17,5,4,2,dark);p(9,4,7,1,pale);
   p(1,11,4,2,pale);p(3,13,3,2,light);p(0,16,5,2,mid);
   p(20,11,4,2,pale);p(18,13,3,2,light);p(19,16,5,2,mid);
   p(7,18,3,2,pale);p(15,18,3,2,pale);p(11,7,3,2,light);
   if(twinkle){p(0,6,2,2,pale);p(22,6,2,2,pale);}
   break;
  }
  default: {
   // Old saves may have other valid double combinations: never lose their identity.
   if(secondary==="ombre"){
     p(2,4,4,3,dark);p(20,4,3,3,dark);p(1,14,4,4,mid);p(20,14,4,4,mid);
     p(11,1,3,3,dark);p(12,2,1,1,pale);
   } else if(secondary==="lumière"){
     p(9,0,7,2,pale);p(6,2,4,2,light);p(16,2,4,2,light);
     p(1,10,5,2,pale);p(18,10,5,2,pale);
   } else if(secondary==="foudre"){
     p(9,0,4,2,dark);p(11,2,4,2,pale);p(5,4,5,2,dark);
     p(18,14,5,2,mid);p(21,16,3,2,pale);
   } else if(secondary==="eau"){
     p(1,8,5,2,dark);p(2,10,4,2,light);p(20,7,4,2,mid);
     p(18,9,5,2,pale);p(8,1,4,3,light);
   } else if(secondary==="nature"){
     p(2,5,3,6,mid);p(3,4,3,2,light);p(18,5,4,6,mid);
     p(17,4,4,2,light);p(10,0,4,2,pale);
   } else if(secondary==="flamme"){
     p(2,4,3,5,dark);p(3,3,3,3,light);p(19,4,3,5,dark);
     p(18,3,3,3,light);p(11,0,3,4,pale);
   }
   stroke();
  }
 }
 return true;
}
window.ByteBuddyDualSpritesV24=Object.freeze({variants,variant,label,draw});
})();