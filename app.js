const clockEl = document.getElementById("clock");
const dateEl  = document.getElementById("date");
const timerEl = document.getElementById("timer");

const resetBtn = document.getElementById("resetTimer");
const motionBtn = document.getElementById("toggleMotion");

const qInput = document.getElementById("q");
const goGoogle = document.getElementById("goGoogle");
const goYouTube = document.getElementById("goYouTube");

// Admin & Suggestions
const searchSuggestions = document.getElementById("searchSuggestions");
const adminOverlay = document.getElementById("adminOverlay");
const adminPanel = document.getElementById("adminPanel");
const adminLogin = document.getElementById("adminLogin");
const adminDashboard = document.getElementById("adminDashboard");
const adminUser = document.getElementById("adminUser");
const adminPass = document.getElementById("adminPass");
const adminSubmit = document.getElementById("adminSubmit");
const adminClose = document.getElementById("adminClose");
const adminSave = document.getElementById("adminSave");
const adminLogout = document.getElementById("adminLogout");

let reduceMotion = false;

// ============================
// ADMIN CREDENTIALS (CAMBIAR AQUÍ)
// ============================
const ADMIN_USER = "admin";
const ADMIN_PASS = "gaming123";

// ============================
// 1) Clock
// ============================
function pad(n){ return String(n).padStart(2, "0"); }

function updateClock(){
  const now = new Date();
  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());

  clockEl.textContent = `${h}:${m}:${s}`;

  const opts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  dateEl.textContent = now.toLocaleDateString("es-CO", opts);
}

setInterval(updateClock, 1000);
updateClock();


// ============================
// 2) Session timer
// ============================
const KEY = "sessionStartTime";
let startTime = sessionStorage.getItem(KEY);

if(!startTime){
  startTime = Date.now();
  sessionStorage.setItem(KEY, startTime);
}else{
  startTime = Number(startTime);
}

function formatTime(ms){
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function updateTimer(){
  const now = Date.now();
  const diff = now - startTime;
  timerEl.textContent = formatTime(diff);
}

setInterval(updateTimer, 1000);
updateTimer();

resetBtn.addEventListener("click", () => {
  startTime = Date.now();
  sessionStorage.setItem(KEY, startTime);
  updateTimer();
});


// ============================
// 3) Reduce motion
// ============================
motionBtn.addEventListener("click", () => {
  reduceMotion = !reduceMotion;

  const layers = document.querySelectorAll(".img-layer");
  layers.forEach(layer => {
    layer.style.animationPlayState = reduceMotion ? "paused" : "running";
  });

  document.querySelector(".card").style.animation =
    reduceMotion ? "none" : "floatIn 900ms ease forwards";

  motionBtn.textContent = reduceMotion ? "Enable Motion" : "Reduce Motion";
});


// ============================
// 4) Las imágenes ya tienen su propia animación CSS
// ============================
// (Ya no necesitamos el pulse manual)


// ============================
// 5) Search & Suggestions
// ============================
function cleanQuery(q){
  return encodeURIComponent(q.trim());
}

function go(type){
  const q = qInput.value.trim();
  if(!q) return;

  if(type === "google"){
    window.location.href = `https://www.google.com/search?q=${cleanQuery(q)}`;
  }else if(type === "youtube"){
    window.location.href = `https://www.youtube.com/results?search_query=${cleanQuery(q)}`;
  }else if(type === "gaming"){
    window.location.href = `https://www.google.com/search?q=gaming+${cleanQuery(q)}`;
  }else if(type === "twitch"){
    window.location.href = `https://www.twitch.tv/search?term=${cleanQuery(q)}`;
  }
}

// Panel de sugerencias
qInput.addEventListener("focus", () => {
  searchSuggestions.classList.add("active");
});

document.querySelectorAll(".suggestion-item").forEach(item => {
  item.addEventListener("click", () => {
    const type = item.dataset.type;
    if(type === "close"){
      searchSuggestions.classList.remove("active");
      qInput.blur();
    }else{
      go(type);
    }
  });
});

goGoogle.addEventListener("click", () => go("google"));

// YouTube: toque corto = cerrar, toque largo = admin
let youtubeTimeout;
goYouTube.addEventListener("touchstart", () => {
  youtubeTimeout = setTimeout(() => {
    openAdminPanel();
  }, 1000); // 1 segundo = toque largo
});

goYouTube.addEventListener("touchend", () => {
  clearTimeout(youtubeTimeout);
  closeSearch();
});

goYouTube.addEventListener("click", (e) => {
  if(!e.defaultPrevented){
    closeSearch();
  }
});

qInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){
    go("google");
    searchSuggestions.classList.remove("active");
  }
});

