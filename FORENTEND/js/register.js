// register.js
const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("fullname").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (password !== confirmPassword) {
    toast.warning("Passwords do not match!");
    return;
  }

  // Show loading toast
  const loadingToast = toast.loading("Creating your account...");

  try {
    const response = await fetch("https://todolist-auth-server.onrender.com/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    // Hide loading toast
    toast.hide(loadingToast);

    if (response.ok) {
      toast.success("🎉 Account created successfully! Please login now.");
      signupForm.reset();

      // Switch to login form after 1.5 seconds
      setTimeout(() => {
        document.getElementById("signupSection").classList.remove("active");
        document.getElementById("loginSection").classList.add("active");
      }, 1500);
    } else {
      toast.error(data.error || "Registration failed. Please try again.");
    }
  } catch (error) {
    // Hide loading toast
    toast.hide(loadingToast);
    console.error("Error:", error);
    toast.error("Unable to connect to server. Please try again later.");
  }
});
