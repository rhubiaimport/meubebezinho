const KEY='meuBebeDataV1';
const blank={profile:{},feeds:[],milk:[],poops:[],pees:[],medicines:[],growth:[]};
let data=load();
let installPrompt=null;
function load(){try{return {...structuredClone(blank),...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return structuredClone(blank)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data));renderAll()}
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const pad=n=>String(n).padStart(2,'0');
const dateKey=(d=new Date())=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const time=d=>d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const date=d=>d.toLocaleDateString('pt-BR');
function fromTime(value,day=dateKey()){const [y,m,d]=day.split('-').map(Number),[h,min]=value.split(':').map(Number);return new Date(y,m-1,d,h,min)}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),2200)}
function currentTime(){return `${pad(new Date().getHours())}:${pad(new Date().getMinutes())}`}
function ageText(birth){if(!birth)return 'Adicione os dados do bebê no perfil';const b=new Date(birth+'T00:00:00'),now=new Date();if(b>now)return 'A chegada está sendo preparada ♡';let months=(now.getFullYear()-b.getFullYear())*12+now.getMonth()-b.getMonth();let anchor=new Date(b);anchor.setMonth(anchor.getMonth()+months);if(anchor>now){months--;anchor=new Date(b);anchor.setMonth(anchor.getMonth()+months)}const days=Math.floor((now-anchor)/86400000);const total=Math.floor((now-b)/86400000);return months<1?`${total} ${total===1?'dia':'dias'} de vida`:`${months} ${months===1?'mês':'meses'} e ${days} ${days===1?'dia':'dias'}`}
function futureLabel(ms){const diff=ms-Date.now();if(diff<=0)return 'Horário chegou';const total=Math.ceil(diff/60000),h=Math.floor(total/60),m=total%60;return `Faltam ${h?`${h}h `:''}${m}min`}
function nav(id){$$('.page').forEach(x=>x.classList.toggle('active',x.id===id));$$('.bottom-nav button').forEach(x=>x.classList.toggle('active',x.dataset.go===id));$('#page-title').innerHTML=id==='inicio'?'Meu Bebê <span>♡</span>':({mamadas:'Mamadas',leite:'Tirar leite',coco:'Fraldinhas',remedios:'Remédios',perfil:'Perfil do bebê'}[id]||'Meu Bebê');scrollTo({top:0,behavior:'smooth'});if(id==='perfil')setTimeout(drawChart,50)}
$$('[data-go]').forEach(el=>el.addEventListener('click',()=>nav(el.dataset.go)));

