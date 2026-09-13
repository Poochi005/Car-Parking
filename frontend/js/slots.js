async function loadSlots(){try{
 const r=await fetch(API_BASE+'/parking-slots');if(!r.ok)throw new Error();
 const slots=await r.json();const av=slots.filter(s=>String(s.status).toUpperCase()==='AVAILABLE').length;
 totalSlots.textContent=slots.length;availableSlots.textContent=av;occupiedSlots.textContent=slots.length-av;
 slotGrid.innerHTML=slots.map(s=>`<div class="slot ${String(s.status).toLowerCase()}"><strong>${s.slotNumber}</strong><small>${s.floor} • ${s.section}</small><small>${s.vehicleType} • ${s.slotSize}</small><small>₹${s.pricePerHour}/hour</small><span class="badge">${s.status}</span></div>`).join('');
}catch(e){slotGrid.innerHTML='<div class="empty">Unable to load parking slots. Check Spring Boot API.</div>';}}
loadSlots();
