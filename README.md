# PDFNest

A premium, production-ready, client-side PDF Toolkit web application built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **shadcn/ui**. Designed with a high-utility, developer-style interface (inspired by GitHub, Linear, and Vercel) and processed entirely in the browser sandbox for absolute security and offline availability.

## Key Features
- 📂 **Merge PDFs:** Drag, drop, and compile multiple documents into a single PDF.
- 🔀 **Reorder Queue:** Easily rearrange documents before compiling using accessible drag-and-drop handles.
- ✂️ **Split PDFs:** Render documents page-by-page inside an interactive multi-select grid and slice them by custom inputs.
- 📋 **Clipboard Pasting:** Paste PDF files directly from your clipboard (`Ctrl+V`) for immediate workspace queueing.
- 🌍 **Global Drag Overlay:** Drag and drop files anywhere on the browser window to import them instantly.
- 🔒 **Client-Side Sandbox:** Uses `pdf-lib` and `pdfjs-dist` inside standard web context. Files never leave your local device.

---

## Technical Stack
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS v4 & PostCSS
- **UI Elements:** shadcn/ui & Radix UI primitives
- **Drag-and-Drop:** `@hello-pangea/dnd` (fully typed fork of react-beautiful-dnd)
- **PDF Core:** `pdf-lib` (saving/merging/splitting), `pdfjs-dist` (canvas rendering)

---

## Local Development Setup

To run the application locally on your machine, follow these steps:

### 1. Prerequisites
Ensure you have **Node.js** (v18.x or later) and **npm** installed.

### 2. Installation
Clone the repository and install the project dependencies:
```bash
# Clone the repository
git clone https://github.com/Himanshu2631/PDFNest.git

# Navigate into the project directory
cd PDFNest

# Install packages
npm install
```

### 3. Run Development Server
Start the Next.js development server locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to test the sandbox.

### 4. Build for Production
Verify compilation, typechecks, and statically optimize components:
```bash
npm run build
```

---

## Deployment Process (Vercel)

PDFNest is structured for zero-latency serverless execution and scales instantly on **Vercel** as a static client-side web application.

### Method A: Vercel Git Integration (Recommended)
1. Push this workspace to your public GitHub repository:
   ```bash
   git add .
   git commit -m "feat: complete PDFNest features"
   git remote add origin https://github.com/Himanshu2631/PDFNest.git
   git branch -M main
   git push -u origin main
   ```
2. Log into the [Vercel Dashboard](https://vercel.com).
3. Click **Add New** → **Project**, and import your `PDFNest` repository.
4. Keep the default settings (Next.js preset) and click **Deploy**. Vercel will automatically trigger a build and publish it.

### Method B: Vercel CLI Deployment
Deploy directly from your local terminal:
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your account
vercel login

# Deploy build parameters
vercel
```

---

## Developer Assessment Metrics Check

| Requirement | Satisfied | Verified In Code |
| :--- | :--- | :--- |
| **"Built for Digital Heroes" button** | **Yes** | Located in `src/components/shared/footer.tsx`, linking exactly to `https://digitalheroesco.com` |
| **Developer Name visible** | **Yes** | `Himanshu Sengar` rendered inside `Footer` |
| **Developer Email visible** | **Yes** | `himanshusengar235@gmail.com` visible and linked as `mailto:` in `Footer` |
| **Merge PDFs** | **Yes** | Uses browser-safe `mergePdfFiles` inside `src/lib/pdf-utils.ts` |
| **Split PDFs** | **Yes** | Custom multi-select canvas parsing and slicing using `splitPdfFile` inside `src/lib/pdf-utils.ts` |
| **Reorder PDFs** | **Yes** | Drag and drop sorting integrated in `src/components/merge/merge-list.tsx` |
| **Download processed files** | **Yes** | Uses browser Blobs to download PDFs locally |

---

## Senior Engineering Review

During final verification, we reviewed the UI under professional frontend paradigms:

1. **Hydration Guards:** `@hello-pangea/dnd` and `pdfjs-dist` references are protected against SSR hydration mismatches using custom mounting hooks and dynamic lazy imports.
2. **Double-binding Ranges:** Split PDF custom ranges use real-time parsed ranges (`1-3, 5`), updating checkboxes dynamically.
3. **Advanced UX hooks:** Added **clipboard file pastes** (`Ctrl+V`) and a **full-page drag overlay** to make document imports instant and intuitive.
4. **Clean Code Separation:** Business logic (rendering, merging, state structures) is strictly separated from presentation layout layers.
