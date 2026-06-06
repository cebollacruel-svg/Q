/* =====================================================================
   IRREGULAR VERBS QUIZ · Simple Past · V2 only
   Prof. Roberto Mesén Hidalgo · Designed by Rosney
   Dark edition — same anti-cheat + Sheets logic
   ===================================================================== */

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx9BLLy34P6rovp833gX7IL7VYF35dIHUDj3lS989FpQNpXj8gmVUvB5Zl446NAiu0m/exec";

const TOTAL = 20;

/* ANSWER KEY */
const TYPED = {
  q1: ["was"],
  q2: ["had"],
  q3: ["went"],
  q4: ["did"],
  q5: ["said"],
  q6: ["got"],
  q7: ["made"],
  q8: ["knew"]
};
const CHOICE = {
  q9:"b", q10:"b", q11:"c", q12:"c", q13:"c", q14:"b",
  q15:"b", q16:"a", q17:"c", q18:"b", q19:"a", q20:"b"
};
const CORRECT_LABEL = {
  q1:"was", q2:"had", q3:"went", q4:"did", q5:"said",
  q6:"got", q7:"made", q8:"knew",
  q9:"B (thought)", q10:"B (came)", q11:"C (saw)", q12:"C (gave)",
  q13:"C (found)", q14:"B (took)",
  q15:"B (told)", q16:"A (felt)", q17:"C (bought)",
  q18:"B (brought)", q19:"A (left)", q20:"B (became)"
};

/* STATE */
let studentName = "", quizStarted = false, submitted = false;
let leaveCount = 0, timerInterval = null, elapsedSec = 0;

const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));

