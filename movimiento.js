// Menú, transiciones de imágenes y movimiento al desplazarse.
(() => {
  const hero=document.querySelector('.hero'),ticker=document.querySelector('.ticker'),motion=document.querySelector('#motion'),media=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=false;
  function applyMotion(){
    hero.classList.toggle('paused',paused);
    ticker.classList.toggle('paused',paused);
    motion.hidden=media.matches;
    motion.children[0].textContent=paused?'▷':'Ⅱ';
    motion.children[1].textContent=paused?'Reanudar movimiento':'Pausar movimiento';
    requestUpdate()
  }
  motion.addEventListener('click',()=>{
    paused=!paused;
    applyMotion()
  });
  media.addEventListener('change',applyMotion);
  const menu=document.querySelector('.menu'),nav=document.querySelector('#menu');
  function setMenu(open){
    nav.classList.toggle('open',open);
    menu.setAttribute('aria-expanded',String(open));
    menu.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú')
  }
  menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));
  nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){
      setMenu(false);
      menu.focus()
    }
  });
  const pics=[...document.querySelectorAll('.stage img')],captions=['01 / La sala inmersiva','02 / En comunidad','03 / Un momento para respirar'];
  const stageLetter=document.querySelector('.stage-letter');
  const letterUse=stageLetter.querySelector('use'), letters=['e','c','o'];
  document.querySelectorAll('[data-pillar]').forEach(el=>el.addEventListener('toggle',()=>{
    if(!el.open)return;
    const n=+el.dataset.pillar;
    pics.forEach((p,i)=>{
      p.classList.toggle('active',i===n);
      p.setAttribute('aria-hidden',String(i!==n))
    });
    document.querySelector('#stage-caption').textContent=captions[n];
    letterUse.setAttribute('href','#ink-'+letters[n]);
    stageLetter.classList.remove('flash');
    if(!paused&&!media.matches){
      void stageLetter.getBoundingClientRect();
      stageLetter.classList.add('flash')
    }
  }));
  if('IntersectionObserver' in window){
    const reveal=new IntersectionObserver(items=>{
      items.forEach(x=>{
        if(x.isIntersecting){
          x.target.classList.add('in');
          reveal.unobserve(x.target)
        }
      })
    },{threshold:.08});
    document.querySelectorAll('[data-reveal]').forEach(el=>reveal.observe(el));
    document.documentElement.classList.add('enhanced');
    new IntersectionObserver(([x])=>hero.classList.toggle('outside',!x.isIntersecting)).observe(hero);
    new IntersectionObserver(([x])=>{
      ticker.querySelector('.ticker-inner').style.animationPlayState=x.isIntersecting?'':'paused'
    }).observe(ticker);
  }
  const progress=document.querySelector('.progress');
  const dynamic=[...document.querySelectorAll('[data-depth], [data-parallax]')];
  const modest=(n,limit)=>Math.max(-limit,Math.min(limit,n));
  let frame=0;
  function update(){
    frame=0;
    const range=document.documentElement.scrollHeight-innerHeight;
    progress.style.transform='scaleX('+(range>0?scrollY/range:0)+')';
    dynamic.forEach(el=>{
      const rect=el.getBoundingClientRect(), live=!paused&&!media.matches&&rect.bottom>-60&&rect.top<innerHeight+60;
      const delta=live?(innerHeight/2-rect.top-rect.height/2):0;
      const wide=innerWidth>810;
      el.style.setProperty('--depth',modest(delta*.048,wide?21:12)+'px');
      if(el.dataset.depth==='interlude'){
        el.style.setProperty('--line-one',modest(delta*.078,wide?31:10)+'px');
        el.style.setProperty('--line-two',modest(delta*-.13,wide?57:17)+'px');
      }
      if(el.hasAttribute('data-parallax')) el.style.setProperty('--letter-drift',modest(delta*.09,wide?27:12)+'px');
    });
  }
  function requestUpdate(){
    if(!frame)frame=requestAnimationFrame(update)
  }
  addEventListener('scroll',requestUpdate,{passive:true});
  addEventListener('resize',requestUpdate,{passive:true});
  applyMotion();
})();
