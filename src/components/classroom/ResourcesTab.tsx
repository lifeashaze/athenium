import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Book, Loader2, X, FileIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatWindow } from './ChatWindow';
import * as pdfjs from 'pdfjs-dist';

// Ensure the worker is loaded
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Resource {
  id: number;
  title: string;
  url: string;
  uploadedAt: string;
  uploaderId: string;
  fileType: string;
  fileSize: string;
}

interface ResourcesTabProps {
  resources: Resource[];
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources, isUploading, onUpload }) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [chatResource, setChatResource] = useState<Resource | null>(null);
  const [pdfContent, setPdfContent] = useState<string | null>(null);

  console.log('ResourcesTab rendered with resources:', resources);

  const getFileType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'doc':
      case 'docx':
        return 'word';
      case 'xls':
      case 'xlsx':
        return 'excel';
      case 'ppt':
      case 'pptx':
        return 'powerpoint';
      default:
        return 'unknown';
    }
  };

  const extractPdfContent = async (pdfUrl: string) => {
    try {
      const pdf = await pdfjs.getDocument(pdfUrl).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      setPdfContent(fullText);
    } catch (error) {
      setPdfContent(null);
    }
  };

  return (
    <Card>
      <CardContent>
        {resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Book className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Resources Available</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              There are no resources uploaded for this class yet. Be the first to upload study materials!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {resources.map((resource) => {
              const fileType = getFileType(resource.url);
              return (
                <Card key={resource.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="text-lg font-semibold">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground">Date: {new Date(resource.uploadedAt).toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">File Type: {fileType}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => {
                        setSelectedResource(resource);
                        if (fileType === 'pdf') {
                          extractPdfContent(resource.url);
                        }
                      }}>View Resource</Button>
                      <Button onClick={() => {
                        setChatResource(resource);
                        if (fileType === 'pdf') {
                          extractPdfContent(resource.url);
                        }
                      }}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
        <div className="mt-4 flex justify-center">
          <Button
            onClick={() => document.getElementById('fileInput')?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Resource'
            )}
          </Button>
          <input
            id="fileInput"
            type="file"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
            }}
          />
        </div>
      </CardContent>

      <Dialog open={!!selectedResource} onOpenChange={(open) => {
        console.log('Dialog onOpenChange', open);
        if (!open) setSelectedResource(null);
      }}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileIcon className="mr-2 h-5 w-5" />
              {selectedResource?.title}
            </DialogTitle>
            <Button
              variant="ghost"
              className="absolute right-4 top-4"
              onClick={() => setSelectedResource(null)}
            >
            </Button>
          </DialogHeader>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              <strong>Uploaded:</strong> {selectedResource && new Date(selectedResource.uploadedAt).toLocaleString()}
            </p>
          </div>
          <div className="w-full h-[70vh]">
            <iframe
              src={selectedResource?.url}
              className="w-full h-full border-0"
              title={selectedResource?.title}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!chatResource} onOpenChange={() => setChatResource(null)}>
        <DialogContent className="sm:max-w-[90vw] sm:max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Chat about: {chatResource?.title}</DialogTitle>
            <Button
              variant="ghost"
              className="absolute right-4 top-4"
              onClick={() => setChatResource(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="w-full h-[70vh]">
            {chatResource && <ChatWindow pdfUrl={chatResource.url} pdfContent={pdfContent} />}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
