import React, { useState } from 'react';
import Link from "next/link";
import { Book, Loader2, X, FileIcon, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChatWindow } from './ChatWindow';

interface Resource {
  id: number;
  title: string;
  url: string;
  uploadedAt: string;
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
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <h3 className="text-lg font-semibold">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground">Date: {new Date(resource.uploadedAt).toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => setSelectedResource(resource)}>View Resource</Button>
                    <Button onClick={() => setChatResource(resource)}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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

      <Dialog open={!!selectedResource} onOpenChange={() => setSelectedResource(null)}>
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
            {chatResource && <ChatWindow pdfUrl={chatResource.url} />}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
