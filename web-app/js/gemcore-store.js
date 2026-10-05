/* GemCore local evidence store — prototype only. Production should use authenticated server storage. */
(function(){
 const KEY='gemcore.submissions.v1';
 const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
 const save=x=>localStorage.setItem(KEY,JSON.stringify(x));
 window.GemCoreStore={
  list:load,
  create(meta={}){const all=load();const item={id:'GCG-'+Date.now(),createdAt:new Date().toISOString(),status:'inspection',meta,evidence:[],qc:{approved:false,reviewer:null,at:null}};all.unshift(item);save(all);return item},
  addEvidence(id,e){const all=load(),x=all.find(v=>v.id===id);if(!x)return null;x.evidence.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),createdAt:new Date().toISOString(),...e});save(all);return x},
  approve(id,reviewer='Human QC'){const all=load(),x=all.find(v=>v.id===id);if(!x)return null;x.qc={approved:true,reviewer,at:new Date().toISOString()};x.status='qc-approved';save(all);return x}
 };
})();