import { PDFDocument } from 'pdf-lib';

/**
 * Merges multiple PDF files into a single PDF document in the specified order.
 * @param files Array of PDF File objects
 * @param order Indices indicating the order of files to merge
 * @returns Uint8Array of the merged PDF data
 */
export async function mergePdfFiles(files: File[], order: number[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const index of order) {
    const file = files[index];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return await mergedPdf.save();
}

/**
 * Extracts specific pages from a PDF file and returns them as a new PDF.
 * @param file The source PDF File object
 * @param pageNumbers Array of 1-indexed page numbers to extract
 * @returns Uint8Array of the extracted PDF data
 */
export async function splitPdfFile(file: File, pageNumbers: number[]): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  const sourcePdf = await PDFDocument.load(arrayBuffer);
  const splitPdf = await PDFDocument.create();

  // Convert 1-based page numbers to 0-based indices
  const pageCount = sourcePdf.getPageCount();
  const pageIndices = pageNumbers
    .map((num) => num - 1)
    .filter((index) => index >= 0 && index < pageCount);

  if (pageIndices.length === 0) {
    throw new Error('No valid pages selected for extraction');
  }

  const copiedPages = await splitPdf.copyPages(sourcePdf, pageIndices);
  copiedPages.forEach((page) => splitPdf.addPage(page));

  return await splitPdf.save();
}

/**
 * Gets the total page count of a PDF file.
 * @param file PDF File object
 * @returns Promise resolving to the number of pages
 */
export async function getPdfPageCount(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await PDFDocument.load(arrayBuffer);
  return pdf.getPageCount();
}
