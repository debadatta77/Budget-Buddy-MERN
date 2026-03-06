// Profile Integration Script

// Check authentication
if (!Utils.requireAuth()) {
  // Will redirect to login
}

// Load user profile
async function loadUserProfile() {
  try {
    const response = await ProfileAPI.getProfile();

    if (response.success) {
      const user = response.data;

      // Update profile display
      document.querySelector(".profile-name").textContent = user.name || "User";
      document.querySelector(".profile-email").textContent = user.email || "";
      document.querySelector(".profile-avatar-large").textContent = (
        user.name || "U"
      )
        .charAt(0)
        .toUpperCase();

      // Update sidebar
      document.querySelector(".user-info h3").textContent = user.name || "User";
      document.querySelector(".user-info p").textContent = user.email || "";
      document.querySelector(".user-avatar").textContent = (user.name || "U")
        .charAt(0)
        .toUpperCase();

      // Update detail items
      document
        .querySelectorAll(".detail-item")[0]
        .querySelector(".detail-value").textContent =
        user.email || "Not provided";
      document
        .querySelectorAll(".detail-item")[1]
        .querySelector(".detail-value").textContent =
        user.phone || "Not provided";
      document
        .querySelectorAll(".detail-item")[2]
        .querySelector(".detail-value").textContent = user.dateOfBirth
        ? new Date(user.dateOfBirth).toLocaleDateString()
        : "Not provided";
      document
        .querySelectorAll(".detail-item")[3]
        .querySelector(".detail-value").textContent =
        user.gender || "Not provided";
      document
        .querySelectorAll(".detail-item")[4]
        .querySelector(".detail-value").textContent = user.currency || "INR";
      document
        .querySelectorAll(".detail-item")[5]
        .querySelector(".detail-value").textContent = user.monthlyIncome
        ? `₹${user.monthlyIncome.toLocaleString()}`
        : "Not provided";
      document
        .querySelectorAll(".detail-item")[6]
        .querySelector(".detail-value").textContent = new Date(
        user.createdAt,
      ).toLocaleDateString();

      // Update stats
      const monthsSinceJoined = Math.floor(
        (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24 * 30),
      );
      document
        .querySelectorAll(".stat-box")[3]
        .querySelector(".stat-value").textContent = monthsSinceJoined || 1;
    } else {
      Utils.showError(response.message || "Failed to load profile");
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    // Don't show error - it's likely a permission issue with old session
    console.log("Profile might be loading for new user, retrying...");
  }
}

// Open edit modal
function openEditModal() {
  const name = document
    .querySelectorAll(".detail-item")[0]
    .querySelector(".detail-value").textContent;
  const phone = document
    .querySelectorAll(".detail-item")[1]
    .querySelector(".detail-value").textContent;
  const dob = document
    .querySelectorAll(".detail-item")[2]
    .querySelector(".detail-value").textContent;
  const gender = document
    .querySelectorAll(".detail-item")[3]
    .querySelector(".detail-value").textContent;
  const income = document
    .querySelectorAll(".detail-item")[5]
    .querySelector(".detail-value").textContent;

  // Fill form
  document.getElementById("editName").value =
    document.querySelector(".profile-name").textContent;
  document.getElementById("editPhone").value =
    phone !== "Not provided" ? phone : "";
  document.getElementById("editGender").value =
    gender !== "Not provided" ? gender : "";
  document.getElementById("editIncome").value =
    income !== "Not provided" ? income.replace(/[₹,]/g, "") : "";

  if (dob !== "Not provided") {
    const [day, month, year] = dob.split("/");
    document.getElementById("editDOB").value =
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  document.getElementById("editModal").classList.add("show");
}

// Close edit modal
function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
}

// Handle profile update
async function handleProfileUpdate(event) {
  event.preventDefault();

  const profileData = {
    name: document.getElementById("editName").value,
    phone: document.getElementById("editPhone").value,
    dateOfBirth: document.getElementById("editDOB").value || null,
    gender: document.getElementById("editGender").value,
    monthlyIncome: parseFloat(document.getElementById("editIncome").value) || 0,
  };

  try {
    const response = await ProfileAPI.updateProfile(profileData);

    if (response.success) {
      // Update stored user data
      AuthHelper.saveUser(response.data);

      closeEditModal();
      loadUserProfile();

      // Show success message
      const successMsg = document.querySelector(".success-message");
      successMsg.classList.add("show");
      setTimeout(() => successMsg.classList.remove("show"), 3000);
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    Utils.showError("Failed to update profile");
  }
}

// Navigation
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("mobile-hidden");
  document.getElementById("overlay").classList.toggle("show");
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    AuthHelper.removeToken();
    window.location.href = "index.html";
  }
}

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  // Clear old data immediately to prevent showing placeholder content
  const profileInfo = document.querySelector(".profile-info");
  if (profileInfo) {
    const firstNameEl = document.getElementById("displayFirstName");
    const emailEl = document.getElementById("displayEmail");
    if (firstNameEl) firstNameEl.textContent = "Loading...";
    if (emailEl) emailEl.textContent = "Loading...";
  }

  loadUserProfile();

  // Set contact form defaults
  const user = AuthHelper.getUser();
  if (user) {
    const contactNameEl = document.getElementById("contactName");
    const contactEmailEl = document.getElementById("contactEmail");
    if (contactNameEl) contactNameEl.value = user.name || "";
    if (contactEmailEl) contactEmailEl.value = user.email || "";
  }

  // Attach event listeners only if elements exist
  const editForm = document.getElementById("editForm");
  if (editForm) {
    editForm.addEventListener("submit", handleProfileUpdate);
  }

  // Don't attach to contactForm - it uses inline handler
});
