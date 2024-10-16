import React from 'react';
import Link from "next/link";
import { useDropzone } from 'react-dropzone';
import { Book, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Resource {
  id: number;
  title: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface ResourcesTabProps {
  resources: Resource[];
  isUploading: boolean;
  onUpload: (file: File) => Promise<void>;
}

export const ResourcesTab: React.FC<ResourcesTabProps> = ({ resources, isUploading, onUpload }) => {
  const onDrop = React.useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) await onUpload(file);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

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
                    <p className="text-sm text-muted-foreground">Uploaded by: {resource.uploadedBy}</p>
                    <p className="text-sm text-muted-foreground">Date: {new Date(resource.uploadedAt).toLocaleString()}</p>
                  </div>
                  <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                    <Button>View Resource</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-4">
          <div {...getRootProps()} className="border-2 border-dashed rounded-md p-4 text-center cursor-pointer">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here ...</p>
            ) : (
              <p>Drag n drop a file here, or click to select a file</p>
            )}
          </div>
          <div className="mt-2 flex justify-center">
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
        </div>
      </CardContent>
    </Card>
  );
};