function renderAll(){
 const p=data.profile||{};$('#hero-name').textContent=p.name?`Olá, ${p.name}!`:'Olá, mamãe!';$('#hero-age').textContent=ageText(p.birth);$('#dash-weight').textContent=p.weight?`${p.weight} kg`:'—';$('#dash-height').textContent=p.height?`${p.height} cm`:'—';$('#dash-birth').textContent=p.birth?date(new Date(p.birth+'T00:00:00')):'—';
 const f=data.feeds[0];if(f){const n=new Date(f.next);$('#dash-feed-next').textContent=time(n);$('#dash-feed-count').textContent=futureLabel(n);$('#dash-feed-last').textContent=`Última: ${time(new Date(f.at))}`;$('#feed-next').textContent=`Às ${time(n)}`;$('#feed-countdown').textContent=futureLabel(n)}else{$('#dash-feed-next').textContent='—';$('#dash-feed-count').textContent='Nenhuma registrada';$('#dash-feed-last').textContent='Última: —';$('#feed-next').textContent='—';$('#feed-countdown').textContent='Registre uma mamada'}
 $('#feed-history').innerHTML=data.feeds.length?data.feeds.slice(0,15).map(x=>hist('🍼',date(new Date(x.at)),`${time(new Date(x.at))} · intervalo de ${x.interval}h`,time(new Date(x.next)))).join(''):empty('Nenhuma mamada registrada.');
 const milk=data.milk[0];if(milk){const d=new Date(milk.at);$('#dash-milk').textContent=`${time(d)} · ${milk.amount} ml`;$('#dash-milk-room').textContent=`Ambiente até ${time(new Date(d.getTime()+14400000))}`;$('#milk-result').className='storage-grid';$('#milk-result').innerHTML=storage(d,milk.amount)}else{$('#dash-milk').textContent='—';$('#dash-milk-room').textContent='Ambiente: —';$('#milk-result').className='storage-grid empty-state';$('#milk-result').innerHTML='<p>Nenhuma coleta registrada.</p>'}
 $('#milk-history').innerHTML=data.milk.length?data.milk.slice(0,12).map(x=>hist('🤱',`${date(new Date(x.at))} às ${time(new Date(x.at))}`,`${x.amount} ml`,'')).join(''):empty('Nenhuma coleta registrada.');
 const today=dateKey(),poops=data.poops.filter(x=>x.day===today).length,pees=data.pees.filter(x=>x.day===today).length;['#dash-poop','#poop-today'].forEach(s=>$(s).textContent=poops);['#dash-pee','#pee-today'].forEach(s=>$(s).textContent=pees);renderDiapers();renderMedicine();renderProfile();renderGrowth();
}
function hist(icon,title,sub,right){return `<div class="history-item"><span>${icon}</span><div><strong>${title}</strong><small>${sub}</small></div><span>${right}</span></div>`}
function empty(t){return `<div class="empty">${t}</div>`}
function storage(d,amount){const room=new Date(d.getTime()+4*3600000),fridge=new Date(d);fridge.setDate(fridge.getDate()+4);const freezer=new Date(d);freezer.setMonth(freezer.getMonth()+6);return `<div class="storage-card"><span>🥛</span><strong>Coleta de ${amount} ml · terminou ${time(d)}</strong><small>Conservação calculada a partir do fim da coleta</small></div><div class="storage-card"><span>🌤️</span><strong>Ambiente · 4 horas</strong><small>Válido até hoje às ${time(room)}</small></div><div class="storage-card"><span>❄️</span><strong>Geladeira · 4 dias</strong><small>Até ${date(fridge)} às ${time(fridge)}</small></div><div class="storage-card"><span>🧊</span><strong>Congelador · 6 meses</strong><small>Até ${date(freezer)} às ${time(freezer)}</small></div>`}
function renderDiapers(){const days=[...new Set([...data.poops.map(x=>x.day),...data.pees.map(x=>x.day)])].sort().reverse();$('#diaper-history').innerHTML=days.length?days.slice(0,14).map(day=>{const ps=data.poops.filter(x=>x.day===day),pees=data.pees.filter(x=>x.day===day);return `<div class="card"><div class="section-title" style="margin:0 0 10px"><h3>${date(new Date(day+'T00:00:00'))}</h3><span class="muted">💩 ${ps.length} · 💧 ${pees.length}</span></div>${ps.map(x=>`<div class="history-item"><span class="dot"></span><div><strong>${x.time}</strong><small>${esc(x.note)||'Sem observação'}</small></div></div>`).join('')||'<p class="muted">Nenhum cocô neste dia</p>'}</div>`}).join(''):empty('O histórico de fraldinhas aparecerá aqui.')}
function esc(s=''){const d=document.createElement('div');d.textContent=s;return d.innerHTML}
function renderMedicine(){const m=data.medicines[0];const alert=$('#med-alert');if(m){const n=new Date(m.next),diff=n-Date.now(),soon=diff<=3600000;$('#dash-med').textContent=m.name;$('#dash-med-time').textContent=`Próxima dose às ${time(n)} · ${futureLabel(n)}`;$('#med-next').textContent=`Às ${time(n)}`;$('#med-next-name').textContent=m.name;$('#med-status').textContent=diff<=0?'Agora':soon?'Em breve':'Em dia';$('#med-status').classList.toggle('soon',soon);alert.classList.toggle('hidden',!soon)}else{$('#dash-med').textContent='Nenhum agendado';$('#dash-med-time').textContent='Cadastre uma dose para acompanhar';$('#med-next').textContent='—';$('#med-next-name').textContent='Nenhum remédio cadastrado';alert.classList.add('hidden')}
 $('#med-history').innerHTML=data.medicines.length?data.medicines.slice(0,15).map(x=>hist('💊',esc(x.name),`${date(new Date(x.at))} às ${time(new Date(x.at))} · a cada ${x.interval}h`,`→ ${time(new Date(x.next))}`)).join(''):empty('Nenhuma dose registrada.')}
