import React, { useState, useEffect } from 'react';
import Link from "next/link";
import { Book, Loader2, X, FileIcon, MessageCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatWindow } from './ChatWindow';
import * as pdfjs from 'pdfjs-dist';
import mammoth from 'mammoth';
import XLSX from 'xlsx';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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
  content?: string;
}

interface ResourcesTabProps {
  resources: Resource[];
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
  onDelete?: (resourceId: number) => Promise<void>;
}

const getPreviewUrl = (url: string) => {
  const fileExtension = url.split('.').pop()?.toLowerCase();
  const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
  
  if (officeExtensions.includes(fileExtension || '')) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }
  return `${url}#toolbar=0`;
};

const extractContent = async (url: string, fileType: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    switch (fileType) {
      case 'pdf':
        const pdf = await pdfjs.getDocument(url).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        return fullText;

      case 'word':
        const arrayBuffer = await blob.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;

      case 'excel':
        const data = await blob.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        let excelText = '';
        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          excelText += `Sheet: ${sheetName}\n${XLSX.utils.sheet_to_txt(sheet)}\n\n`;
        });
        return excelText;

      default:
        return null;
    }
  } catch (error) {
    console.error('Error extracting content:', error);
    return null;
  }
};

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
    default:
      return 'unknown';
  }
};

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources, isUploading, onUpload, onDelete }) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [chatResource, setChatResource] = useState<Resource | null>(null);
  const [documentContent, setDocumentContent] = useState<string | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  console.log('ResourcesTab rendered with resources:', resources);

  const handleResourceSelection = async (resource: Resource) => {
    const fileType = getFileType(resource.url);
    const content = await extractContent(resource.url, fileType);
    setDocumentContent(content);
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
                        handleResourceSelection(resource);
                      }}>View Resource</Button>
                      <Button onClick={() => {
                        setChatResource(resource);
                        handleResourceSelection(resource);
                      }}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="icon"
                        onClick={() => setResourceToDelete(resource)}
                      >
                        <Trash2 className="h-4 w-4" />
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
        <AlertDialog open={!!resourceToDelete} onOpenChange={(open: any) => !open && setResourceToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete &quot;{resourceToDelete?.title}&quot;. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (resourceToDelete && onDelete) {
                    await onDelete(resourceToDelete.id);
                    setResourceToDelete(null);
                  }
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
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
              src={selectedResource ? getPreviewUrl(selectedResource.url) : ''}
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
            {chatResource && <ChatWindow 
              pdfUrl={chatResource.url} 
              pdfContent={documentContent} 
            />}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
