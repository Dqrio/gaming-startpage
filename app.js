const clockEl = document.getElementById("clock");
const dateEl  = document.getElementById("date");
const timerEl = document.getElementById("timer");

const resetBtn = document.getElementById("resetTimer");
const motionBtn = document.getElementById("toggleMotion");

const qInput = document.getElementById("q");
const goGoogle = document.getElementById("goGoogle");

// Admin & Config
const adminOverlay = document.getElementById("adminOverlay");
const adminPanel = document.getElementById("adminPanel");
const adminLogin = document.getElementById("adminLogin");
const adminDashboard = document.getElementById("adminDashboard");
const adminUser = document.getElementById("adminUser");
const adminPass = document.getElementById("adminPass");
const adminSubmit = document.getElementById("adminSubmit");
const adminClose = document.getElementById("adminClose");
const adminSave = document.getElementById("adminSave");
const adminReset = document.getElementById("adminReset");
const adminLogout = document.getElementById("adminLogout");

let reduceMotion = false;
const DEFAULT_PARTICLE_COUNT = 60;
let particleCount = DEFAULT_PARTICLE_COUNT;

// ============================
// ADMIN CREDENTIALS
// ============================
const ADMIN_USER = "Dq";
const ADMIN_PASS = "Dqrio";

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
// 5) Search
// ============================
function cleanQuery(q){
  return encodeURIComponent(q.trim());
}

function go(type){
  const q = qInput.value.trim();
  if(!q) return;

  if(type === "google"){
    window.location.href = `https://www.google.com/search?q=${cleanQuery(q)}`;
  }
}

goGoogle.addEventListener("click", () => go("google"));

// Google: Long Press para abrir Admin
let googleTimeout;
let googlePressed = false;

document.getElementById("goGoogle").addEventListener("mousedown", () => {
  googlePressed = true;
  googleTimeout = setTimeout(() => {
    googlePressed = false;
    openAdminPanel();
  }, 1000); // 1 segundo = mantener presionado
});

document.getElementById("goGoogle").addEventListener("mouseup", () => {
  clearTimeout(googleTimeout);
});

document.getElementById("goGoogle").addEventListener("touchstart", (e) => {
  googlePressed = true;
  googleTimeout = setTimeout(() => {
    googlePressed = false;
    openAdminPanel();
  }, 1000);
});

document.getElementById("goGoogle").addEventListener("touchend", (e) => {
  clearTimeout(googleTimeout);
});

qInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter"){
    go("google");
  }
});

// Animación de subida del buscador al enfocar
qInput.addEventListener("focus", () => {
  document.querySelector(".search").classList.add("active");
});

qInput.addEventListener("blur", () => {
  document.querySelector(".search").classList.remove("active");
});

// ============================
// Admin Panel Logic
// ============================
function openAdminPanel(){
  adminOverlay.classList.add("active");
  adminPanel.classList.add("active");
  adminLogin.style.display = "block";
  adminDashboard.style.display = "none";
  adminUser.value = "";
  adminPass.value = "";
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
    alert("❌ Credenciales incorrectas\nIntenta: Dq / Dqrio");
    adminPass.value = "";
    adminPass.focus();
  }
});

adminClose.addEventListener("click", closeAdminPanel);
adminLogout.addEventListener("click", closeAdminPanel);
adminOverlay.addEventListener("click", closeAdminPanel);

function loadAdminSettings(){
  const settings = JSON.parse(localStorage.getItem("gameSettings") || "{}");
  document.getElementById("animSpeed").value = settings.animSpeed || 100;
  document.getElementById("animSpeedValue").textContent = (settings.animSpeed || 100) + "%";
  document.getElementById("colorPrincipal").value = settings.colorPrincipal || "#a855f7";
  document.getElementById("overlayOpacity").value = settings.overlayOpacity || 30;
  document.getElementById("overlayOpacityValue").textContent = (settings.overlayOpacity || 30) + "%";
  
  // Nuevas opciones
  document.getElementById("glowIntensity").value = settings.glowIntensity || 100;
  document.getElementById("glowIntensityValue").textContent = (settings.glowIntensity || 100) + "%";
  document.getElementById("particleCount").value = settings.particleCount || DEFAULT_PARTICLE_COUNT;
  document.getElementById("particleCountValue").textContent = (settings.particleCount || DEFAULT_PARTICLE_COUNT);
  
  // Cargar preset seleccionado
  const preset = settings.preset || "gaming";
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.classList.remove("active");
    if(btn.dataset.preset === preset) btn.classList.add("active");
  });

  document.body.classList.toggle("low-end", preset === "low");
}

// Actualizar valor en tiempo real de sliders
document.getElementById("animSpeed").addEventListener("input", (e) => {
  document.getElementById("animSpeedValue").textContent = e.target.value + "%";
});

document.getElementById("overlayOpacity").addEventListener("input", (e) => {
  document.getElementById("overlayOpacityValue").textContent = e.target.value + "%";
});

document.getElementById("glowIntensity").addEventListener("input", (e) => {
  document.getElementById("glowIntensityValue").textContent = e.target.value + "%";
});

document.getElementById("particleCount").addEventListener("input", (e) => {
  document.getElementById("particleCountValue").textContent = e.target.value;
});

