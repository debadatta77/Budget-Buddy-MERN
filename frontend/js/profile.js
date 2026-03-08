// Profile Integration Script

if (!Utils.requireAuth()) {
  // Redirect is handled in requireAuth
}

const PROFILE_CACHE_KEY = "budgetbuddy_profile_cache";

function splitName(fullName = "") {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "User", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString(undefined, {
    maximumFractionDigits: 0,
  })}`;
}

function renderProfile(user) {
  const name = user?.name || "User";
  const email = user?.email || "Not provided";
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const { firstName, lastName } = splitName(name);

  const profileName = document.getElementById("profileName");
  const profileEmail = document.getElementById("profileEmail");
  const profileAvatar = document.getElementById("profileAvatar");

  if (profileName) profileName.textContent = name;
  if (profileEmail) profileEmail.textContent = email;
  if (profileAvatar) profileAvatar.textContent = initials || "U";

  const sidebarName = document.querySelector(".user-info h3");
  const sidebarEmail = document.querySelector(".user-info p");
  const sidebarAvatar = document.querySelector(".user-avatar");

  if (sidebarName) sidebarName.textContent = name;
  if (sidebarEmail) sidebarEmail.textContent = email;
  if (sidebarAvatar) sidebarAvatar.textContent = (initials || "U").charAt(0);

  const firstNameEl = document.getElementById("displayFirstName");
  const lastNameEl = document.getElementById("displayLastName");
  const emailEl = document.getElementById("displayEmail");
  const memberSinceEl = document.getElementById("displayMemberSince");

  if (firstNameEl) firstNameEl.textContent = firstName || "Not provided";
  if (lastNameEl) lastNameEl.textContent = lastName || "Not provided";
  if (emailEl) emailEl.textContent = email;
  if (memberSinceEl) {
    memberSinceEl.textContent = user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "Not provided";
  }

  // Keep auth cache in sync for other pages
  const existingUser = AuthHelper.getUser() || {};
  AuthHelper.saveUser({ ...existingUser, ...user });
  localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(user));

  // Keep contact defaults useful
  const contactName = document.getElementById("contactName");
  const contactEmail = document.getElementById("contactEmail");
  if (contactName) contactName.value = name;
  if (contactEmail) contactEmail.value = user?.email || "";
}

async function loadUserProfile() {
  try {
    const response = await ProfileAPI.getProfile();
    if (response.success) {
      renderProfile(response.data);
      return;
    }
    Utils.showError(response.message || "Failed to load profile");
  } catch (error) {
    console.error("Error fetching profile:", error);

    const message = String(error?.message || "");
    if (
      message.toLowerCase().includes("not authorized") ||
      message.toLowerCase().includes("token is invalid") ||
      message.toLowerCase().includes("please login")
    ) {
      AuthHelper.removeToken();
      window.location.href = "index.html";
      return;
    }

    const cached = localStorage.getItem(PROFILE_CACHE_KEY);
    if (cached) {
      try {
        renderProfile(JSON.parse(cached));
      } catch {
        // Ignore cache parse errors and surface API issue
      }
    }

    Utils.showError("Unable to load latest profile data");
  }
}

async function loadProfileStats() {
  const totalExpensesEl = document.getElementById("statTotalExpenses");
  const goalsAchievedEl = document.getElementById("statGoalsAchieved");
  const totalSavedEl = document.getElementById("statTotalSaved");

  try {
    const now = new Date();
    const [summaryRes, goalsRes] = await Promise.all([
      ExpenseAPI.getExpensesSummary(now.getMonth() + 1, now.getFullYear()),
      SavingsAPI.getGoals(),
    ]);

    if (summaryRes?.success && totalExpensesEl) {
      totalExpensesEl.textContent = formatCurrency(summaryRes.data?.total || 0);
    }

    if (goalsRes?.success) {
      const goals = goalsRes.data || [];
      const goalsAchieved = goals.filter(
        (goal) =>
          goal.status === "completed" || Number(goal.progress || 0) >= 100,
      ).length;
      const totalSaved = goals.reduce(
        (sum, goal) => sum + Number(goal.savedAmount || 0),
        0,
      );

      if (goalsAchievedEl) goalsAchievedEl.textContent = String(goalsAchieved);
      if (totalSavedEl) totalSavedEl.textContent = formatCurrency(totalSaved);
    }
  } catch (error) {
    console.error("Error loading profile stats:", error);
    if (totalExpensesEl && totalExpensesEl.textContent === "-")
      totalExpensesEl.textContent = "0";
    if (goalsAchievedEl && goalsAchievedEl.textContent === "-")
      goalsAchievedEl.textContent = "0";
    if (totalSavedEl && totalSavedEl.textContent === "-")
      totalSavedEl.textContent = "₹0";
  }
}

function openEditModal() {
  const profileName = document.getElementById("profileName")?.textContent || "";
  const profileEmail =
    document.getElementById("profileEmail")?.textContent || "";
  const { firstName, lastName } = splitName(profileName);

  const firstNameInput = document.getElementById("editFirstName");
  const lastNameInput = document.getElementById("editLastName");
  const emailInput = document.getElementById("editEmail");

  if (firstNameInput) firstNameInput.value = firstName;
  if (lastNameInput) lastNameInput.value = lastName;
  if (emailInput)
    emailInput.value = profileEmail !== "Not provided" ? profileEmail : "";

  document.getElementById("editModal")?.classList.add("show");
}

function closeEditModal() {
  document.getElementById("editModal")?.classList.remove("show");
}

async function handleProfileUpdate(event) {
  event.preventDefault();

  const firstName =
    document.getElementById("editFirstName")?.value?.trim() || "";
  const lastName = document.getElementById("editLastName")?.value?.trim() || "";
  const email = document.getElementById("editEmail")?.value?.trim() || "";

  if (!firstName) {
    Utils.showError("First name is required");
    return;
  }

  const payload = {
    name: `${firstName}${lastName ? " " + lastName : ""}`,
    email,
  };

  try {
    const response = await ProfileAPI.updateProfile(payload);
    if (response.success) {
      renderProfile(response.data);
      closeEditModal();
      const successMsg = document.getElementById("editSuccessMessage");
      if (successMsg) {
        successMsg.classList.add("show");
        setTimeout(() => successMsg.classList.remove("show"), 2500);
      }
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    Utils.showError(error?.message || "Failed to update profile");
  }
}

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("mobile-hidden");
  document.getElementById("overlay")?.classList.toggle("show");
}

function logout() {
  if (confirm("Are you sure you want to logout?")) {
    AuthHelper.removeToken();
    window.location.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadProfileStats();

  const editForm = document.getElementById("editProfileForm");
  if (editForm) {
    editForm.addEventListener("submit", handleProfileUpdate);
  }
});