function renderProfile(){const p=data.profile||{};$('#baby-name').value=p.name||'';$('#baby-birth').value=p.birth||'';$('#baby-weight').value=p.weight||'';$('#baby-height').value=p.height||''}
function weightTrend(item,previous){if(!previous)return '<span class="trend first">● Primeira medição</span>';const grams=Math.round((+item.weight-+previous.weight)*1000);if(grams>0)return `<span class="trend up">✅ Ganhou ${grams} g</span>`;if(grams<0)return `<span class="trend down">⚠️ Perdeu ${Math.abs(grams)} g</span>`;return '<span class="trend stable">➡️ Peso estável · 0 g</span>'}
function renderGrowth(){const ordered=[...data.growth].sort((a,b)=>a.day.localeCompare(b.day));const previous=new Map(ordered.map((x,i)=>[x,ordered[i-1]]));$('#growth-table').innerHTML=ordered.length?[...ordered].reverse().map(x=>`<tr><td>${date(new Date(x.day+'T00:00:00'))}</td><td><strong>${x.weight} kg</strong></td><td>${x.height} cm</td><td>${weightTrend(x,previous.get(x))}</td><td><button data-del-growth="${data.growth.indexOf(x)}" aria-label="Excluir medição">×</button></td></tr>`).join(''):'<tr><td colspan="5" class="empty">Nenhuma medição.</td></tr>';$$('[data-del-growth]').forEach(b=>b.onclick=()=>{data.growth.splice(+b.dataset.delGrowth,1);save()});drawChart()}
function drawLineChart(selector,key,unit,color,margin){const c=$(selector);if(!c||!c.offsetWidth)return;const dpr=devicePixelRatio||1,w=c.offsetWidth,h=190;c.width=w*dpr;c.height=h*dpr;const ctx=c.getContext('2d');ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);const items=[...data.growth].sort((a,b)=>a.day.localeCompare(b.day));ctx.font='10px system-ui';ctx.fillStyle='#8a99aa';if(!items.length){ctx.textAlign='center';ctx.fillText('Adicione medições para visualizar',w/2,h/2);return}const padX=32,padY=28,vals=items.map(x=>+x[key]),min=Math.max(0,Math.min(...vals)-margin),max=Math.max(...vals)+margin;ctx.strokeStyle='#e8eef5';ctx.lineWidth=1;ctx.beginPath();for(let i=0;i<4;i++){const y=padY+i*(h-padY*2)/3;ctx.moveTo(padX,y);ctx.lineTo(w-15,y);ctx.fillStyle='#91a0b0';ctx.textAlign='right';ctx.fillText((max-i*(max-min)/3).toFixed(key==='weight'?1:0),padX-5,y+3)}ctx.stroke();const points=items.map((x,i)=>({x:items.length===1?w/2:padX+i*(w-padX-18)/(items.length-1),y:h-padY-(+x[key]-min)/(max-min)*(h-padY*2)}));ctx.strokeStyle=color;ctx.lineWidth=3;ctx.lineJoin='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke();points.forEach((p,i)=>{ctx.fillStyle='#fff';ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,5,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#65758a';ctx.textAlign='center';ctx.fillText(`${items[i][key]}${unit}`,p.x,p.y-11)})}
function drawChart(){drawLineChart('#weight-chart','weight','kg','#6e9ff7',.5);drawLineChart('#height-chart','height','cm','#f295ab',2)}

$('#feed-form').onsubmit=e=>{e.preventDefault();addFeed($('#feed-time').value)};$('#feed-now').onclick=()=>addFeed(currentTime());function addFeed(t){if(!t)return toast('Escolha um horário');const at=fromTime(t),interval=+$('input[name="feedInterval"]:checked').value;data.feeds.unshift({at:at.toISOString(),next:new Date(at.getTime()+interval*3600000).toISOString(),interval});save();toast('Mamada salva com carinho ♡')}
$('#milk-form').onsubmit=e=>{e.preventDefault();const at=fromTime($('#milk-time').value);data.milk.unshift({at:at.toISOString(),amount:+$('#milk-amount').value});save();e.target.reset();toast('Coleta salva')};
$('#poop-form').onsubmit=e=>{e.preventDefault();data.poops.unshift({day:$('#poop-date').value,time:$('#poop-time').value,note:$('#poop-note').value.trim()});save();$('#poop-note').value='';toast('Cocô registrado')};
$('#pee-now').onclick=()=>{data.pees.unshift({day:dateKey(),at:new Date().toISOString()});save();toast('Xixi registrado 💧')};
$('#med-form').onsubmit=e=>{e.preventDefault();const at=fromTime($('#med-time').value),interval=+$('input[name="medInterval"]:checked').value;data.medicines.unshift({name:$('#med-name').value.trim(),at:at.toISOString(),next:new Date(at.getTime()+interval*3600000).toISOString(),interval});save();toast('Dose salva')};
$('#profile-form').onsubmit=e=>{e.preventDefault();data.profile={name:$('#baby-name').value.trim(),birth:$('#baby-birth').value,weight:$('#baby-weight').value,height:$('#baby-height').value};save();toast('Perfil atualizado')};
$('#growth-form').onsubmit=e=>{e.preventDefault();data.growth.push({day:$('#growth-date').value,weight:+$('#growth-weight').value,height:+$('#growth-height').value});data.profile={...data.profile,weight:$('#growth-weight').value,height:$('#growth-height').value};save();e.target.reset();$('#growth-date').value=dateKey();toast('Medição adicionada')};
$$('[data-clear]').forEach(b=>b.onclick=()=>{const k=b.dataset.clear;if(k==='diapers'){data.poops=[];data.pees=[]}else data[k]=[];save();toast('Histórico limpo')});
$('#feed-time').value=currentTime();$('#milk-time').value=currentTime();$('#poop-date').value=dateKey();$('#poop-time').value=currentTime();$('#med-time').value=currentTime();$('#growth-date').value=dateKey();
const hour=new Date().getHours();$('#greeting').textContent=hour<12?'Bom dia':hour<18?'Boa tarde':'Boa noite';renderAll();setInterval(renderAll,30000);addEventListener('resize',drawChart);

if('serviceWorker' in navigator){
  addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}));
}

addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();
  installPrompt=event;
  const button=$('#install-app');
  if(button)button.classList.remove('hidden');
});

const installButton=$('#install-app');
if(installButton){
  installButton.addEventListener('click',async()=>{
    if(!installPrompt){
      toast('No celular, use “Adicionar à tela inicial”');
      return;
    }
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt=null;
    installButton.classList.add('hidden');
  });
}

addEventListener('appinstalled',()=>{
  const button=$('#install-app');
  if(button)button.classList.add('hidden');
  toast('App instalado ♡');
});
