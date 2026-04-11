// Uyir Kalai — Firebase CMS Bridge v3
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp({
  apiKey:"AIzaSyCRuQXdMhSyYS69uVaH8n3Kd4YACsbTP5A",
  authDomain:"sp-uyirkalai.firebaseapp.com",
  projectId:"sp-uyirkalai",
  storageBucket:"sp-uyirkalai.firebasestorage.app",
  messagingSenderId:"917896500550",
  appId:"1:917896500550:web:99ad36246417ad32554147"
});
const db = getFirestore(app);

// ── LIGHTBOX ─────────────────────────────
function createLightbox(){
  if(document.getElementById('uk-lightbox')) return;
  const lb = document.createElement('div');
  lb.id = 'uk-lightbox';
  lb.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.97);z-index:9999;display:none;align-items:center;justify-content:center;flex-direction:column;padding:16px;';
  lb.innerHTML = `
    <button onclick="closeLightbox()" 
      style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.15);border:none;color:#fff;font-size:28px;width:44px;height:44px;border-radius:50%;cursor:pointer;">✕</button>
    <img id="uk-lb-img" style="max-width:100%;max-height:82vh;object-fit:contain;border-radius:8px;"/>
    <div id="uk-lb-cap" style="color:#fff;font-size:14px;margin-top:12px;text-align:center;opacity:0.85;max-width:600px;"></div>
    <div id="uk-lb-btns" style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;justify-content:center;"></div>`;
  document.body.appendChild(lb);
  lb.onclick = e=>{ if(e.target===lb) closeLightbox(); };
}

window.closeLightbox = ()=>{
  const lb=document.getElementById('uk-lightbox');
  if(lb){ lb.style.display='none'; }
};

window.openGalleryLightbox = function(src, caption){
  createLightbox();
  const lb=document.getElementById('uk-lightbox');
  document.getElementById('uk-lb-img').src=src;
  document.getElementById('uk-lb-cap').textContent=caption||'';
  document.getElementById('uk-lb-btns').innerHTML=
    `<a href="${src}" download="UyirKalai_${(caption||'photo').replace(/\s+/g,'_')}.jpg" 
      style="text-decoration:none;padding:10px 20px;background:#006400;color:#fff;border-radius:8px;font-size:13px;font-weight:700;">⬇️ Download</a>`;
  lb.style.display='flex';
};

window.openAchievementLightbox = function(idx){
  const a=window._ukAchData?.[idx];
  if(!a) return;
  createLightbox();
  const lb=document.getElementById('uk-lightbox');
  document.getElementById('uk-lb-img').src=a.photo||'';
  document.getElementById('uk-lb-cap').innerHTML=
    `<strong style="font-size:16px;">${a.studentName||''}</strong><br/>
     🏆 ${a.title||''}<br/>
     ${a.pos?'🥇 '+a.pos+'<br/>':''}
     ${a.date?'📅 '+a.date+'<br/>':''}
     ${a.game?'🥋 '+a.game:''}`;
  
  let btns = '';
  if(a.photo){
    btns += `<a href="${a.photo}" download="Achievement_${(a.studentName||'').replace(/\s+/g,'_')}.jpg" 
      style="text-decoration:none;padding:10px 20px;background:#006400;color:#fff;border-radius:8px;font-size:13px;font-weight:700;">⬇️ Download</a>`;
  }
  if(a.certPhoto){
    btns += `<button onclick="openCertLightbox(${idx})" 
      style="padding:10px 20px;background:#c9a227;color:#000;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;">📜 Certificate</button>`;
  }
  if(a.cert){
    btns += `<a href="${a.cert}" target="_blank" 
      style="text-decoration:none;padding:10px 20px;background:#4db8ff;color:#000;border-radius:8px;font-size:13px;font-weight:700;">🔗 Cert Link</a>`;
  }
  document.getElementById('uk-lb-btns').innerHTML=btns;
  lb.style.display='flex';
};

window.openCertLightbox = function(idx){
  const a=window._ukAchData?.[idx];
  if(!a?.certPhoto) return;
  document.getElementById('uk-lb-img').src=a.certPhoto;
  document.getElementById('uk-lb-cap').textContent='Certificate — '+(a.studentName||'');
};

