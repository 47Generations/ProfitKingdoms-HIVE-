document.getElementById("createCompany-btn").addEventListener("click", () => {
    window.location.href = "create-company.html";
});

document.getElementById("manageCompany-btn").addEventListener("click", () => {
    window.location.href = "company-management.html";
});


document.querySelector(".work-milk").addEventListener("click", startWork);

let workStartTime = null;
let workEndTime = null;
let workInterval = null;

function startWork() {
    const laborHours = 6;
    const durationMs = laborHours * 60 * 60 * 1000;

    workStartTime = Date.now();
    workEndTime = workStartTime + durationMs;

    // Save for reload safety
    localStorage.setItem("workStartTime", workStartTime);
    localStorage.setItem("workEndTime", workEndTime);

    // Display finish time immediately
    document.getElementById("work-shift").textContent =
        formatGMT(workEndTime);

    if (workInterval) clearInterval(workInterval);
    workInterval = setInterval(updateWorkTimer, 1000);

    document.getElementById("WorkButton").disabled = true;
}


function updateWorkTimer() {
  const now = Date.now();
  const remaining = Math.max(workEndTime - now, 0);

  document.getElementById("Work-Timer").textContent =
    formatDuration(remaining);

  if (remaining <= 0) {
    clearInterval(workInterval);
    workCompleted();
  }
}

function formatGMT(timestamp) {
  const d = new Date(timestamp);

  return d.toUTCString(); 
  // Example:
  // Tue, 20 Jan 2026 18:00:00 GMT
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function restoreWorkState() {
  const savedEnd = localStorage.getItem("workEndTime");

  if (!savedEnd) return;

  workEndTime = Number(savedEnd);

  document.getElementById("work-shift").textContent =
    formatGMT(workEndTime);

  workInterval = setInterval(updateWorkTimer, 1000);
}

restoreWorkState();


function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

function pad(num) {
  return String(num).padStart(2, "0");
}


function workFinished() {
  console.log("Work complete! Pay player here.");
  // add gold
  // log work history
}
