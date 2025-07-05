// This file is purely for client-side logic and UI interaction.

// We need to include a client-side PDF parsing library.
// Let's use pdf.js from Mozilla. We'll add the script tag to index.html
// For now, we'll assume it's loaded.

// Function to make the API call to our own backend
async function callBackendForPortfolio(resumeText) {
  const response = await fetch('/api/generate-portfolio', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ resumeText }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate portfolio from backend.');
  }

  const data = await response.json();
  return data.portfolioHtml;
}

// Event listener for the button
document.addEventListener('DOMContentLoaded', () => {
  const resumeFile = document.getElementById('resumeFile');
  const generateBtn = document.getElementById('generatePortfolioBtn');
  const loadingMessage = document.getElementById('loadingMessage');
  const portfolioOutput = document.getElementById('portfolioOutput');

  generateBtn.addEventListener('click', async () => {
    if (!resumeFile.files.length) {
      alert('Please select a resume file.');
      return;
    }

    const file = resumeFile.files[0];
    
    loadingMessage.style.display = 'block';
    portfolioOutput.innerHTML = '';

    try {
        let resumeText = '';
        if (file.type === 'application/pdf') {
            const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
            let textContent = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const text = await page.getTextContent();
                textContent += text.items.map(s => s.str).join(' ');
            }
            resumeText = textContent;
        } else {
            resumeText = await file.text();
        }

        const generatedHtml = await callBackendForPortfolio(resumeText);
        portfolioOutput.innerHTML = `
          <h3>Your Generated Portfolio:</h3>
          <iframe srcdoc="${escapeHtml(generatedHtml)}" width="100%" height="800px" frameborder="0" allowfullscreen></iframe>
          <p>You can save this HTML content and host it on your own domain or use a service like GitHub Pages.</p>
          <textarea style="width: 100%; height: 200px; margin-top: 10px;">${generatedHtml}</textarea>
        `;
    } catch (error) {
        console.error('Error generating portfolio:', error);
        portfolioOutput.innerHTML = `<p style="color: red;">Error generating portfolio: ${error.message}</p>`;
    } finally {
        loadingMessage.style.display = 'none';
    }
  });
});

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
