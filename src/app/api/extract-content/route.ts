import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const MAX_PAGES = 50; // Limit number of pages to process
const CHUNK_SIZE = 1000; // Characters per chunk

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

    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 15000, // Reduced timeout
    });

    const uint8Array = new Uint8Array(response.data);
    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array,
      isEvalSupported: false,
      disableFontFace: true,
      maxImageSize: 1024 * 1024, // Limit image size
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
    });
    
    const pdf = await loadingTask.promise;
    const numPages = Math.min(pdf.numPages, MAX_PAGES);
    let fullText = '';
    
    // Process pages in parallel
    const pagePromises = Array.from({ length: numPages }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const textContent = await page.getTextContent();
      return `=== Page ${i + 1} ===\n${
        textContent.items
          .map((item: any) => item.str)
          .join(' ')
      }`;
    });

    const pageTexts = await Promise.all(pagePromises);
    fullText = pageTexts.join('\n');

    // Clean and chunk the text
    const cleanedText = fullText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, CHUNK_SIZE * 15); // Limit total content size

    return NextResponse.json({ 
      error: false, 
      content: cleanedText,
      totalPages: numPages
    });

  } catch (error) {
    console.error('PDF extraction error:', error);
    return NextResponse.json({ 
      error: true, 
      content: 'Failed to extract PDF content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
