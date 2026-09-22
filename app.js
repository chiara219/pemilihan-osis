(() => {
"use strict";
const C = window.APP_CONFIG;
let state=null;
let s={view:"vote",step:"identitas",nama:"",kelas:"",selected:null,pin:"",tab:"kandidat",voters:[],search:"",modal:null,busy:false};
let installPrompt=null;

function esc(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function fmt(ts){if(!ts)return "-";try{return new Date(Number(ts)).toLocaleString("id-ID",{dateStyle:"full",timeStyle:"short"});}catch(e){return String(ts)}}
function toast(m,err=false){const d=document.createElement("div");d.className="toast"+(err?" err":"");d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
function api(action,params={}){
  return new Promise((resolve,reject)=>{
    const cb="osisCb_"+Date.now()+"_"+Math.random().toString(36).slice(2);
    const sc=document.createElement("script");
    const q=new URLSearchParams({action,callback:cb});
    Object.keys(params).forEach(k=>q.set(k,params[k]??""));
    let done=false;
    window[cb]=(data)=>{done=true;cleanup();resolve(data)};
    function cleanup(){delete window[cb];sc.remove()}
    sc.onerror=()=>{cleanup();reject(new Error("Gagal menghubungi server"))};
    sc.src=C.API_URL+"?"+q.toString();
    document.body.appendChild(sc);
    setTimeout(()=>{if(!done){cleanup();reject(new Error("Server tidak merespons"))}},20000);
  });
}
async function refresh(silent=false){try{state=await api("getState"); if(!silent) render();}catch(e){if(!state){renderError(e.message)}else toast(e.message,true)}}
function header(){return `<div class="topbar"><div class="brand"><img class="brand-logo" src="icons/icon-192.png"><div><p class="brand-kicker">${esc(C.SCHOOL)}</p><p class="brand-title">Pemilihan Ketua & Wakil Ketua OSIS</p></div></div><button class="gear" data-a="${s.view==="admin"?"exit":"admin"}">${s.view==="admin"?"←":"⚙"}</button></div>`}
function render(){
 let h=header();
 if(s.view==="adminLogin")h+=login();
 else if(s.view==="admin")h+=admin();
 else h+=vote();
 h+=modal();
 document.getElementById("app").innerHTML=h;
}
function renderError(m){document.getElementById("app").innerHTML=header()+`<main class="container"><section class="sheet"><p class="eyebrow">Koneksi</p><h1 class="headline">Aplikasi belum dapat terhubung</h1><p class="sub">${esc(m)}<br><br>Pastikan Apps Script sudah di-deploy sebagai Web App dan aksesnya dapat digunakan oleh pengguna aplikasi.</p><button class="btn btn-dark" data-a="retry">Coba Lagi</button></section></main>`}
function vote(){
 if(!state)return `<main class="container"><section class="sheet"><p class="sub">Memuat data pemilihan…</p></section></main>`;
 if(state.status==="setup")return `<main class="container"><section class="sheet"><p class="eyebrow">PEMILIHAN UMUM OSIS</p><h1 class="headline">Pemilihan belum dimulai</h1><p class="sub">Panitia sedang menyiapkan daftar calon.</p><button class="btn btn-ghost" data-a="admin">Masuk sebagai panitia</button></section></main>`;
 if(state.status==="closed")return winner(false);
 if(s.step==="identitas")return `<main class="container"><section class="sheet"><span class="status"><span class="dot"></span>Pemilihan sedang berlangsung</span><p class="eyebrow">LANGKAH 1 DARI 2</p><h1 class="headline">Selamat datang di bilik suara</h1><p class="sub">Masukkan nama dan kelas dengan benar. Setiap pemilih hanya dapat memberikan satu suara.</p><label>Nama lengkap</label><input id="nama" value="${esc(s.nama)}" placeholder="Contoh: Siti Aminah" autocomplete="off"><label>Kelas</label><input id="kelas" value="${esc(s.kelas)}" placeholder="Contoh: IX A" autocomplete="off"><div style="height:18px"></div><button class="btn btn-primary" data-a="go" ${s.busy?"disabled":""}>${s.busy?"Memeriksa…":"Lanjut ke Bilik Suara"}</button></section></main>`;
 if(s.step==="sudah")return `<main class="container"><section class="sheet"><div style="text-align:center;padding:25px 0"><div class="seal" style="margin-bottom:20px">✓</div><h1 class="headline">Kamu sudah pernah memilih</h1><p class="sub">Nama dan kelas ini sudah tercatat memberikan suara sebelumnya.</p><button class="btn btn-dark" data-a="back">Kembali</button></div></section></main>`;
 if(s.step==="thanks")return `<main class="container"><section class="sheet"><div style="text-align:center;padding:35px 0"><div class="seal">✓</div><h1 class="headline" style="margin-top:18px">Terima kasih sudah memilih!</h1><p class="sub">Suaramu sudah tersimpan. Silakan serahkan perangkat kepada pemilih berikutnya.</p></div></section></main>`;
 const rows=state.candidates.map(c=>`<div class="cand ${s.selected===c.id?"selected":""}" data-a="select" data-id="${esc(c.id)}"><div class="no">${esc(c.no)}</div><div class="candinfo"><p class="names">${esc(c.ketua)}${c.wakil?" & "+esc(c.wakil):""}</p><p class="visi">${esc(c.visi||"")}</p></div><div class="check"></div></div>`).join("");
 return `<main class="container"><section class="sheet"><span class="status"><span class="dot"></span>Pemilihan sedang berlangsung</span><p class="eyebrow">LANGKAH 2 DARI 2 · ${esc(s.nama)} · ${esc(s.kelas)}</p><h1 class="headline">Pilih pasangan calon</h1><p class="sub">Pilih salah satu pasangan calon, lalu kunci pilihanmu.</p>${rows}<div style="height:8px"></div><button class="btn btn-primary" data-a="confirm" ${!s.selected||s.busy?"disabled":""}>Coblos Pilihan Ini</button><div style="height:8px"></div><button class="btn btn-ghost" data-a="back">Kembali</button></section></main>`;
}
function login(){return `<main class="container"><section class="sheet"><p class="eyebrow">AKSES TERBATAS</p><h1 class="headline">Panel Panitia</h1><p class="sub">Masukkan PIN panitia.</p><label>PIN</label><input id="pin" type="password" inputmode="numeric" placeholder="PIN panitia"><div style="height:18px"></div><button class="btn btn-dark" data-a="login">Masuk</button><div style="height:8px"></div><button class="btn btn-ghost" data-a="exit">Kembali ke bilik suara</button></section></main>`}
function admin(){
 const tabs=[["kandidat","Calon"],["rekap","Rekap Suara"],["pengaturan","Pengaturan"]];
 return `<main class="admin-wrap"><div class="tabs">${tabs.map(t=>`<button class="tab ${s.tab===t[0]?"active":""}" data-a="tab" data-tab="${t[0]}">${t[1]}</button>`).join("")}</div>${s.tab==="kandidat"?tabCandidates():s.tab==="rekap"?tabRecap():tabSettings()}</main>`;
}
function badge(){return state.status==="setup"?'<span class="status" style="background:#ad8a3428;color:#8a6b18">● Belum dibuka</span>':state.status==="open"?'<span class="status"><span class="dot"></span>Sedang berlangsung</span>':'<span class="status" style="background:#b4262c18;color:#b4262c">● Sudah ditutup</span>'}
function tabCandidates(){
 const locked=state.status!=="setup";
 const list=state.candidates.map(c=>`<div class="list"><div class="chip">${esc(c.no)}</div><div class="info"><strong>${esc(c.ketua)}${c.wakil?" & "+esc(c.wakil):""}</strong><div class="mini">${esc(c.visi||"Tanpa visi singkat")}</div></div>${locked?"":`<button class="iconbtn" data-a="delcand" data-id="${esc(c.id)}">🗑️</button>`}</div>`).join("");
 return `<section class="panel">${badge()}<h2>Calon Ketua & Wakil Ketua OSIS</h2><p class="sub">Minimal 2 pasangan calon diperlukan sebelum pemilihan dibuka.</p>${list||'<p class="mini">Belum ada calon.</p>'}${locked?"":`<div class="divider"></div><h3>Tambah Pasangan Calon</h3><label>Nomor urut</label><input id="cNo" placeholder="${state.candidates.length+1}"><label>Nama calon ketua</label><input id="cKetua"><label>Nama calon wakil</label><input id="cWakil"><label>Visi / moto singkat</label><textarea id="cVisi"></textarea><div style="height:12px"></div><button class="btn btn-dark" data-a="addcand">Tambah Calon</button>`}${state.status==="setup"?`<div class="divider"></div><button class="btn btn-primary" data-a="openElection" ${state.candidates.length<2?"disabled":""}>Buka Pemilihan</button>`:""}</section>`;
}
function tabRecap(){
 const tv=state.totalVoters||0; let max=0;state.candidates.forEach(c=>max=Math.max(max,state.votes[c.id]||0));
 const bars=state.candidates.slice().sort((a,b)=>(state.votes[b.id]||0)-(state.votes[a.id]||0)).map(c=>{let v=state.votes[c.id]||0,p=tv?Math.round(v/tv*1000)/10:0,w=max?Math.round(v/max*100):0;return `<div class="bar"><div class="bartop"><span>No. ${esc(c.no)} · ${esc(c.ketua)}${c.wakil?" & "+esc(c.wakil):""}</span><span>${v}</span></div><div class="track"><div class="fill" style="width:${w}%"></div></div><div class="pct">${p}% dari total suara</div></div>`}).join("");
 const q=s.search.toLowerCase();const vv=s.voters.filter(v=>!q||String(v.nama).toLowerCase().includes(q)||String(v.kelas).toLowerCase().includes(q)).slice().reverse();
 const trs=vv.map(v=>`<tr><td>${esc(v.nama)}</td><td>${esc(v.kelas)}</td><td>No. ${esc(v.no)}</td><td>${fmt(v.ts)}</td><td><button class="iconbtn" data-a="delvoter" data-key="${esc(v.key)}">🗑️</button></td></tr>`).join("");
 return `<section class="panel">${badge()}<h2>Rekap Suara</h2><p class="sub">Data diperbarui dari server.</p><div class="statgrid"><div class="stat"><b>${tv}</b><span>Total suara masuk</span></div><div class="stat"><b>${state.candidates.length}</b><span>Pasangan calon</span></div></div>${bars}<div class="divider"></div><div class="row"><input id="search" value="${esc(s.search)}" placeholder="Cari nama atau kelas"><button class="btn btn-ghost" data-a="loadVoters">Muat ulang</button></div><div style="height:10px"></div><button class="btn btn-ghost" data-a="export">Export JSON</button><div style="height:10px"></div><div class="tablewrap"><table class="voters"><thead><tr><th>Nama</th><th>Kelas</th><th>Pilihan</th><th>Waktu</th><th></th></tr></thead><tbody>${trs||'<tr><td colspan="5">Belum ada data. Klik Muat ulang.</td></tr>'}</tbody></table></div></section>`;
}
function tabSettings(){
 return `<section class="panel">${badge()}<h2>Pengaturan Pemilihan</h2><label>Periode kepengurusan</label><input id="periode" value="${esc(state.periode)}"><div style="height:10px"></div><button class="btn btn-ghost" data-a="periode">Simpan Periode</button><div class="divider"></div><h3>Ubah PIN Panitia</h3><label>PIN baru</label><input id="newpin" type="password" inputmode="numeric" placeholder="Minimal 4 digit"><div style="height:10px"></div><button class="btn btn-ghost" data-a="pinchange">Simpan PIN Baru</button>${state.status==="open"?'<div class="divider"></div><button class="btn btn-danger" style="width:100%" data-a="closeElection">Tutup Pemilihan & Tetapkan Pemenang</button>':""}${state.status==="closed"?'<div class="divider"></div>'+winner(true)+'<div style="height:12px"></div><button class="btn btn-ghost" data-a="reopen">Buka Kembali Pemilihan</button>':""}<div class="divider"></div><p class="sub">Reset menghapus kandidat dan seluruh suara secara permanen.</p><button class="btn btn-ghost" style="border-color:var(--red);color:var(--red);width:100%" data-a="reset">Reset Semua Data</button><div class="divider"></div><button class="btn btn-ghost" data-a="exit">Keluar dari Panel Panitia</button></section>`;
}
function winner(preview){
 const w=state?.candidates?.find(c=>c.id===state.winnerId);if(!w)return `<main class="container"><section class="sheet"><h1 class="headline">Pemilihan ditutup</h1><p class="sub">Pemenang belum ditetapkan.</p></section></main>`;
 const tv=state.totalVoters||0,v=state.votes[w.id]||0,p=tv?Math.round(v/tv*1000)/10:0;
 const inner=`<section class="cert"><div class="seal">SAH</div><p class="eyebrow">KETUA & WAKIL KETUA OSIS TERPILIH · PERIODE ${esc(state.periode)}</p><h1>${esc(w.ketua)}${w.wakil?" & "+esc(w.wakil):""}</h1><p class="sub">Nomor Urut ${esc(w.no)}${w.visi?" · "+esc(w.visi):""}</p><div class="certstats"><div class="certstat"><b>${v}</b><span>Suara diperoleh</span></div><div class="certstat"><b>${p}%</b><span>Persentase</span></div><div class="certstat"><b>${tv}</b><span>Total suara</span></div></div><p class="mini">Ditetapkan pada ${fmt(state.closedAt)}</p>${preview?"":"<div style='height:16px'></div><button class='btn btn-dark' data-a='print'>Cetak Sertifikat</button>"}</section>`;
 return preview?inner:`<main class="container">${inner}</main>`;
}
function modal(){
 if(!s.modal)return "";
 let body="",title="";
 if(s.modal==="confirm"){let c=state.candidates.find(x=>x.id===s.selected);title="Konfirmasi pilihan";body=`Kamu memilih pasangan nomor ${c.no}: <strong>${esc(c.ketua)}${c.wakil?" & "+esc(c.wakil):""}</strong>. Pilihan tidak dapat diubah setelah dikonfirmasi.`}
 if(s.modal==="close"){
   title="Tutup pemilihan?";
   const sorted=state.candidates.slice().sort((a,b)=>(state.votes[b.id]||0)-(state.votes[a.id]||0));
   const top=sorted.length?(state.votes[sorted[0].id]||0):0;
   const tied=sorted.filter(c=>(state.votes[c.id]||0)===top);
   if(tied.length>1 && top>0){
     body="Terdapat "+tied.length+" pasangan dengan suara tertinggi yang sama ("+top+" suara). Panitia harus menentukan pemenang:<div style='margin-top:12px;text-align:left'>"+tied.map(c=>`<label style="display:flex;align-items:center;gap:8px;margin:8px 0"><input type="radio" name="tieWinner" value="${esc(c.id)}"> No. ${esc(c.no)} · ${esc(c.ketua)}${c.wakil?" & "+esc(c.wakil):""}</label>`).join("")+"</div>";
   } else {
     body="Setelah ditutup, pemilih tidak dapat memilih lagi. Pemenang akan ditetapkan berdasarkan suara terbanyak.";
   }
 }
 if(s.modal==="reset"){title="Reset semua data?";body="Semua kandidat, suara, dan data pemilih akan dihapus permanen."}
 if(s.modal==="reopen"){title="Buka kembali pemilihan?";body="Status akan dikembalikan menjadi terbuka."}
 if(s.modal==="delcand"){title="Hapus kandidat?";body="Kandidat ini akan dihapus dari daftar."}
 if(s.modal==="delvoter"){title="Hapus data pemilih?";body="Gunakan hanya untuk memperbaiki kesalahan input. Suara akan ikut berkurang."}
 return `<div class="modal"><div class="modal-card"><h3>${title}</h3><p>${body}</p><div class="actions"><button class="btn btn-ghost" data-a="cancel">Batal</button><button class="btn ${["reset","close","reopen","delcand","delvoter"].includes(s.modal)?"btn-danger":"btn-primary"}" data-a="modalok">Ya, lanjut</button></div></div></div>`;
}
async function doModal(){
 const m=s.modal;s.modal=null;render();
 try{
  if(m==="confirm"){let r=await api("submitVote",{nama:s.nama,kelas:s.kelas,candidateId:s.selected});if(!r.ok){if(r.error==="ALREADY_VOTED"){s.step="sudah";render();return}throw Error(r.error||"Gagal menyimpan suara")}s.step="thanks";s.selected=null;render();setTimeout(()=>{s.step="identitas";s.nama="";s.kelas="";render()},4200);refresh(true);return}
  if(m==="close"){
    const checked=document.querySelector('input[name="tieWinner"]:checked');
    const sorted=state.candidates.slice().sort((a,b)=>(state.votes[b.id]||0)-(state.votes[a.id]||0));
    const top=sorted.length?(state.votes[sorted[0].id]||0):0;
    const tied=sorted.filter(c=>(state.votes[c.id]||0)===top);
    if(tied.length>1 && top>0 && !checked){s.modal="close";render();toast("Pilih salah satu pemenang terlebih dahulu.",true);return}
    const winnerId=checked?checked.value:"";
    let r=await api("adminCloseElection",{pin:s.pin,winnerId});if(!r.ok)throw Error(r.error);toast("Pemilihan ditutup.");await refresh();return
  }
  if(m==="reset"){let r=await api("adminResetAll",{pin:s.pin});if(!r.ok)throw Error(r.error);s.view="vote";s.pin="";s.step="identitas";await refresh();toast("Semua data direset.");return}
  if(m==="reopen"){let r=await api("adminReopenElection",{pin:s.pin});if(!r.ok)throw Error(r.error);await refresh();toast("Pemilihan dibuka kembali.");return}
  if(m==="delcand"){let r=await api("adminDeleteCandidate",{pin:s.pin,id:s.delid});if(!r.ok)throw Error(r.error);await refresh();toast("Kandidat dihapus.");return}
  if(m==="delvoter"){let r=await api("adminDeleteVoterRow",{pin:s.pin,key:s.delkey});if(!r.ok)throw Error(r.error);await refresh();await loadVoters();toast("Data dihapus.");return}
 }catch(e){toast(e.message,true)}
}
async function loadVoters(){let r=await api("adminGetVoters",{pin:s.pin});if(r.ok){s.voters=r.voters;render()}else toast(r.error,true)}
document.addEventListener("click",async e=>{
 const el=e.target.closest("[data-a]");if(!el)return;const a=el.dataset.a;
 try{
  if(a==="admin"){s.view="adminLogin";render()}
  else if(a==="exit"){s.view="vote";s.pin="";render()}
  else if(a==="retry"){refresh()}
  else if(a==="go"){const n=document.getElementById("nama")?.value.trim(),k=document.getElementById("kelas")?.value.trim();if(!n||!k)return toast("Isi nama dan kelas terlebih dahulu.",true);s.nama=n;s.kelas=k;s.busy=true;render();let r=await api("checkVoted",{nama:n,kelas:k});s.busy=false;s.step=r.alreadyVoted?"sudah":"ballot";render()}
  else if(a==="back"){s.step="identitas";s.selected=null;render()}
  else if(a==="select"){s.selected=el.dataset.id;render()}
  else if(a==="confirm"){s.modal="confirm";render()}
  else if(a==="login"){let p=document.getElementById("pin").value;s.pin=p;let r=await api("adminLogin",{pin:p});if(r.ok){s.view="admin";s.tab="kandidat";render()}else toast("PIN salah.",true)}
  else if(a==="tab"){s.tab=el.dataset.tab;render();if(s.tab==="rekap")loadVoters()}
  else if(a==="addcand"){let r=await api("adminAddCandidate",{pin:s.pin,no:document.getElementById("cNo").value,ketua:document.getElementById("cKetua").value,wakil:document.getElementById("cWakil").value,visi:document.getElementById("cVisi").value});if(r.ok){await refresh();toast("Calon ditambahkan.")}else toast(r.error,true)}
  else if(a==="delcand"){s.delid=el.dataset.id;s.modal="delcand";render()}
  else if(a==="openElection"){let r=await api("adminOpenElection",{pin:s.pin});if(r.ok){await refresh();toast("Pemilihan dibuka.")}else toast(r.error,true)}
  else if(a==="loadVoters")loadVoters()
  else if(a==="export"){let r=await api("adminExport",{pin:s.pin});if(!r.ok)return toast(r.error,true);let blob=new Blob([JSON.stringify(r,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="rekap-osis-"+Date.now()+".json";a.click();URL.revokeObjectURL(u)}
  else if(a==="delvoter"){s.delkey=el.dataset.key;s.modal="delvoter";render()}
  else if(a==="periode"){let r=await api("adminSavePeriode",{pin:s.pin,periode:document.getElementById("periode").value});if(r.ok){await refresh();toast("Periode disimpan.")}else toast(r.error,true)}
  else if(a==="pinchange"){let p=document.getElementById("newpin").value;if(p.length<4)return toast("PIN minimal 4 digit.",true);let r=await api("adminChangePin",{oldPin:s.pin,newPin:p});if(r.ok){s.pin=p;toast("PIN berhasil diubah.")}else toast(r.error,true)}
  else if(a==="closeElection"){s.modal="close";render()}
  else if(a==="reopen"){s.modal="reopen";render()}
  else if(a==="reset"){s.modal="reset";render()}
  else if(a==="cancel"){s.modal=null;render()}
  else if(a==="modalok")doModal()
  else if(a==="print")window.print()
 }catch(err){toast(err.message||"Terjadi kesalahan",true)}
});
document.addEventListener("input",e=>{if(e.target.id==="search"){s.search=e.target.value;render();const x=document.getElementById("search");if(x){x.focus();x.setSelectionRange(x.value.length,x.value.length)}}});
document.addEventListener("keydown",e=>{if(e.key==="Enter"){if(e.target.id==="nama"||e.target.id==="kelas")document.querySelector('[data-a="go"]')?.click();if(e.target.id==="pin")document.querySelector('[data-a="login"]')?.click()}});
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installPrompt=e;document.getElementById("installBox").hidden=false});
document.getElementById("installBtn").onclick=async()=>{if(!installPrompt)return;installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;document.getElementById("installBox").hidden=true};
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
refresh();
setInterval(()=>refresh(true),5000);
})();