(function(){
  document.querySelectorAll('article pre').forEach(function(pre){
    var b=document.createElement('button');b.type='button';b.className='copy';b.textContent='Copy';
    b.addEventListener('click',function(){var t=pre.innerText.replace(/Copy\s*$/,'');
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1500)},function(){})}});
    pre.appendChild(b);
  });
  var box=document.getElementById('results');
  if(!box)return;
  var input=document.getElementById('q');
  var q0=new URLSearchParams(location.search).get('q')||'';
  input.value=q0;
  function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  fetch('/assets/search-index.json').then(function(r){return r.json()}).then(function(idx){
    function run(){
      var q=input.value.trim().toLowerCase();
      if(!q){box.innerHTML='<li><p>Type a word, for example <em>file transfer</em>, <em>sudo</em> or <em>sign in</em>.</p></li>';return}
      var terms=q.split(/\s+/).filter(Boolean);
      var out=[];
      idx.forEach(function(p){
        var t=p.t.toLowerCase(),d=p.d.toLowerCase(),x=p.x.toLowerCase(),s=0,ok=true;
        terms.forEach(function(w){
          var inT=t.indexOf(w)>=0,inD=d.indexOf(w)>=0,c=x.split(w).length-1;
          if(!inT&&!inD&&c===0){ok=false}
          s+=(inT?8:0)+(inD?3:0)+Math.min(c,10);
        });
        if(ok)out.push({p:p,s:s});
      });
      out.sort(function(a,b){return b.s-a.s});
      if(!out.length){box.innerHTML='<li><p>No pages match <strong>'+esc(q)+'</strong>. Try fewer words.</p></li>';return}
      box.innerHTML=out.slice(0,20).map(function(o){
        var p=o.p,i=p.x.toLowerCase().indexOf(terms[0]),sn=p.d;
        if(i>=0){sn='...'+p.x.substring(Math.max(0,i-60),i+140)+'...'}
        return '<li><a href="'+p.u+'">'+esc(p.t)+'</a><p>'+esc(sn)+'</p><small>'+esc(p.k)+'</small></li>';
      }).join('');
    }
    input.addEventListener('input',run);run();
  }).catch(function(){box.innerHTML='<li><p>Search is not available right now.</p></li>'});
})();