// login.js
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("https://todolist-auth-server.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(`✅ Welcome back, ${data.user.name}!`);

      // Store token + user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));

      // Redirect to dashboard
      window.location.href = "/HomeTools/Home.html";
    } else {
      alert(`❌ ${data.error}`);
    }
  } catch (error) {
    console.error(error);
    alert("⚠ Login failed. Please try again later.");
  }
});
