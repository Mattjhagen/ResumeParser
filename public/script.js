// LinkedIn login button handler
document.addEventListener("DOMContentLoaded", () => {
  const linkedinBtn = document.getElementById("linkedin-login");
  const resumeForm = document.getElementById("resumeForm");
  const fileInput = document.querySelector("input[type='file']");
  const statusBox = document.getElementById("status");

  if (linkedinBtn) {
    linkedinBtn.addEventListener("click", () => {
      window.location.href = "/auth/linkedin";
    });
  }

  if (resumeForm) {
    resumeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = fileInput.files[0];
      if (!file) {
        alert("Please upload a resume before continuing.");
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);

      try {
        if (statusBox) statusBox.innerText = "⏳ Uploading & processing...";

        const res = await fetch("/upload-resume", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          if (statusBox) statusBox.innerText = "✅ Success! Redirecting...";
          // You could change this to dynamic site preview if hosted
          window.location.href = data.site || "/preview";
        } else {
          throw new Error(data.error || "Resume upload failed.");
        }
      } catch (err) {
        if (statusBox) statusBox.innerText = `❌ ${err.message}`;
        console.error(err);
      }
    });
  }
});
