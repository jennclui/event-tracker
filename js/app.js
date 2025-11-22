// ---------------------------
// Grandma's Day Tracker - Meal Form
// Works with your custom HTML structure
// ---------------------------

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const mealButtons = document.querySelectorAll("#mealButtons button");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalSub = document.getElementById("modalSub");
  const modalClose = document.getElementById("modalClose");

  const entryDate = document.getElementById("entryDate");
  const entryTime = document.getElementById("entryTime");
  const caregiverInput = document.getElementById("caregiver");
  const notesRTE = document.getElementById("notesRTE");
  const toolbarButtons = document.querySelectorAll(".tool-btn");

  const photoInput = document.getElementById("photoInput");
  const filePreview = document.getElementById("filePreview");

  const cancelBtn = document.getElementById("cancelBtn");
  const submitBtn = document.getElementById("submitBtn");
  const statusDiv = document.getElementById("status");

  let selectedMealType = "";
  let selectedFile = null;

  // ---------------------------
  // Open modal when meal button clicked
  mealButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      selectedMealType = btn.dataset.meal;

      modalTitle.textContent = `Meal: ${selectedMealType}`;
      modalSub.textContent = "Logging";

      // Auto-set date and time
      const now = new Date();
      entryDate.value = now.toISOString().slice(0, 10);
      entryTime.value = now.toTimeString().slice(0,5);

      caregiverInput.value = "";
      notesRTE.innerHTML = "";
      selectedFile = null;
      photoInput.value = "";
      filePreview.textContent = "";

      modalBackdrop.classList.add("visible");
    });
  });

  // ---------------------------
  // Close modal
  modalClose.addEventListener("click", () => modalBackdrop.classList.remove("visible"));
  cancelBtn.addEventListener("click", () => modalBackdrop.classList.remove("visible"));

  // ---------------------------
  // Rich Text Editor toolbar
  toolbarButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const cmd = btn.dataset.cmd;
      if (cmd === "undo" || cmd === "redo") {
        document.execCommand(cmd, false, null);
      } else {
        document.execCommand(cmd, false, null);
      }
    });
  });

  // ---------------------------
  // Photo preview
  photoInput.addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
    if (selectedFile) {
      filePreview.textContent = selectedFile.name;
    } else {
      filePreview.textContent = "";
    }
  });

  // ---------------------------
  // Submit form
  submitBtn.addEventListener("click", async () => {
    statusDiv.textContent = "Submitting...";

    const payload = {
      collection: "Meals",
      date: entryDate.value,
      time: entryTime.value,
      type: selectedMealType,
      caregiver: caregiverInput.value,
      notesHtml: notesRTE.innerHTML,
      imageBase64: null,
      filename: "",
      mime: ""
    };

    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = e.target.result.split(",")[1];
        payload.imageBase64 = base64Data;
        payload.filename = selectedFile.name;
        payload.mime = selectedFile.type;

        await sendToGoogleSheet(payload);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      await sendToGoogleSheet(payload);
    }
  });

  // ---------------------------
  // Send data to Google Apps Script Web App
  async function sendToGoogleSheet(data) {
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwp8gumFoOKsEdmJKYJapKo7pR8JfCW-9L9Au1NKstcEI10SpUcWQnoQYzhY36QTHR0/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      console.log("Submission success:", result);
      statusDiv.textContent = "Submitted successfully!";
      setTimeout(() => {
        modalBackdrop.classList.remove("visible");
        statusDiv.textContent = "";
      }, 1000);
    } catch (err) {
      console.error("Error submitting:", err);
      statusDiv.textContent = "Error submitting. Try again.";
    }
  }
});
