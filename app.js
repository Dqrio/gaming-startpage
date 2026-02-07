const clockEl = document.getElementById("clock");
const dateEl  = document.getElementById("date");
const timerEl = document.getElementById("timer");

const resetBtn = document.getElementById("resetTimer");
const motionBtn = document.getElementById("toggleMotion");

const qInput = document.getElementById("q");
const goGoogle = document.getElementById("goGoogle");
const goYouTube = document.getElementById("goYouTube");

let reduceMotion = false;

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
  }else{
    window.location.href = `https://www.youtube.com/results?search_query=${cleanQuery(q)}`;
  }
}

goGoogle.addEventListener("click", () => go("google"));
goYouTube.addEventListener("click", () => {
  window.close();
  // Si no se puede cerrar (navegador bloquea), intenta ir atrás
  setTimeout(() => { window.history.back(); }, 100);
});

qInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter") go("google");
});


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
