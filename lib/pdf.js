import pdfParse from "pdf-parse";

/**
 * Wraps pdf-parse safely to avoid ENOENT test crashes
 */
export async function extractTextFromPDF(buffer) {
  const { text } = await pdfParse(buffer);
  return text;
}