// Preset buttons
document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const preset = btn.dataset.preset;
    
    document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    // Aplicar valores predefinidos
    const presets = {
      "low": { animSpeed: 180, glowIntensity: 40, particleCount: 30, overlayOpacity: 25 },
      "chill": { animSpeed: 150, glowIntensity: 50 },
      "normal": { animSpeed: 100, glowIntensity: 100 },
      "gaming": { animSpeed: 125, glowIntensity: 150 }
    };
    
    const config = presets[preset];
    if(config){
      document.getElementById("animSpeed").value = config.animSpeed;
      document.getElementById("animSpeedValue").textContent = config.animSpeed + "%";
      document.getElementById("glowIntensity").value = config.glowIntensity;
      document.getElementById("glowIntensityValue").textContent = config.glowIntensity + "%";
      if(config.particleCount !== undefined){
        document.getElementById("particleCount").value = config.particleCount;
        document.getElementById("particleCountValue").textContent = config.particleCount;
      }
      if(config.overlayOpacity !== undefined){
        document.getElementById("overlayOpacity").value = config.overlayOpacity;
        document.getElementById("overlayOpacityValue").textContent = config.overlayOpacity + "%";
      }
    }

    document.body.classList.toggle("low-end", preset === "low");
  });
});

adminSave.addEventListener("click", () => {
  const settings = {
    animSpeed: parseInt(document.getElementById("animSpeed").value),
    colorPrincipal: document.getElementById("colorPrincipal").value,
    overlayOpacity: parseInt(document.getElementById("overlayOpacity").value),
    glowIntensity: parseInt(document.getElementById("glowIntensity").value),
    particleCount: parseInt(document.getElementById("particleCount").value),
    preset: document.querySelector(".preset-btn.active").dataset.preset
  };
  
  localStorage.setItem("gameSettings", JSON.stringify(settings));
  
  // Aplicar cambios en tiempo real
  document.documentElement.style.setProperty("--purple", settings.colorPrincipal);
  
  const speedFactor = settings.animSpeed / 100;
  const layers = document.querySelectorAll(".img-layer");
  layers.forEach(layer => {
    layer.style.animationDuration = (24 * speedFactor) + "s";
  });
  
  // Ajustar opacidad del overlay
  const overlayEl = document.querySelector(".overlay");
  overlayEl.style.opacity = (settings.overlayOpacity / 100);
  
  // Aplicar intensidad de glow (modificar opacity de elementos con animación neonGlow)
  const glowFactor = settings.glowIntensity / 100;
  document.documentElement.style.setProperty("--glow-intensity", glowFactor);
  
  // Actualizar cantidad de partículas
  particleCount = settings.particleCount;
  buildParticles(particleCount);

  document.body.classList.toggle("low-end", settings.preset === "low");
  
  alert("✅ Cambios guardados correctamente");
  closeAdminPanel();
});

// Botón Restablecer
adminReset.addEventListener("click", () => {
  if(confirm("¿Restablecer configuración a valores por defecto?")){
    localStorage.removeItem("gameSettings");
    
    // Restaurar valores por defecto
    document.documentElement.style.setProperty("--purple", "#a855f7");
    
    const layers = document.querySelectorAll(".img-layer");
    layers.forEach(layer => {
      layer.style.animationDuration = "24s";
    });
    
    const overlayEl = document.querySelector(".overlay");
    overlayEl.style.opacity = "0.3";

    particleCount = DEFAULT_PARTICLE_COUNT;
    buildParticles(particleCount);

    document.body.classList.remove("low-end");
    
    loadAdminSettings(); // Recarga los valores en el panel
    alert("✅ Configuración restablecida");
  }
});

// Cargar configuración guardada al inicio
window.addEventListener("load", () => {
  const settings = JSON.parse(localStorage.getItem("gameSettings") || "{}");
  if(settings.colorPrincipal){
    document.documentElement.style.setProperty("--purple", settings.colorPrincipal);
  }
  if(settings.overlayOpacity){
    document.querySelector(".overlay").style.opacity = (settings.overlayOpacity / 100);
  }
  if(settings.animSpeed){
    const speedFactor = settings.animSpeed / 100;
    const layers = document.querySelectorAll(".img-layer");
    layers.forEach(layer => {
      layer.style.animationDuration = (24 * speedFactor) + "s";
    });
  }
  if(settings.glowIntensity){
    const glowFactor = settings.glowIntensity / 100;
    document.documentElement.style.setProperty("--glow-intensity", glowFactor);
  }
  if(settings.particleCount){
    particleCount = settings.particleCount;
  }else{
    particleCount = DEFAULT_PARTICLE_COUNT;
  }
  buildParticles(particleCount);

  document.body.classList.toggle("low-end", settings.preset === "low");
});


// ============================
// 6) Purple particles (lightweight)
// ============================
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let dpr = Math.min(window.devicePixelRatio || 1, 1.5);

function resize(){
  dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  buildParticles(particleCount);
}
window.addEventListener("resize", resize);
resize();

let particles = [];

function rand(min, max){ return Math.random() * (max - min) + min; }
function clamp(num, min, max){ return Math.min(max, Math.max(min, num)); }

function buildParticles(count){
  const finalCount = clamp(count || DEFAULT_PARTICLE_COUNT, 20, 200);
  particles = [];
  for(let i=0;i<finalCount;i++){
    particles.push({
      x: rand(0, canvas.width),
      y: rand(0, canvas.height),
      r: rand(1.1, 2.4) * dpr,
      vx: rand(-0.14, 0.14) * dpr,
      vy: rand(-0.08, 0.08) * dpr,
      a: rand(0.06, 0.18)
    });
  }
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
