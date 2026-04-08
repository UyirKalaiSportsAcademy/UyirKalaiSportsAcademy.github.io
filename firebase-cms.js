// Uyir Kalai — Firebase CMS Bridge
// Gallery photos from Admin App → Website

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

async function loadCMSData(){
  try{
    const snap = await getDoc(doc(db,'apps','uyir_kalai'));
    if(!snap.exists()) return;
    const d = snap.data();

    // 1. Gallery photos
    const gallery = d.web_gal ? JSON.parse(d.web_gal) : [];
    if(gallery.length){
      const galEl = document.getElementById('cms-gallery');
      if(galEl){
        galEl.innerHTML = gallery.map(g=>`
          <div class="gallery-item" onclick="openLightbox(this)">
            <img src="${g.photo}" alt="${g.tag}" loading="lazy"/>
            <div class="gallery-label">${g.tag}</div>
            <div class="gallery-zoom">🔍</div>
          </div>`).join('');
      }
      // Also update static gallery section if exists
      const galGrid = document.querySelector('.gallery-grid');
      if(galGrid){
        galGrid.innerHTML = gallery.map(g=>`
          <div class="gallery-item" onclick="openLightbox(this)">
            <img src="${g.photo}" alt="${g.tag}" loading="lazy"/>
            <div class="gallery-label">${g.tag}</div>
            <div class="gallery-zoom">🔍</div>
          </div>`).join('');
      }
    }

    // 2. Settings — student count, academy name
    if(d.settings){
      const s = JSON.parse(d.settings);
      const countEl = document.getElementById('student-count');
      if(countEl && d.students){
        const students = JSON.parse(d.students);
        countEl.textContent = students.length || '500+';
      }
    }

    // 3. Students count for hero
    if(d.students){
      const students = JSON.parse(d.students);
      document.querySelectorAll('.hero-student-count').forEach(el=>{
        el.textContent = students.length + '+';
      });
    }

    // 4. Posts/Feed — latest 3 show on website
    if(d.posts){
      const posts = JSON.parse(d.posts);
      const newsEl = document.getElementById('cms-news');
      if(newsEl && posts.length){
        newsEl.innerHTML = posts.slice(0,3).map(p=>`
          <div style="padding:10px;border-left:3px solid #c9a227;margin-bottom:10px;">
            <div style="font-size:12px;color:#c9a227;font-weight:700;">${p.type||'NEWS'} · ${p.date||''}</div>
            <div style="font-size:14px;color:#d0eeff;margin-top:4px;">${p.text||''}</div>
          </div>`).join('');
      }
    }

    console.log('✅ CMS data loaded from Firebase');
  }catch(e){
    console.log('CMS load error:', e.message);
  }
}

// Auto load when page ready
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded', loadCMSData);
} else {
  loadCMSData();
}
