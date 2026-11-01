/* ByteBuddy '98 V0.18 — Eight original species, 24x24 4-tone LCD illustrations.
   Four specialist rookies and their unique ultimate forms. */
(()=>{
"use strict";
const species=Object.freeze({
 cindr:   {name:"CENDRIX",type:"flamme",stage:2,family:"ember",trait:"BRASIER PRÉCIS",detail:"Un félin des braises : ses attaques gagnent en précision."},
 cindr2:  {name:"PYRÉON",type:"flamme",stage:3,family:"cindr",trait:"BRASIER PRÉCIS",detail:"Un dragon félin à crinière ardente et ailes de cendre."},
 bramble: {name:"RONCIX",type:"nature",stage:2,family:"verd",trait:"CARAPACE VÉGÉTALE",detail:"Un gardien des ronces qui amortit mieux les coups."},
 bramble2:{name:"BOSQUÉON",type:"nature",stage:3,family:"bramble",trait:"CARAPACE VÉGÉTALE",detail:"Un cerf-tortue ancestral aux bois feuillus."},
 tide:    {name:"RÉCIFIN",type:"eau",stage:2,family:"aqua",trait:"MARÉE MENTALE",detail:"Un esprit des récifs dont les pouvoirs frappent plus fort."},
 tide2:   {name:"ABYSSÉON",type:"eau",stage:3,family:"tide",trait:"MARÉE MENTALE",detail:"Un kraken abyssal auréolé de nageoires."},
 surge:   {name:"FULGIX",type:"foudre",stage:2,family:"volt",trait:"CHARGE FOUDROYANTE",detail:"Un scarabée d'orage qui frappe avant ses adversaires."},
 surge2:  {name:"FULGORON",type:"foudre",stage:3,family:"surge",trait:"CHARGE FOUDROYANTE",detail:"Un titan électrique aux pinces de métal."}
});
function draw(form,pix,eye,{dark,mid,light,pale}){
 if(!species[form])return false;
 const adult=form.endsWith("2");
 const base=adult?form.slice(0,-1):form;
 if(base==="cindr"){
   // Firecat — long angular ears, ember mane and curling tail (not the old dinosaur).
   pix(5,3,5,9,dark);pix(6,1,3,4,dark);pix(7,3,2,5,light);
   pix(15,2,5,11,dark);pix(17,0,3,5,dark);pix(16,4,2,4,light);
   pix(7,9,12,11,dark);pix(8,10,10,9,mid);pix(10,9,6,3,light);
   pix(4,12,4,3,dark);pix(2,15,5,3,dark);pix(1,18,4,4,dark);pix(3,21,4,2,light);
   pix(19,14,4,3,dark);pix(20,11,3,5,dark);pix(21,8,2,4,light);
   pix(7,18,5,4,dark);pix(15,18,5,4,dark);pix(8,20,3,2,light);pix(16,20,3,2,light);
   eye(9,13);eye(16,13);pix(12,16,2,1,dark);pix(12,17,3,1,pale);
   pix(10,6,2,3,dark);pix(12,4,2,5,dark);pix(14,6,2,3,dark);
   if(adult){
     pix(2,5,5,2,dark);pix(0,3,4,3,dark);pix(2,8,5,3,mid);
     pix(19,4,5,3,dark);pix(20,7,4,4,mid);pix(22,2,2,4,dark);
     pix(4,0,3,3,light);pix(10,0,4,4,dark);pix(11,1,2,3,pale);
     pix(0,18,5,4,mid);pix(3,22,6,2,dark);pix(18,22,6,2,dark);
   }
 }else if(base==="bramble"){
   // Turtle-deer of the forest, an armored semicircular shell and forked antlers.
   pix(5,11,15,10,dark);pix(6,10,13,10,mid);pix(7,9,11,3,dark);
   pix(8,11,9,7,light);pix(9,12,2,3,mid);pix(13,12,3,3,mid);
   pix(2,14,6,5,dark);pix(0,17,5,3,mid);pix(19,13,5,5,dark);pix(20,15,3,2,light);
   pix(7,20,4,3,dark);pix(16,20,4,3,dark);
   pix(8,5,3,7,dark);pix(8,3,2,4,light);pix(14,4,3,8,dark);pix(15,2,2,5,light);
   pix(6,2,5,2,dark);pix(5,0,2,4,dark);pix(13,2,5,2,dark);pix(17,0,2,4,dark);
   eye(8,14);eye(16,14);pix(12,17,2,1,dark);
   if(adult){
     pix(1,1,6,3,dark);pix(2,0,2,5,light);pix(18,1,6,3,dark);pix(21,0,2,6,light);
     pix(4,4,3,6,dark);pix(18,4,3,6,dark);
     pix(5,8,14,4,dark);pix(7,7,10,2,light);pix(4,13,3,6,mid);pix(19,13,3,6,mid);
     pix(10,11,4,2,pale);pix(12,15,2,3,dark);
   }
 }else if(base==="tide"){
   // Floating ray and coral crown; the ultimate unfurls multiple tentacles.
   pix(9,4,6,3,dark);pix(6,6,12,4,dark);pix(5,9,14,8,dark);pix(7,10,10,6,mid);
   pix(1,10,5,4,dark);pix(0,13,4,4,mid);pix(18,10,5,4,dark);pix(21,13,3,4,mid);
   pix(7,16,4,6,dark);pix(13,16,4,6,dark);pix(9,20,2,4,mid);pix(15,20,2,4,mid);
   pix(11,1,2,5,dark);pix(7,2,3,4,light);pix(15,1,3,5,light);
   eye(9,11);eye(15,11);pix(11,14,3,1,dark);
   pix(2,4,3,3,pale);pix(20,4,2,3,pale);
   if(adult){
     pix(8,0,3,4,dark);pix(11,0,3,3,light);pix(15,0,3,4,dark);
     pix(2,7,6,2,dark);pix(1,5,5,3,mid);pix(17,7,6,2,dark);pix(19,5,5,3,mid);
     pix(4,16,3,7,dark);pix(2,19,3,5,mid);pix(18,16,3,7,dark);pix(20,19,3,5,mid);
     pix(10,18,3,6,dark);pix(13,18,3,6,mid);
     pix(10,7,5,2,pale);
   }
 }else if(base==="surge"){
   // Stag-beetle bug silhouette with electric fork and segmented metal wings.
   pix(7,8,11,13,dark);pix(8,9,9,11,mid);pix(10,11,5,6,light);
   pix(4,7,4,6,dark);pix(2,4,4,5,dark);pix(1,1,3,5,light);
   pix(17,7,4,6,dark);pix(19,4,4,5,dark);pix(21,1,3,5,light);
   pix(9,3,3,7,dark);pix(10,1,3,4,light);pix(14,3,3,7,dark);pix(15,0,3,5,light);
   pix(4,14,5,2,dark);pix(2,16,5,3,dark);pix(17,14,5,2,dark);pix(20,16,4,3,dark);
   pix(7,19,4,4,dark);pix(15,19,4,4,dark);pix(10,18,5,2,light);
   eye(9,12);eye(15,12);pix(12,16,2,2,dark);
   if(adult){
     pix(0,7,4,5,dark);pix(2,5,4,2,light);pix(20,7,4,5,dark);pix(19,5,4,2,light);
     pix(5,9,3,11,dark);pix(17,9,3,11,dark);
     pix(8,0,3,4,dark);pix(13,0,3,4,dark);
     pix(2,20,6,3,dark);pix(17,20,6,3,dark);pix(10,21,5,3,mid);
     pix(11,9,3,2,pale);
   }
 }
 return true;
}
function trait(form){
 const base=form.endsWith("2")?form.slice(0,-1):form;
 return ({cindr:"precision",bramble:"defense",tide:"esprit",surge:"vitesse"})[base]||null;
}
window.ByteBuddyBestiaryV18=Object.freeze({species,draw,trait,keys:Object.freeze(Object.keys(species))});
})();