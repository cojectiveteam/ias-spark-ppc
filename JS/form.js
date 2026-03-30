const form = document.getElementById("regForm");

// REPLACE with your deployed Google Apps Script Web App URL
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzcuux5iezfZDImTzouRpmd23ZKGTlVkeYpj7kmgLD7rchlaNePvvavg8AzZ25QxtP6/exec";

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  const name = data.get("name")?.trim();
  const grade = data.get("grade");
  const mobile = data.get("mobile")?.trim();
  const email = data.get("email")?.trim();
  const city = data.get("city")?.trim();
  const board = data.get("board");

  if (!name || !grade || !mobile || !email || !city || !board) {
    alert("Please fill all required fields.");
    return;
  }

  if (!/^\d{10}$/.test(mobile)) {
    alert("Please enter a valid 10-digit mobile number.");
    return;
  }

  const formBody = new URLSearchParams({
    name, grade, mobile, email, city, board
  });

  try {
    const res = await fetch(GOOGLE_SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody
    });

    const text = await res.text();

     if (text.includes("Success")) {
      form.reset();
      window.location.href = "/thank-you.html"; // 🔥 redirect here
    } else {
      alert("Error: " + text);
    }

  } catch (err) {
    alert("Error submitting form: " + err);
  }
});
