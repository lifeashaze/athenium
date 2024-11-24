import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';

// 1. Update worker configuration
const PDFJS_WORKER_URL = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// 2. Initialize worker explicitly
if (typeof window === 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
}

const MAX_PAGES = 50; // Limit number of pages to process
const CHUNK_SIZE = 1000; // Characters per chunk

// Add streaming response headers
const headers = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: true, content: 'No URL provided' }, { status: 400 });
    }

    if (!url.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json({ 
        error: true, 
        content: 'Currently only PDF files are supported' 
      }, { status: 400 });
    }

    // Return a streaming response
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Process the PDF in the background and stream the results
    (async () => {
      try {
        // Send initial loading state
        await writer.write(encoder.encode(`data: ${JSON.stringify({ status: 'loading' })}\n\n`));

        // 3. Add error handling for PDF loading
        let uint8Array;
        try {
          const response = await axios.get(url, {
            responseType: 'arraybuffer',
            timeout: 15000,
          });
          uint8Array = new Uint8Array(response.data);
        } catch (error) {
          throw new Error(`Failed to fetch PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // 4. Update PDF loading configuration
        const loadingTask = pdfjsLib.getDocument({
          data: uint8Array,
          isEvalSupported: false,
          disableFontFace: true,
          maxImageSize: 1024 * 1024,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
        });
        
        const pdf = await loadingTask.promise;
        const numPages = Math.min(pdf.numPages, MAX_PAGES);

        // Send total pages info
        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          status: 'processing',
          totalPages: numPages 
        })}\n\n`));

        // Stream each page
        for (let i = 0; i < numPages; i++) {
          const page = await pdf.getPage(i + 1);
          const textContent = await page.getTextContent();
          const pageText = `=== Page ${i + 1} ===\n${
            textContent.items
              .map((item: any) => item.str)
              .join(' ')
          }\n`;

          await writer.write(encoder.encode(`data: ${JSON.stringify({ 
            status: 'processing',
            currentPage: i + 1,
            totalPages: numPages,
            content: pageText 
          })}\n\n`));
        }

        // Send completion signal
        await writer.write(encoder.encode(`data: ${JSON.stringify({ 
          status: 'complete',
          totalPages: numPages 
        })}\n\n`));
        await writer.write(encoder.encode('data: [DONE]\n\n'));
      } catch (error) {
        // 5. Improve error logging
        console.error('PDF processing error:', error);
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? error.stack : undefined
          })}\n\n`)
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, { headers });
  } catch (error) {
    console.error('Route handler error:', error);
    return NextResponse.json({ 
      error: true, 
      content: 'Failed to extract PDF content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
