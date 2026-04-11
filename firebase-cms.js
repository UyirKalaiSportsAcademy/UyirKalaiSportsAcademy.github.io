// Uyir Kalai — Firebase CMS Bridge v4 — Full Dynamic Website
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

// ── LIGHTBOX ─────────────────────────────────────────────
function createLightbox(){
  if(document.getElementById('uk-lb')) return;
  const lb=document.createElement('div');
  lb.id='uk-lb';
  lb.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,0.96);z-index:99999;align-items:center;justify-content:center;flex-direction:column;padding:20px;';
  lb.innerHTML=`
    <button onclick="document.getElementById('uk-lb').style.display='none'"
      style="position:absolute;top:16px;right:16px;background:rgba(255,255,255,0.2);border:none;color:#fff;font-size:26px;width:42px;height:42px;border-radius:50%;cursor:pointer;">✕</button>
    <img id="uk-lb-img" style="max-width:100%;max-height:80vh;object-fit:contain;border-radius:10px;box-shadow:0 4px 40px rgba(0,0,0,0.5);"/>
    <div id="uk-lb-cap" style="color:#fff;font-size:14px;margin-top:14px;text-align:center;max-width:500px;line-height:1.6;"></div>
    <div id="uk-lb-actions" style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;justify-content:center;"></div>`;
  document.body.appendChild(lb);
  lb.onclick=e=>{ if(e.target===lb) lb.style.display='none'; };
}

window.openGalleryLightbox=function(src,cap){
  createLightbox();
  const lb=document.getElementById('uk-lb');
  document.getElementById('uk-lb-img').src=src;
  document.getElementById('uk-lb-cap').textContent=cap||'';
  document.getElementById('uk-lb-actions').innerHTML=
    `<a href="${src}" download="UyirKalai_${(cap||'photo').replace(/\s+/g,'_')}.jpg"
      style="padding:10px 22px;background:#006400;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">⬇️ Download</a>`;
  lb.style.display='flex';
};

window.openAchievementLightbox=function(i){
  const a=window._ukAchs?.[i]; if(!a) return;
  createLightbox();
  const lb=document.getElementById('uk-lb');
  document.getElementById('uk-lb-img').src=a.photo||'';
  document.getElementById('uk-lb-cap').innerHTML=
    `<strong style="font-size:16px;color:#fff;">${a.studentName||''}</strong><br/>
     <span style="color:#c9a227;">🏆 ${a.title||''}</span><br/>
     ${a.pos?`<span style="color:#25D366;">🥇 ${a.pos}</span><br/>`:''}
     ${a.game?`<span style="color:#4db8ff;">🥋 ${a.game}</span><br/>`:''}
     ${a.date?`<span style="color:#888;">📅 ${a.date}</span>`:''}`;
  let btns='';
  if(a.photo) btns+=`<a href="${a.photo}" download="Achievement_${(a.studentName||'').replace(/\s+/g,'_')}.jpg" style="padding:10px 18px;background:#006400;color:#fff;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">⬇️ Download</a>`;
  if(a.certPhoto) btns+=`<button onclick="document.getElementById('uk-lb-img').src='${a.certPhoto}';document.getElementById('uk-lb-cap').textContent='Certificate — ${a.studentName||''}'" style="padding:10px 18px;background:#c9a227;color:#000;border:none;border-radius:8px;font-weight:700;cursor:pointer;font-size:13px;">📜 Certificate</button>`;
  if(a.cert) btns+=`<a href="${a.cert}" target="_blank" style="padding:10px 18px;background:#4db8ff;color:#000;border-radius:8px;text-decoration:none;font-weight:700;font-size:13px;">🔗 Cert Link</a>`;
  document.getElementById('uk-lb-actions').innerHTML=btns;
  lb.style.display='flex';
};

