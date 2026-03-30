
// Load external script (JSONP)
function loadScript(url) {
  const script = document.createElement("script");
  script.src = url;
  document.body.appendChild(script);
}

// This will receive data from Google Sheet
function handleData(data) {
  if (!data || !data.date) return;

  const targetDate = new Date(data.date + "+05:30").getTime();

  // ADD THIS LINE (VERY IMPORTANT)
  window._cdTarget = targetDate;

  startCountdown(targetDate);
}
function startCountdown(targetDate) {
  function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      document.getElementById("days").innerText = "00";
      document.getElementById("hours").innerText = "00";
      document.getElementById("mins").innerText = "00";
      document.getElementById("secs").innerText = "00";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((distance / (1000 * 60)) % 60);
    const secs = Math.floor((distance / 1000) % 60);

    document.getElementById("days").innerText = String(days).padStart(2, '0');
    document.getElementById("hours").innerText = String(hours).padStart(2, '0');
    document.getElementById("mins").innerText = String(mins).padStart(2, '0');
    document.getElementById("secs").innerText = String(secs).padStart(2, '0');
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);
}

//  script URL
loadScript("https://script.google.com/macros/s/AKfycbxq5QfqHjgwkbKmLRgaJK0jZGHbw7ZQJf6kIaI_1PUow-Ln1G8p4Q7czwdvcNkMlgP1/exec?callback=handleData");
