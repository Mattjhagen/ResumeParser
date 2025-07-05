// plugin.js

async function generatePortfolio(file) {
  // 1. Extract text from the PDF
  const pdfjsLib = window['pdfjs-dist/build/pdf'];
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let textContent = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const text = await page.getTextContent();
    textContent += text.items.map(item => item.str).join(' ');
  }

  // 2. Call a server-side endpoint to generate the portfolio
  const response = await fetch('/generate-portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resumeText: textContent.slice(0, 3000) })
  });

  if (!response.ok) {
    throw new Error('Failed to generate portfolio');
  }

  const { html } = await response.json();

  // 3. Open the generated HTML in a new tab
  const newTab = window.open();
  newTab.document.write(html);
  newTab.document.close();
}