// ── MAIN LOAD ──────────────────────────────────────────────
async function loadCMS(){
  try{
    const snap=await getDoc(doc(db,'apps','uyir_kalai'));
    if(!snap.exists()) return;
    const d=snap.data();

    // 1. FOUNDER NAME
    document.querySelectorAll('*').forEach(el=>{
      if(el.children.length===0 && el.textContent.includes('UYIR KALAI THALAIVAN')){
        el.textContent=el.textContent.replace(/UYIR KALAI THALAIVAN/g,'OM PRAKASH');
      }
    });

    // 2. STUDENTS COUNT
    if(d.students){
      try{
        const sts=JSON.parse(d.students);
        const cnt=sts.length;
        document.querySelectorAll('.stat-number,.counter,.hero-count,[data-count="students"]').forEach(el=>{
          if(el.textContent.trim()==='0'||el.textContent.trim()==='500+') el.textContent=cnt+'+';
        });
        // Find the "0 Students" stat in hero
        document.querySelectorAll('.stat,.hero-stat').forEach(el=>{
          if(el.textContent.includes('Students') && el.textContent.includes('0')){
            const num=el.querySelector('.number,.count,.stat-number,strong');
            if(num) num.textContent=cnt+'+';
          }
        });
      }catch(e){}
    }

    // 3. GALLERY — Firebase images FIRST, then static
    const gallery=d.web_gal?JSON.parse(d.web_gal):[];
    if(gallery.length){
      // Find gallery grid
      const galContainer=document.getElementById('gallery-dynamic-grid')
        ||document.querySelector('.gallery-grid')
        ||document.querySelector('.gallery-items')
        ||document.querySelector('[class*="gallery"]');
      if(galContainer){
        // Prepend Firebase photos before static ones
        const firebaseItems=gallery.map((g,i)=>{
          const div=document.createElement('div');
          div.className='gallery-item';
          div.style.cursor='pointer';
          div.onclick=()=>openGalleryLightbox(g.photo,g.tag||'');
          div.innerHTML=`
            <div class="gallery-thumb">
              <img src="${g.photo}" alt="${g.tag||'Gallery'}" loading="lazy" style="width:100%;height:100%;object-fit:cover;"/>
            </div>
            <div class="gallery-overlay"></div>
            <div class="gallery-zoom">🔍</div>
            <div class="gallery-label">${g.tag||''}</div>`;
          return div;
        });
        firebaseItems.reverse().forEach(item=>galContainer.prepend(item));
      }
      // Also make existing static items have lightbox
      document.querySelectorAll('.gallery-item').forEach(item=>{
        if(!item.onclick){
          const img=item.querySelector('img');
          if(img) item.onclick=()=>openGalleryLightbox(img.src,img.alt||'');
        }
      });
    } else {
      // No Firebase gallery but make static items clickable
      document.querySelectorAll('.gallery-item').forEach(item=>{
        const img=item.querySelector('img');
        if(img) item.onclick=()=>openGalleryLightbox(img.src,img.alt||'');
      });
    }

    // 4. STUDENT ACHIEVEMENTS
    const webAch=d.web_ach?JSON.parse(d.web_ach):[];
    window._ukAchs=webAch;
    if(webAch.length){
      const achEl=document.getElementById('cms-achievements')
        ||document.getElementById('student-achievements')
        ||document.querySelector('.achievements-grid')
        ||document.querySelector('[id*="achievement"]');
      if(achEl){
        achEl.innerHTML=webAch.map((a,i)=>`
          <div class="achievement-card" onclick="openAchievementLightbox(${i})"
            style="cursor:pointer;background:rgba(0,26,51,0.8);border:1px solid #0a2a44;border-radius:12px;overflow:hidden;transition:transform .2s;"
            onmouseover="this.style.transform='scale(1.03)'" onmouseout="this.style.transform='scale(1)'">
            ${a.photo?`<img src="${a.photo}" alt="${a.studentName||''}" loading="lazy" style="width:100%;height:180px;object-fit:cover;"/>`
            :`<div style="width:100%;height:180px;background:#001a33;display:flex;align-items:center;justify-content:center;font-size:52px;">🏆</div>`}
            <div style="padding:12px;">
              <div style="font-weight:700;font-size:15px;color:#d0eeff;">${a.studentName||''}</div>
              <div style="font-size:12px;color:#c9a227;margin-top:4px;">${a.title||''}</div>
              ${a.pos?`<div style="font-size:11px;color:#25D366;margin-top:2px;">🥇 ${a.pos}</div>`:''}
              ${a.game?`<div style="font-size:11px;color:#4db8ff;margin-top:2px;">🥋 ${a.game}</div>`:''}
            </div>
          </div>`).join('');
      }
    }

    // 5. MASTER ACHIEVEMENT
    const masterAch=d.master_ach?JSON.parse(d.master_ach):[];
    if(masterAch.length){
      const m=masterAch[0];
      // Update master photo if exists
      if(m.photo){
        const masterImg=document.querySelector('#master img,.master-photo,#master-section img');
        if(masterImg){ masterImg.src=m.photo; masterImg.style.objectFit='cover'; }
      }
      // Update master name
      if(m.title){
        const masterEl=document.getElementById('cms-master-achievement')||document.getElementById('master-achievement');
        if(masterEl){
          masterEl.innerHTML=`
            <div style="padding:16px;background:rgba(201,162,39,0.1);border:1px solid #c9a227;border-radius:12px;display:flex;gap:16px;align-items:center;flex-wrap:wrap;">
              ${m.photo?`<img src="${m.photo}" alt="OM PRAKASH" onclick="openGalleryLightbox('${m.photo}','${m.title}')" style="width:100px;height:100px;object-fit:cover;border-radius:50%;border:3px solid #c9a227;cursor:pointer;"/>`:''}
              <div>
                <div style="font-size:18px;font-weight:700;color:#c9a227;">${m.title}</div>
                <div style="font-size:14px;color:#888;">${m.year||''}</div>
                ${m.certPhoto?`<button onclick="openGalleryLightbox('${m.certPhoto}','Certificate')" style="margin-top:8px;padding:8px 16px;background:#c9a227;color:#000;border:none;border-radius:6px;font-weight:700;cursor:pointer;">📜 Certificate</button>`:''}
              </div>
            </div>`;
        }
      }
    }

    // 6. VIDEOS
    const vids=d.web_vid?JSON.parse(d.web_vid):[];
    if(vids.length){
      const vidEl=document.getElementById('cms-videos')||document.querySelector('.featured-videos-grid');
      if(vidEl){
        vidEl.innerHTML=vids.map(v=>{
          const ytId=v.url?.match(/(?:youtu\.be\/|v=)([^&\s]+)/)?.[1]||'';
          return ytId?`<div style="margin-bottom:20px;"><p style="font-weight:700;margin-bottom:8px;">${v.title||''}</p>
            <iframe width="100%" height="220" src="https://www.youtube.com/embed/${ytId}" frameborder="0" allowfullscreen style="border-radius:10px;"></iframe></div>`:''
        }).join('');
      }
    }

    console.log('✅ CMS v4 loaded — Gallery:'+gallery.length+' Ach:'+webAch.length+' Master:'+masterAch.length);
  }catch(e){ console.log('CMS error:',e.message); }
}

// Load when ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',loadCMS);
}else{
  loadCMS();
}