/* RELOAD PROTECTION */
if (sessionStorage.getItem("quizDone") === "yes") {
  document.body.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;
      background:#0d1b2a;font-family:'Source Sans 3',sans-serif;padding:20px;">
      <div style="background:#162030;border:1px solid rgba(255,255,255,0.1);border-radius:16px;
        padding:44px 36px;max-width:440px;text-align:center;border-top:4px solid #a01e1e;">
        <div style="width:72px;height:72px;line-height:72px;font-size:36px;font-weight:900;
          background:#a01e1e;color:#fff;border-radius:50%;margin:0 auto 18px;
          font-family:'Playfair Display',serif;">!</div>
        <h2 style="font-family:'Playfair Display',serif;font-size:24px;margin-bottom:12px;color:#e08080;">
          Quiz already submitted
        </h2>
        <p style="font-size:15px;color:#9a9088;line-height:1.65;">
          You have already submitted your quiz.<br>
          <strong style="color:#e8e0d5;">Reloading the page is not allowed.</strong><br><br>
          Contact your professor if you believe this is an error.
        </p>
      </div>
    </div>`;
}

/* START */
const startBtn = $("#startBtn");
if (startBtn) {
  startBtn.addEventListener("click", () => {
    const n = $("#studentName").value.trim();
    if (!n) { $("#studentName").focus(); $("#studentName").style.borderColor = "#a01e1e"; return; }
    studentName = n;
    $("#startGate").hidden = true;
    $("#quizBody").hidden  = false;
    quizStarted = true;
    startTimer();
    updateProgress();
    setTimeout(() => {
      const sA = $("#sectionA");
      if (sA) sA.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 200);
  });
  $("#studentName").addEventListener("keydown", e => { if (e.key === "Enter") startBtn.click(); });
}

/* TIMER */
function startTimer() {
  timerInterval = setInterval(() => {
    elapsedSec++;
    const m = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
    const s = String(elapsedSec % 60).padStart(2, "0");
    $("#timer").textContent = `${m}:${s}`;
  }, 1000);
}
function stopTimer() { clearInterval(timerInterval); }

/* PROGRESS */
function updateProgress() {
  let answered = 0;
  for (let i = 1; i <= TOTAL; i++) {
    const key   = "q" + i;
    const blank = $(`input.blank[name="${key}"]`);
    const radio = $(`input[type=radio][name="${key}"]:checked`);
    const done  = (blank && blank.value.trim()) || radio;
    if (done) answered++;
    const card = $(`.q[data-q="${i}"]`);
    if (card) card.classList.toggle("answered", !!done);
  }
  const fill = $("#progFill");
  if (fill) fill.style.width = (answered / TOTAL * 100).toFixed(0) + "%";
  const txt = $("#progText");
  if (txt) txt.textContent = `${answered} / ${TOTAL}`;
  const note = $("#unansNote");
  if (note) { const l = TOTAL - answered; note.textContent = l > 0 ? `${l} question(s) still unanswered.` : ""; }
}
document.addEventListener("input",  updateProgress);
document.addEventListener("change", updateProgress);

/* ANTI-CHEAT */
function permanentBlock() {
  if (submitted) return;
  leaveCount++;
  stopTimer();
  quizStarted = false;
  sessionStorage.setItem("quizFlagged", "yes");
  sendToSheets({ type:"quiz", nombre: studentName||"(unnamed)", unidad:"Irregular Verbs · V2",
    puntaje:"FLAGGED — left the page", porcentaje:"0%", correctas:"—", incorrectas:"—",
    detalle:`[FLAGGED at ${formatTime(elapsedSec)} — student left the quiz page]` }, true);
  const ov = $("#blockedOverlay");
  if (ov) ov.hidden = false;
  document.addEventListener("keydown", e => {
    if (e.key==="F5"||(e.ctrlKey&&(e.key==="r"||e.key==="R"))||(e.metaKey&&(e.key==="r"||e.key==="R"))) {
      e.preventDefault(); e.stopImmediatePropagation();
    }
  }, true);
  window.onbeforeunload = e => { e.preventDefault(); e.returnValue = ""; return ""; };
  $$("input").forEach(el => el.disabled = true);
  const btn = $(".submit-btn");
  if (btn) btn.disabled = true;
}
document.addEventListener("visibilitychange", () => { if (!quizStarted||submitted) return; if (document.hidden) permanentBlock(); });
window.addEventListener("blur", () => { if (!quizStarted||submitted) return; permanentBlock(); });

/* BEFOREUNLOAD */
window.addEventListener("beforeunload", e => {
  if (quizStarted && !submitted) { e.preventDefault(); e.returnValue = "Your quiz is not submitted yet."; return e.returnValue; }
  if (submitted) { e.preventDefault(); e.returnValue = "The quiz has been submitted. Reloading is not allowed."; return e.returnValue; }
});

/* SUBMIT */
const quizForm = $("#quizForm");
if (quizForm) {
  quizForm.addEventListener("submit", e => {
    e.preventDefault();
    if (submitted || !quizStarted) return;
    stopTimer(); submitted = true;
    let score = 0;
    const correctList = [], wrongList = [], detailList = [];
    for (let i = 1; i <= TOTAL; i++) {
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
    const pct    = Math.round(score / TOTAL * 100);
    const detail = `[time:${formatTime(elapsedSec)}] [leaves:${leaveCount}] ` + detailList.join(" | ");
    sendToSheets({ type:"quiz", nombre:studentName, unidad:"Irregular Verbs · V2",
      puntaje:`${score}/${TOTAL}`, porcentaje:`${pct}%`,
      correctas:correctList.join(", ")||"none", incorrectas:wrongList.join(", ")||"none", detalle:detail });
    lockQuiz();
    sessionStorage.setItem("quizDone", "yes");
  });
}

function lockQuiz() {
  $$("input").forEach(el => el.disabled = true);
  const btn = $(".submit-btn");
  if (btn) { btn.disabled = true; btn.textContent = "Submitted"; }
}

function sendToSheets(data, silent = false) {
  const el = silent ? null : $("#saveStatus");
  if (el) { el.className = "save-status saving"; el.textContent = "Sending your quiz to the professor…"; el.style.display = "block"; }
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    if (el) { el.className = "save-status error"; el.textContent = "Configuration error — contact your professor."; } return;
  }
  fetch(APPS_SCRIPT_URL, { method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body:JSON.stringify(data) })
    .then(r => r.text())
    .then(raw => {
      let res; try { res = JSON.parse(raw); } catch(e) { throw new Error("Not JSON: " + raw.substring(0,200)); }
      if (!el) return;
      if (res.success) {
        el.className = "save-status saved";
        el.innerHTML = `Quiz submitted. Thank you, <strong>${data.nombre}</strong>.<br>Score: <strong>${data.puntaje}</strong> (${data.porcentaje})<br>Your professor will review your answers.`;
        el.scrollIntoView({ behavior:"smooth", block:"center" });
      } else { throw new Error("Apps Script error: " + (res.error||"unknown")); }
    })
    .catch(err => { console.error("SEND ERROR:", err.message); if (el) { el.className = "save-status error"; el.textContent = "Error: " + err.message + ". Contact your professor."; } });
}

function formatTime(sec) {
  return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`;
}
