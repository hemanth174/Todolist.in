// register.js
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("fullname").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (password !== confirmPassword) {
    alert("⚠ Passwords do not match!");
    return;
  }

  try {
    const response = await fetch("https://todolist-auth-server.onrender.com/users", {
      method: "POST",
      headers: {
  "Authorization": "Bearer " + localStorage.getItem("token")
},

      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("🎉 Account created successfully! Please login now.");
      signupForm.reset();

      // Switch to login form after success
      document.getElementById("signupSection").classList.remove("active");
      document.getElementById("loginSection").classList.add("active");
    } else {
      alert(`❌ ${data.error}`);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("⚠ Unable to register. Please try again later.");
  }
});
