// Combine the reference stylesheets (in the reference layout's import order)
// and scope every rule under the storefront wrapper `.ocean.gloss-theme`.
// Each selector gains exactly one class, so the reference's own cascade
// (retail -> gloss -> ocean) keeps the same relative specificity.
const fs=require('fs'),postcss=require('postcss');
const SRC='/d/COCOJOJO/cocojojochem/COCOJOJO-IT-Handoff-2026-10-09/COCOJOJO-Website/app/'.replace('/d/','D:/');
const order=["globals","catalog","retail","gloss","lusion-home","home-motion","molecular-scroll","scroll-experience","interactive-finale","sideways-scene","molecule-closeup","cinematic-intro","blue-footer","company-pages","packaging-services","brand-identity","ocean-theme","formulation-tools","ingredient-properties","modern-header","newsletter","comparison-workspace","services-finale"];
const W='.ocean';
let out='/* Generated from the COCOJOJO ocean design (IT handoff 2026-10-09). Do not edit by hand:\n   re-run the build script. Every selector is scoped under .ocean (storefront wrapper). */\n';
let rules=0;
for(const f of order){
  const root=postcss.parse(fs.readFileSync(SRC+f+'.css','utf8'),{from:f});
  root.walkAtRules(a=>{ if(['import','source','theme','custom-variant','plugin'].includes(a.name)) a.remove(); });
  root.walkRules(r=>{
    let p=r.parent; while(p){ if(p.type==='atrule'&&/keyframes/.test(p.name)) return; p=p.parent; }
    rules++;
    r.selectors=r.selectors.map(s=>{
      s=s.trim();
      if(/^(:root|html|body)$/.test(s)) return W;
      if(/^(html|body)\s+/.test(s)) return s.replace(/^(html|body)\s+/,W+' ');
      if(s.startsWith('.gloss-theme')) return W+s;            // .ocean.gloss-theme ...
      return W+' '+s;
    });
  });
  out+='\n/* ---- '+f+'.css ---- */\n'+root.toString()+'\n';
}
fs.writeFileSync('ocean.css',out);
console.log('rules',rules,'bytes',out.length);
