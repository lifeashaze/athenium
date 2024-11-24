import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist';
import axios from 'axios';

// Set worker source path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      timeout: 30000, // 30 second timeout for large files
    });

    const uint8Array = new Uint8Array(response.data);
    const loadingTask = pdfjsLib.getDocument({ 
      data: uint8Array,
      // Add performance options
      isEvalSupported: false,
      disableFontFace: true
    });
    
    const pdf = await loadingTask.promise;
    let fullText = '';
    let currentSection = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      // Add page markers for better context
      fullText += `\n=== Page ${i} ===\n${pageText}\n`;
    }

    const cleanedText = fullText
      .replace(/\s+/g, ' ')
      .trim();

    return NextResponse.json({ 
      error: false, 
      content: cleanedText,
      totalPages: pdf.numPages
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
