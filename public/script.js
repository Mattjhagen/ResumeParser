document.addEventListener("DOMContentLoaded", () => {
  const linkedinBtn = document.getElementById("linkedin-login");
  const resumeForm = document.getElementById("resumeForm");
  const fileInput = document.querySelector("input[type='file']");
  const statusBox = document.getElementById("status");
  const terminalLoader = document.getElementById("terminal-loader");

  // 🔐 LinkedIn login
  if (linkedinBtn) {
    linkedinBtn.addEventListener("click", () => {
      window.location.href = "/auth/linkedin";
    });
  }

  // 📄 Resume Upload
  if (resumeForm) {
    resumeForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const file = fileInput?.files?.[0];
      if (!file) {
        alert("Please upload a resume before continuing.");
        return;
      }

      const formData = new FormData();
      formData.append("resume", file);

      try {
        if (terminalLoader) terminalLoader.style.display = "flex";
        if (statusBox) statusBox.innerText = "⏳ Uploading & processing...";

        const res = await fetch("/upload-resume", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (res.ok) {
          if (statusBox) statusBox.innerText = "✅ Success! Redirecting...";
          window.location.href = data.site || "/preview";
        } else {
          throw new Error(data.error || "Resume upload failed.");
        }
      } catch (err) {
        console.error(err);
        if (statusBox) statusBox.innerText = `❌ ${err.message}`;
      } finally {
        if (terminalLoader) terminalLoader.style.display = "none";
      }
    });
  }
});