function closeSearch(){
  window.close();
  setTimeout(() => { window.history.back(); }, 100);
}

// ============================
// Admin Panel Logic
// ============================
function openAdminPanel(){
  adminOverlay.classList.add("active");
  adminPanel.classList.add("active");
  adminLogin.style.display = "block";
  adminDashboard.style.display = "none";
  adminUser.focus();
}

function closeAdminPanel(){
  adminOverlay.classList.remove("active");
  adminPanel.classList.remove("active");
  adminLogin.style.display = "block";
  adminDashboard.style.display = "none";
  adminUser.value = "";
  adminPass.value = "";
}

adminSubmit.addEventListener("click", () => {
  const user = adminUser.value.trim();
  const pass = adminPass.value.trim();
  
  if(user === ADMIN_USER && pass === ADMIN_PASS){
    adminLogin.style.display = "none";
    adminDashboard.style.display = "block";
    loadAdminSettings();
  }else{
    alert("Credenciales incorrectas");
    adminPass.value = "";
  }
});

adminClose.addEventListener("click", closeAdminPanel);
adminLogout.addEventListener("click", closeAdminPanel);

function loadAdminSettings(){
  const settings = JSON.parse(localStorage.getItem("gameSettings") || "{}");
  document.getElementById("maxTimer").value = settings.maxTimer || 3600;
  document.getElementById("animSpeed").value = settings.animSpeed || 100;
  document.getElementById("colorPrincipal").value = settings.colorPrincipal || "#a855f7";
}

adminSave.addEventListener("click", () => {
  const settings = {
    maxTimer: parseInt(document.getElementById("maxTimer").value),
    animSpeed: parseInt(document.getElementById("animSpeed").value),
    colorPrincipal: document.getElementById("colorPrincipal").value
  };
  
  localStorage.setItem("gameSettings", JSON.stringify(settings));
  
  // Aplicar cambios
  document.documentElement.style.setProperty("--purple", settings.colorPrincipal);
  
  const speedFactor = settings.animSpeed / 100;
  const layers = document.querySelectorAll(".img-layer");
  layers.forEach(layer => {
    layer.style.animationDuration = (24 * speedFactor) + "s";
  });
  
  alert("⚙️ Cambios guardados correctamente");
  closeAdminPanel();
});

// Cargar configuración guardada
window.addEventListener("load", () => {
  const settings = JSON.parse(localStorage.getItem("gameSettings") || "{}");
  if(settings.colorPrincipal){
    document.documentElement.style.setProperty("--purple", settings.colorPrincipal);
  }
});

// Cerrar panel admin al tocar overlay
adminOverlay.addEventListener("click", closeAdminPanel);


// ============================
// 6) Purple particles (lightweight)
// ============================
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

function resize(){
  canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
  canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
}
window.addEventListener("resize", resize);
resize();

const particles = [];
const COUNT = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 14000));

function rand(min, max){ return Math.random() * (max - min) + min; }

for(let i=0;i<COUNT;i++){
  particles.push({
    x: rand(0, canvas.width),
    y: rand(0, canvas.height),
    r: rand(1.2, 2.8) * devicePixelRatio,
    vx: rand(-0.18, 0.18) * devicePixelRatio,
    vy: rand(-0.10, 0.10) * devicePixelRatio,
    a: rand(0.08, 0.22)
  });
}

function tick(){
  if(reduceMotion){
    requestAnimationFrame(tick);
    return;
  }

  ctx.clearRect(0,0,canvas.width, canvas.height);

  for(const p of particles){
    p.x += p.vx;
    p.y += p.vy;

    if(p.x < -50) p.x = canvas.width + 50;
    if(p.x > canvas.width + 50) p.x = -50;
    if(p.y < -50) p.y = canvas.height + 50;
    if(p.y > canvas.height + 50) p.y = -50;

    // glow-ish circle (no color hardcoded in canvas: using white with alpha, overlay does purple)
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${p.a})`;
    ctx.fill();
  }

  requestAnimationFrame(tick);
}
tick();
