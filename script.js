/* =====================================================================
   IRREGULAR VERBS QUIZ — Slide Edition
   Prof. Roberto Mesén Hidalgo · Designed by Rosney
   ===================================================================== */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx9BLLy34P6rovp833gX7IL7VYF35dIHUDj3lS989FpQNpXj8gmVUvB5Zl446NAiu0m/exec";
const TOTAL_SLIDES = 25;
const TOTAL_Q = 20;

const TYPED = {
  q1:["was"], q2:["had"], q3:["went"], q4:["did"],
  q5:["said"], q6:["got"], q7:["made"], q8:["knew"]
};
const CHOICE = {
  q9:"b", q10:"b", q11:"c", q12:"c", q13:"c", q14:"b",
  q15:"b", q16:"a", q17:"c", q18:"b", q19:"a", q20:"b"
};
const CORRECT_LABEL = {
  q1:"was", q2:"had", q3:"went", q4:"did", q5:"said", q6:"got", q7:"made", q8:"knew",
  q9:"B (thought)", q10:"B (came)", q11:"C (saw)", q12:"C (gave)",
  q13:"C (found)", q14:"B (took)", q15:"B (told)", q16:"A (felt)",
  q17:"C (bought)", q18:"B (brought)", q19:"A (left)", q20:"B (became)"
};

