async function loadDashboard(){
 const main=document.querySelector('.main');
 main.innerHTML=`<main class="page-content"><div class="page-head"><div><h1>Dashboard</h1><p class="muted">Real-time parking overview</p></div><button class="primary-btn compact" onclick="loadDashboard()">↻ Refresh</button></div>
 <div class="stats" id="dashStats"><div><b>...</b><span>Total Slots</span></div><div><b>...</b><span>Available Slots</span></div><div><b>...</b><span>Occupied Slots</span></div><div><b>₹ 0</b><span>Today's Revenue</span></div></div>
 <div class="two-col"><section class="panel"><h3>AI Slot Detection (Live)</h3><div id="dashSlots" class="slot-grid"></div></section><section class="panel"><h3>AI Recommendation</h3><div id="dashAI" class="recommendation">Calculating...</div><h3>Recent Vehicles</h3><div id="recentVehicles"></div></section></div></main>`;
 try{
  const r=await fetch(API_BASE+'/parking-slots'); const slots=await r.json();
  const av=slots.filter(s=>String(s.status).toUpperCase()==='AVAILABLE'), oc=slots.length-av.length;
  document.getElementById('dashStats').innerHTML=`<div><b>${slots.length}</b><span>Total Slots</span></div><div><b>${av.length}</b><span>Available Slots</span></div><div><b>${oc}</b><span>Occupied Slots</span></div><div><b>₹ —</b><span>Today's Revenue</span></div>`;
  document.getElementById('dashSlots').innerHTML=slots.map(s=>`<div class="slot ${String(s.status).toLowerCase()}"><strong>${s.slotNumber}</strong><small>${s.vehicleType||''}</small><small>₹${s.pricePerHour}/hr</small></div>`).join('');
  const best=av.sort((a,b)=>a.pricePerHour-b.pricePerHour)[0]; document.getElementById('dashAI').innerHTML=best?`<b>Best slot: ${best.slotNumber}</b><br>₹${best.pricePerHour}/hour • ${best.vehicleType}<br><small>Recommended by current availability and price.</small>`:'No available slot.';
 }catch(e){document.getElementById('dashAI').textContent='Parking API unavailable. Start Spring Boot on port 8081.';}
}
loadDashboard();
