// login.js
const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  // Show loading toast
  const loadingToast = toast.loading("Signing you in...");

  try {
    const response = await fetch("https://todolist-auth-server.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    // Hide loading toast
    toast.hide(loadingToast);

    if (response.ok) {
      // Store token + user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(data.user));

      // Show success toast
      toast.success(`Welcome back, ${data.user.name}! Redirecting...`);

      // Redirect to dashboard after short delay
      setTimeout(() => {
        window.location.href = "/FORENTEND/HomeTools/WorkSpace.html";
      }, 1000);
    } else {
      toast.error(data.error || "Login failed. Please check your credentials."); 
    }
  } catch (error) {
    // Hide loading toast
    toast.hide(loadingToast);
    console.error(error);
    toast.error("Unable to connect to server. Please try again later.");
  }
});
