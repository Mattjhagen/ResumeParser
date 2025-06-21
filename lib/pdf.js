import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/**
 * Extracts plain text from PDF buffer using pdfjs-dist
 */
export async function extractTextFromPDF(buffer) {
  const uint8array = new Uint8Array(buffer);
  const doc = await getDocument({ data: uint8array }).promise;
  let fullText = "";

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => item.str).join(" ");
    fullText += pageText + "\n";
  }

  return fullText;
}
