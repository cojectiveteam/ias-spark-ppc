
// ==========================
// Load external script (JSONP)
// ==========================
function loadScript(url) {
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  document.body.appendChild(script);
}

// ==========================
// Handle API response
// ==========================
function handleData(data) {
  if (!data || !data.date) return;

  const targetDate = new Date(data.date + "+05:30").getTime();

  // Save in localStorage for instant next load
  localStorage.setItem("cd_target", targetDate);

  // Prevent multiple intervals stacking
  if (window._cdInterval) clearInterval(window._cdInterval);

  // Update global
  window._cdTarget = targetDate;

  startCountdown(targetDate);
}

// ==========================
// Start countdown
// ==========================
function startCountdown(targetDate) {
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      setAll("00", "00", "00", "00");
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((distance / (1000 * 60)) % 60);
    const secs = Math.floor((distance / 1000) % 60);

    setAll(days, hours, mins, secs);
  }

  function setAll(d, h, m, s) {
    document.getElementById("days").innerText = String(d).padStart(2, '0');
    document.getElementById("hours").innerText = String(h).padStart(2, '0');
    document.getElementById("mins").innerText = String(m).padStart(2, '0');
    document.getElementById("secs").innerText = String(s).padStart(2, '0');
  }

  updateCountdown();
  window._cdInterval = setInterval(updateCountdown, 1000);
}

// ==========================
// INIT (Instant load)
// ==========================
(function initCountdown() {
  const cached = localStorage.getItem("cd_target");

  if (cached) {
    startCountdown(parseInt(cached, 10));
  } else {
    // Instant placeholder (no blank UI)
    document.getElementById("days").innerText = "--";
    document.getElementById("hours").innerText = "--";
    document.getElementById("mins").innerText = "--";
    document.getElementById("secs").innerText = "--";
  }
})();

// ==========================
// Load API (background)
// ==========================
loadScript("https://script.google.com/macros/s/AKfycbxq5QfqHjgwkbKmLRgaJK0jZGHbw7ZQJf6kIaI_1PUow-Ln1G8p4Q7czwdvcNkMlgP1/exec?callback=handleData");

