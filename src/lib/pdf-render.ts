export interface RenderedPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

// Function to initialize pdfjs-dist on demand client-side
async function getPdfJs() {
  const pdfjs = await import('pdfjs-dist');
  
  if (typeof window !== 'undefined') {
    const version = pdfjs.version || '4.10.38';
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  }
  
  return pdfjs;
}

/**
 * Renders the first page of a PDF file as a thumbnail data URL.
 * @param file PDF File object
 * @param scale Quality scale factor (0.3 - 0.5 recommended for thumbnails)
 * @returns Promise resolving to a base64 image data URL
 */
export async function renderPdfThumbnail(file: File, scale = 0.4): Promise<string> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  });
  
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);
  
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  if (!context) {
    throw new Error('Failed to get canvas 2d context');
  }
  
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas,
  }).promise;
  
  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  
  page.cleanup();
  await pdf.cleanup();
  
  return dataUrl;
}

/**
 * Renders all pages of a PDF file as thumbnails for the Split grid view.
 * @param file PDF File object
 * @param scale Quality scale factor
 * @param onProgress Callback to report render progress (0 to 1)
 * @returns Promise resolving to an array of RenderedPage objects
 */
export async function renderAllPdfPages(
  file: File,
  scale = 0.5,
  onProgress?: (progress: number) => void
): Promise<RenderedPage[]> {
  const pdfjs = await getPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
    disableFontFace: true,
  });
  
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const renderedPages: RenderedPage[] = [];
  
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      page.cleanup();
      continue;
    }
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    await page.render({
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    }).promise;
    
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    
    renderedPages.push({
      pageNumber: i,
      dataUrl,
      width: viewport.width,
      height: viewport.height,
    });
    
    page.cleanup();
    
    if (onProgress) {
      onProgress(i / totalPages);
    }
  }
  
  await pdf.cleanup();
  return renderedPages;
}