// ── LOAD CMS DATA ─────────────────────────
async function loadCMSData(){
  try{
    const snap = await getDoc(doc(db,'apps','uyir_kalai'));
    if(!snap.exists()) return;
    const d = snap.data();

    // 1. Gallery
    const gallery = d.web_gal ? JSON.parse(d.web_gal) : [];
    if(gallery.length){
      const galGrid = document.getElementById('gallery-dynamic-grid')
        || document.querySelector('.gallery-grid')
        || document.querySelector('.gallery-items');
      if(galGrid){
        galGrid.innerHTML = gallery.map(g=>`
          <div class="gallery-item" onclick="openGalleryLightbox('${g.photo.replace(/'/g,"\\'")}','${(g.tag||'').replace(/'/g,"\\'")}')">
            <div class="gallery-thumb">
              <img src="${g.photo}" alt="${g.tag||''}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div class="gallery-overlay"></div>
            <div class="gallery-zoom">🔍</div>
            <div class="gallery-label">${g.tag||''}</div>
          </div>`).join('');
      }
    }

    // 2. Student Achievements
    const webAch = d.web_ach ? JSON.parse(d.web_ach) : [];
    window._ukAchData = webAch;
    if(webAch.length){
      const achEl = document.getElementById('cms-achievements')
        || document.getElementById('student-achievements')
        || document.querySelector('.achievements-grid');
      if(achEl){
        achEl.innerHTML = webAch.map((a,i)=>`
          <div class="achievement-card" onclick="openAchievementLightbox(${i})" style="cursor:pointer;">
            ${a.photo?`<img src="${a.photo}" alt="${a.studentName||''}" loading="lazy" style="width:100%;height:160px;object-fit:cover;border-radius:8px;"/>`:
            `<div style="width:100%;height:160px;background:#001a33;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:48px;">🏆</div>`}
            <div style="padding:10px 0;">
              <div style="font-weight:700;font-size:14px;">${a.studentName||''}</div>
              <div style="font-size:12px;color:#c9a227;margin-top:2px;">${a.title||''}</div>
              ${a.pos?`<div style="font-size:11px;color:#25D366;">🥇 ${a.pos}</div>`:''}
            </div>
          </div>`).join('');
      }
    }

    // 3. Master Achievement
    const masterAch = d.master_ach ? JSON.parse(d.master_ach) : [];
    if(masterAch.length){
      const masterEl = document.getElementById('cms-master-achievement')
        || document.getElementById('master-achievements');
      if(masterEl){
        const m = masterAch[0];
        masterEl.innerHTML = `
          <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
            ${m.photo?`<img src="${m.photo}" alt="Master" style="width:120px;height:120px;object-fit:cover;border-radius:50%;border:3px solid #c9a227;" onclick="openGalleryLightbox('${m.photo}','${m.title||''}')"/>`:''}
            <div style="flex:1;">
              <div style="font-size:18px;font-weight:700;color:#c9a227;">${m.title||''}</div>
              <div style="font-size:14px;color:#888;">${m.year||''}</div>
              ${m.certPhoto?`<button onclick="openGalleryLightbox('${m.certPhoto}','Certificate')" style="margin-top:8px;padding:8px 16px;background:#c9a227;color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">📜 View Certificate</button>`:''}
              ${m.link?`<a href="${m.link}" target="_blank" style="display:inline-block;margin-top:8px;padding:8px 16px;background:#4db8ff;color:#000;border-radius:6px;font-weight:700;text-decoration:none;">🔗 Certificate Link</a>`:''}
            </div>
          </div>`;
      }
    }

    // 4. Videos
    const videos = d.web_vid ? JSON.parse(d.web_vid) : [];
    if(videos.length){
      const vidEl = document.getElementById('cms-videos')
        || document.querySelector('.videos-section');
      if(vidEl){
        vidEl.innerHTML = videos.map(v=>{
          const ytId = v.url?.match(/(?:youtu\.be\/|v=)([^&\s]+)/)?.[1]||'';
          return ytId?`
            <div style="margin-bottom:16px;">
              <div style="font-size:14px;font-weight:700;margin-bottom:6px;">${v.title||''}</div>
              <iframe width="100%" height="200" src="https://www.youtube.com/embed/${ytId}" 
                frameborder="0" allowfullscreen style="border-radius:8px;"></iframe>
            </div>`:''}).join('');
      }
    }

    // 5. Students count
    if(d.students){
      try{
        const sts=JSON.parse(d.students);
        document.querySelectorAll('[data-count="students"],.hero-student-count').forEach(el=>{
          el.textContent=sts.length;
        });
      }catch(e){}
    }

    console.log('✅ CMS loaded — Gallery:'+gallery.length+' Ach:'+webAch.length+' Master:'+masterAch.length);
  }catch(e){ console.log('CMS error:',e.message); }
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', loadCMSData);
}else{
  loadCMSData();
}
