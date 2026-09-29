(function(){
  var IDS=['hero','about','pillars','reports','index','tools','exchange','newsletter'];
  var secs=IDS.map(function(id){return document.getElementById(id);}).filter(Boolean);
  var rail=document.getElementById('rail');
  if(!rail||!secs.length) return;
  var bTop=rail.querySelector('[data-act="top"]'),
      bPrev=rail.querySelector('[data-act="prev"]'),
      bNext=rail.querySelector('[data-act="next"]');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bands=[].slice.call(document.querySelectorAll('section, footer'));
  var cur=0;

  function lum(c){
    var m=(c||'').match(/[\d.]+/g); if(!m) return null;
    var a=m.length>3?+m[3]:1; if(a<0.5) return null;
    var f=m.slice(0,3).map(function(v){v=v/255; return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);});
    return .2126*f[0]+.7152*f[1]+.0722*f[2];
  }
  /* judge the band the rail sits over, not whatever element is painted there, so
     invisible overlays cannot be mistaken for a backdrop */
  function darkBehind(){
    var r=rail.getBoundingClientRect(), cy=r.top+r.height/2, el=null;
    for(var i=0;i<bands.length;i++){
      var q=bands[i].getBoundingClientRect();
      if(q.top<=cy && q.bottom>=cy) el=bands[i];
    }
    while(el){var L=lum(getComputedStyle(el).backgroundColor);
      if(L!==null) return L<0.30; el=el.parentElement;}
    return false;
  }
  function update(){
    var y=window.pageYOffset, i=0;
    for(var k=0;k<secs.length;k++){ if(secs[k].getBoundingClientRect().top<=140) i=k; }
    cur=i;
    bPrev.disabled = i<=0;
    bNext.disabled = i>=secs.length-1;
    bTop.classList.toggle('is-shown', y>window.innerHeight*0.55);
    rail.classList.toggle('on-dark', darkBehind());
  }
  function go(el){
    if(!el) return;
    var t=el.id==='hero'?0:el.getBoundingClientRect().top+window.pageYOffset-8;
    window.scrollTo({top:t,behavior:reduce?'auto':'smooth'});
  }
  bTop.addEventListener('click',function(){go(secs[0]);});
  bPrev.addEventListener('click',function(){go(secs[cur-1]);});
  bNext.addEventListener('click',function(){go(secs[cur+1]);});
  addEventListener('scroll',update,{passive:true});
  addEventListener('resize',update);
  update();
})();
