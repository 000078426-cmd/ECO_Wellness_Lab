// Horarios, membresías y reservas locales.
(() => {
  const byId=id=>document.getElementById(id);
  const data={"1":"Martes 1 de diciembre","2":"Miércoles 2 de diciembre","3":"Jueves 3 de diciembre","4":"Viernes 4 de diciembre","5":"Sábado 5 de diciembre","6":"Domingo 6 de diciembre","7":"Lunes 7 de diciembre","8":"Martes 8 de diciembre","9":"Miércoles 9 de diciembre","10":"Jueves 10 de diciembre","11":"Viernes 11 de diciembre","12":"Sábado 12 de diciembre","13":"Domingo 13 de diciembre","14":"Lunes 14 de diciembre","15":"Martes 15 de diciembre","16":"Miércoles 16 de diciembre","17":"Jueves 17 de diciembre","18":"Viernes 18 de diciembre"};
  const classes={outside:'Yoga Outside',inmersiva:'Yoga Inmersiva'};
  const hours=[
  ['06:00','09:00'], ['07:00','18:00'], ['06:30','09:30'],
  ['07:30','18:30'], ['08:00','10:00'], ['08:30','10:30'],
  ['07:00','17:30'], ['06:30','09:00'], ['07:30','18:00'],
  ['06:00','09:30'], ['07:00','18:30'], ['08:30','10:00'],
  ['09:00','11:00'], ['07:00','17:30'], ['06:00','09:00'],
  ['07:30','18:00'], ['06:30','09:30'], ['07:00','18:30']
  ];
  const slotTime=(day,type)=>hours[Number(day)-1][type==='outside'?0:1];
  function displayTime(time){
    const [h,m]=time.split(':');
    const hour=Number(h);
    return (hour%12||12)+':'+m+(hour<12?' a. m.':' p. m.');
  }
  const sessionTitle=(type,day)=>classes[type]+' · '+displayTime(slotTime(day,type));
  const plans=['Ona','Expande','Conecta','Om'];
  const key='eco-onepage-prototype-v1';
  let model={plan:'',reservations:[]}, selected='1', pending='', returnFocus=null;
  try{
    const raw=JSON.parse(localStorage.getItem(key)||'null');
    if(raw&&typeof raw==='object'){
      model.plan=plans.includes(raw.plan)?raw.plan:'';
      model.reservations=Array.isArray(raw.reservations)?raw.reservations.filter(r=>r&&Object.hasOwn(data,r.day)&&Object.hasOwn(classes,r.type)&&typeof r.name==='string'&&r.name.length<=50):[];
    }
  }catch{
  }
  const save=()=>{
    try{
      localStorage.setItem(key,JSON.stringify(model));
      return true
    }catch{
      return false
    }
  };
  const dates=[...document.querySelectorAll('[data-date]')], buttons=[...document.querySelectorAll('[data-class]')];
  const dialog=byId('booking-dialog'), form=byId('reservation-form'), note=byId('booking-message'), name=byId('reservation-name');
  function render(){
    byId('schedule-date').textContent=data[selected];
    Object.keys(classes).forEach(type=>{
      const time=slotTime(selected,type), node=byId('time-'+type);
      node.textContent=displayTime(time);
      node.setAttribute('datetime',time);
    });
    dates.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.date===selected)));
    buttons.forEach(b=>{
      const type=b.dataset.class, has=model.reservations.some(r=>r.day===selected&&r.type===type);
      b.textContent=has?'Ver reserva':'Reservar ↗';
      b.setAttribute('aria-label',(has?'Ver reserva de ':'Reservar ')+classes[type]);
    });
    byId('reservation-count').textContent='('+model.reservations.length+')';
    const list=byId('my-bookings');
    list.replaceChildren();
    if(!model.reservations.length){
      const p=document.createElement('p');
      p.className='nothing';
      p.textContent='Aún no tienes reservas.';
      list.append(p)
    }
    model.reservations.forEach(r=>{
      const row=document.createElement('div');
      row.className='my-entry';
      const label=document.createElement('p');
      label.textContent=sessionTitle(r.type,r.day)+' · '+data[r.day]+' · '+r.name;
      const cancel=document.createElement('button');
      cancel.type='button';
      cancel.className='action';
      cancel.textContent='Quitar';
      cancel.setAttribute('aria-label','Quitar reserva de '+classes[r.type]+' del '+r.day);
      cancel.addEventListener('click',()=>{
        model.reservations=model.reservations.filter(x=>x!==r);
        save();
        render();
        byId('my-panel').querySelector('summary').focus()
      });
      row.append(label,cancel);
      list.append(row);
    });
    byId('plan-feedback').textContent=model.plan?'Plan elegido: '+model.plan+'.':'';
    document.querySelectorAll('[data-plan]').forEach(b=>{
      const active=b.dataset.plan===model.plan;
      b.setAttribute('aria-pressed',String(active));
      b.textContent=active?'Plan elegido ✓':'Elegir plan ↗';
    });
  }
  dates.forEach(b=>b.addEventListener('click',()=>{
    selected=b.dataset.date;
    render()
  }));
  buttons.forEach(b=>b.addEventListener('click',()=>{
    pending=b.dataset.class;
    returnFocus=b;
    const record=model.reservations.find(r=>r.day===selected&&r.type===pending);
    form.reset();
    form.hidden=!!record;
    note.hidden=true;
    note.textContent='';
    byId('dialog-title').textContent=record?'Tu reserva':'Reserva';
    byId('booking-context').textContent=sessionTitle(pending,selected)+' · '+data[selected]+(model.plan?' · Plan '+model.plan:'');
    if(record){
      note.textContent='Guardada a nombre de '+record.name+'.';
      note.hidden=false
    }
    dialog.showModal();
    (record?byId('close-booking'):name).focus();
  }));
  byId('close-booking').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('close',()=>returnFocus?.focus());
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const value=name.value.trim();
    if(!value){
      name.setCustomValidity('Escribe tu primer nombre.');
      name.reportValidity();
      return
    }
    if(!pending||model.reservations.some(r=>r.day===selected&&r.type===pending))return;
    model.reservations.push({day:selected,type:pending,name:value});
    const stored=save();
    form.hidden=true;
    name.value='';
    note.textContent=stored?'Reserva guardada en este navegador.':'Reserva guardada solo para esta sesión.';
    note.hidden=false;
    byId('close-booking').focus();
    render();
  });
  name.addEventListener('input',()=>name.setCustomValidity(''));
  document.querySelectorAll('[data-plan]').forEach(b=>b.addEventListener('click',()=>{
    model.plan=b.dataset.plan;
    save();
    render()
  }));
  render();
})();