let currentSlide = 0;
let studentName  = "";
let quizStarted  = false;
let submitted    = false;
let leaveCount   = 0;
let elapsedSec   = 0;
let timerInterval = null;

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* ── RELOAD PROTECTION ───────────────────────── */
if (sessionStorage.getItem("quizDone") === "yes") {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#050c12;font-family:'Inter',sans-serif;padding:20px;">
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(200,80,240,0.3);
        border-radius:20px;padding:48px 36px;max-width:420px;text-align:center;
        border-top:3px solid #c850f0;">
        <div style="width:72px;height:72px;line-height:72px;font-size:36px;font-weight:900;
          background:linear-gradient(135deg,#c850f0,#ff4db8);color:#000;border-radius:50%;
          margin:0 auto 20px;">!</div>
        <h2 style="font-size:24px;font-weight:700;color:#e8b4ff;margin-bottom:14px;">
          Quiz already submitted
        </h2>
        <p style="font-size:15px;color:rgba(255,255,255,0.55);line-height:1.7;">
          You have already submitted your quiz.<br>
          <strong style="color:#e8e0f0;">Reloading is not allowed.</strong><br><br>
          Contact your professor if you believe this is an error.
        </p>
      </div>
    </div>`;
}

/* ── PARTICLES ───────────────────────────────── */
function initParticles() {
  const canvas = $("#particles");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  const colors = ["#00f5c4","#c850f0","#ff4db8","#00c8ff","#ffffff"];
  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * 1920, y: Math.random() * 1080,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.1
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x / 1920 * W, p.y / 1080 * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = 1920; if (p.x > 1920) p.x = 0;
      if (p.y < 0) p.y = 1080; if (p.y > 1080) p.y = 0;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ── DOT NAV ─────────────────────────────────── */
function buildDots() {
  const nav = $("#dotNav");
  if (!nav) return;
  for (let i = 0; i < TOTAL_SLIDES; i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i === 0 ? " active" : "");
    d.onclick = () => goToSlide(i);
    nav.appendChild(d);
  }
}
function updateDots(idx) {
  $$(".dot").forEach((d, i) => d.classList.toggle("active", i === idx));
}

/* ── SLIDE NAVIGATION ────────────────────────── */
function goToSlide(idx) {
  if (idx < 0 || idx >= TOTAL_SLIDES) return;
  const prev = $(`#slide-${currentSlide}`);
  const next = $(`#slide-${idx}`);
  if (!next) return;
  if (prev) {
    prev.classList.add("exit-up");
    prev.classList.remove("active");
    setTimeout(() => prev.classList.remove("exit-up"), 500);
  }
  setTimeout(() => {
    next.classList.add("active");
    const firstInput = next.querySelector("input.blank, input[type=radio]");
    if (firstInput && firstInput.type === "text") firstInput.focus();
  }, 50);
  currentSlide = idx;
  updateDots(idx);
}

function nextFromBlank(name, nextSlide) {
  goToSlide(nextSlide);
}

/* ── START ───────────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => {
  initParticles();
  buildDots();
  goToSlide(0);

  const startBtn = $("#startBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const n = $("#studentName").value.trim();
      if (!n) { $("#studentName").focus(); $("#studentName").style.borderColor = "#c850f0"; return; }
      studentName = n;
      quizStarted = true;
      startTimer();
      goToSlide(1);
    });
    $("#studentName").addEventListener("keydown", e => { if (e.key === "Enter") startBtn.click(); });
  }

  const submitBtn = $("#submitBtn");
  if (submitBtn) {
    submitBtn.addEventListener("click", handleSubmit);
  }
});

/* ── TIMER ───────────────────────────────────── */
function startTimer() {
  timerInterval = setInterval(() => { elapsedSec++; }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }

/* ── ANTI-CHEAT ──────────────────────────────── */
function permanentBlock() {
  if (submitted) return;
  leaveCount++;
  stopTimer(); quizStarted = false;
  sessionStorage.setItem("quizFlagged", "yes");
  sendToSheets({ type:"quiz", nombre: studentName||"(unnamed)", unidad:"Irregular Verbs · V2",
    puntaje:"FLAGGED — left the page", porcentaje:"0%", correctas:"—", incorrectas:"—",
    detalle:`[FLAGGED at ${formatTime(elapsedSec)} — student left quiz]` }, true);
  const ov = $("#blockedOverlay");
  if (ov) ov.hidden = false;
  document.addEventListener("keydown", e => {
    if (e.key==="F5"||(e.ctrlKey&&(e.key==="r"||e.key==="R"))||(e.metaKey&&(e.key==="r"||e.key==="R"))) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  window.onbeforeunload = e => { e.preventDefault(); e.returnValue = ""; return ""; };
  $$("input").forEach(el => el.disabled = true);
  const btn = $("#submitBtn");
  if (btn) btn.disabled = true;
}

document.addEventListener("visibilitychange", () => { if (!quizStarted||submitted) return; if (document.hidden) permanentBlock(); });
window.addEventListener("blur", () => { if (!quizStarted||submitted) return; permanentBlock(); });
window.addEventListener("beforeunload", e => {
  if ((quizStarted&&!submitted)||submitted) { e.preventDefault(); e.returnValue = ""; return ""; }
});

/* ── SUBMIT ──────────────────────────────────── */
function handleSubmit() {
  if (submitted || !quizStarted) return;

  // Check unanswered
  const unanswered = [];
  for (let i = 1; i <= TOTAL_Q; i++) {
    const key = "q" + i;
    const blank = $(`input.blank[name="${key}"]`);
    const radio = $(`input[type=radio][name="${key}"]:checked`);
    if (!(blank&&blank.value.trim()) && !radio) unanswered.push(i);
  }
  const warn = $("#unansweredWarn");
  if (unanswered.length > 0) {
    if (warn) {
      warn.hidden = false;
      warn.textContent = `⚠ ${unanswered.length} question(s) unanswered: Q${unanswered.join(", Q")}. You can still submit.`;
    }
  }

  stopTimer(); submitted = true;

  let score = 0;
  const correctList = [], wrongList = [], detailList = [];
  for (let i = 1; i <= TOTAL_Q; i++) {
    const key = "q" + i;
    let studentAns = "—", correct = false;
    if (TYPED[key]) {
      const blank = $(`input.blank[name="${key}"]`);
      const val   = blank ? blank.value.trim() : "";
      studentAns  = val || "—";
      correct     = TYPED[key].includes(val.toLowerCase());
    } else {
      const radio = $(`input[type=radio][name="${key}"]:checked`);
      studentAns  = radio ? radio.value : "—";
      correct     = !!(radio && radio.value === CHOICE[key]);
    }
    if (correct) { score++; correctList.push(`Q${i}`); detailList.push(`Q${i}: ${studentAns} ✓`); }
    else { wrongList.push(`Q${i}`); detailList.push(`Q${i}: "${studentAns}" ✗ → ${CORRECT_LABEL[key]}`); }
  }

  const pct    = Math.round(score / TOTAL_Q * 100);
  const detail = `[time:${formatTime(elapsedSec)}] [leaves:${leaveCount}] ` + detailList.join(" | ");

  sendToSheets({ type:"quiz", nombre:studentName, unidad:"Irregular Verbs · V2",
    puntaje:`${score}/${TOTAL_Q}`, porcentaje:`${pct}%`,
    correctas:correctList.join(", ")||"none", incorrectas:wrongList.join(", ")||"none", detalle:detail });

  $$("input").forEach(el => el.disabled = true);
  const btn = $("#submitBtn"); if (btn) { btn.disabled = true; btn.textContent = "Submitted ✓"; }
  sessionStorage.setItem("quizDone", "yes");
}

/* ── SEND TO SHEETS ──────────────────────────── */
function sendToSheets(data, silent = false) {
  const el = silent ? null : $("#saveStatus");
  if (el) { el.className = "save-status saving"; el.textContent = "Sending to professor…"; el.style.display = "block"; }
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    if (el) { el.className = "save-status error"; el.textContent = "Configuration error — contact your professor."; } return;
  }
  fetch(APPS_SCRIPT_URL, { method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(data) })
    .then(r => r.text())
    .then(raw => {
      let res; try { res = JSON.parse(raw); } catch(e) { throw new Error("Server error"); }
      if (!el) return;
      if (res.success) {
        el.className = "save-status saved";
        el.innerHTML = `Quiz submitted ✓<br><strong>${data.nombre}</strong> · Score: <strong>${data.puntaje}</strong> (${data.porcentaje})<br>Your professor will review your answers.`;
      } else { throw new Error(res.error||"Unknown error"); }
    })
    .catch(err => { if (el) { el.className = "save-status error"; el.textContent = "Error sending — contact your professor. " + err.message; } });
}

/* ── UTIL ────────────────────────────────────── */
function formatTime(sec) {
  return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
}
