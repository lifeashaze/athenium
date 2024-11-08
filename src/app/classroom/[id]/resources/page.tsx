'use client'

import { useState, useEffect } from 'react'
import { Book, FileText, FileSpreadsheet, FileImage, File, Video, ChevronRight, Loader2, Upload, Trash2, ChevronDown, Search, Download } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from 'axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

interface Resource {
  id: string
  title: string
  url: string
  uploadedAt: string
  category: string | null
  uploader: {
    firstName: string
    lastName: string
  }
}

interface UploadState {
  isUploading: boolean
  progress: number
}

const getPreviewUrl = (url: string) => {
  const fileExtension = url.split('.').pop()?.toLowerCase();
  const officeExtensions = ['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'];
  
  if (officeExtensions.includes(fileExtension || '')) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
  }
  return `${url}#toolbar=0`;
};

const getFileIcon = (url: string) => {
  const fileExtension = url.split('.').pop()?.toLowerCase();
  
  switch (fileExtension) {
    case 'pdf':
      return <Book className="h-4 w-4 mr-2 text-red-500 shrink-0" />;
    case 'doc':
    case 'docx':
      return <FileText className="h-4 w-4 mr-2 text-blue-500 shrink-0" />;
    case 'xls':
    case 'xlsx':
      return <FileSpreadsheet className="h-4 w-4 mr-2 text-green-500 shrink-0" />;
    case 'ppt':
    case 'pptx':
      return <FileText className="h-4 w-4 mr-2 text-orange-500 shrink-0" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FileImage className="h-4 w-4 mr-2 text-purple-500 shrink-0" />;
    default:
      return <File className="h-4 w-4 mr-2 text-gray-500 shrink-0" />;
  }
};

const RESOURCE_CATEGORIES = [
  { value: "unit-1", label: "Unit 1" },
  { value: "unit-2", label: "Unit 2" },
  { value: "unit-3", label: "Unit 3" },
  { value: "unit-4", label: "Unit 4" },
  { value: "unit-5", label: "Unit 5" },
  { value: "unit-6", label: "Unit 6" },
  { value: "extra", label: "Extra/Misc" }
];

const sortCategories = (a: string, b: string): number => {
  const orderMap = RESOURCE_CATEGORIES.reduce((acc, cat, index) => {
    acc[cat.value] = index;
    return acc;
  }, {} as { [key: string]: number });

  const aOrder = orderMap[a] ?? Number.MAX_SAFE_INTEGER;
  const bOrder = orderMap[b] ?? Number.MAX_SAFE_INTEGER;
  return aOrder - bOrder;
};

const downloadCategoryFiles = async (classroomId: string, category: string, categoryLabel: string) => {
  try {
    const response = await axios.get(`/api/classrooms/${classroomId}/resources/download/${category}`, {
      responseType: 'blob'
    });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${categoryLabel}.zip`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
  }
};

export default function CourseResourcesPage({ params }: { params: { id: string } }) {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0
  })
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>(() => {
    // Initialize all categories as expanded (true)
    return RESOURCE_CATEGORIES.reduce((acc, category) => {
      acc[category.value] = true;
      // Also include 'uncategorized' as expanded
      acc['Uncategorized'] = true;
      return acc;
    }, {} as { [key: string]: boolean });
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [classroomTitle, setClassroomTitle] = useState<string>("")

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const [resourcesResponse, classroomResponse] = await Promise.all([
          fetch(`/api/classrooms/${params.id}/resources`),
          fetch(`/api/classrooms/${params.id}`)
        ])
        
        if (!resourcesResponse.ok) throw new Error('Failed to fetch resources')
        if (!classroomResponse.ok) throw new Error('Failed to fetch classroom')
        
        const resourcesData = await resourcesResponse.json()
        const classroomData = await classroomResponse.json()
        
        setResources(resourcesData)
        setClassroomTitle(classroomData.title)
        if (resourcesData.length > 0) {
          setSelectedResource(resourcesData[0])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load resources')
      } finally {
        setLoading(false)
      }
    }

    fetchResources()
  }, [params.id])

  // Add new function to organize resources by category
  const organizedResources = () => {
    const categoryMap: { [key: string]: Resource[] } = {};
    
    resources.forEach(resource => {
      const category = resource.category || 'Uncategorized';
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(resource);
    });
    
    return categoryMap;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setFileName(fileName);
      setUploadDialogOpen(true);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;

    setUploadState({ isUploading: true, progress: 0 });

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('fileName', fileName);
    if (selectedCategory) {
      formData.append('parentId', selectedCategory);
    }

    try {
      const response = await axios.post(
        `/api/classrooms/${params.id}/resources`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            setUploadState(prev => ({ ...prev, progress }));
          }
        }
      );

      setResources(prev => [...prev, response.data]);
      setUploadDialogOpen(false);
      setSelectedFile(null);
      setSelectedCategory(null);
      setUploadState({ isUploading: false, progress: 0 });
    } catch (error) {
      console.error('Upload failed:', error);
      setError('Failed to upload file');
      setUploadState({ isUploading: false, progress: 0 });
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    try {
      await axios.delete(`/api/classrooms/${params.id}/resources/${resourceId}`);
      setResources(prev => prev.filter(r => r.id !== resourceId));
      setResourceToDelete(null);
    } catch (error) {
      console.error('Failed to delete resource:', error);
      setError('Failed to delete resource');
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filterResources = (resources: Resource[]) => {
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (resource.category || 'uncategorized').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container flex-1 items-start md:grid md:grid-cols-[280px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
        <aside className="fixed top-0 z-30 -ml-2 hidden h-[calc(100vh-4rem)] w-full shrink-0 md:sticky md:block">
          <ScrollArea className="h-full py-6 pl-8 pr-6 lg:py-8">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Resources</h2>
              
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search resources..."
                  className="pl-8 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="w-full">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button 
                  size="sm" 
                  className="cursor-pointer w-full"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Resource
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm py-4">{error}</div>
            ) : (
              <nav className="grid items-start gap-2 mt-4">
                {Object.entries(organizedResources())
                  .sort(([a], [b]) => sortCategories(a, b))
                  .map(([category, categoryResources]) => {
                    const filteredResources = filterResources(categoryResources);
                    if (filteredResources.length === 0) return null;
                    
                    const categoryLabel = RESOURCE_CATEGORIES.find(c => c.value === category)?.label || 'Uncategorized';
                    
                    return (
                      <div key={category} className="space-y-1">
                        <div className="flex items-center gap-1 py-2 w-full">
                          <button
                            onClick={() => toggleCategory(category)}
                            className="flex items-center gap-1 flex-1 hover:bg-accent rounded-lg px-2"
                          >
                            <ChevronDown 
                              className={`h-4 w-4 text-muted-foreground transition-transform ${
                                expandedCategories[category] ? '' : '-rotate-90'
                              }`} 
                            />
                            <h3 className="text-sm font-medium text-muted-foreground flex-1 text-left">
                              {categoryLabel}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {filteredResources.length}
                            </span>
                          </button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => downloadCategoryFiles(params.id, category, categoryLabel)}
                            title="Download all files in category"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {expandedCategories[category] && (
                          <div className="grid gap-1 pl-4">
                            {filteredResources.map((resource) => (
                              <div key={resource.id} className="group relative">
                                <button
                                  onClick={() => setSelectedResource(resource)}
                                  className={`w-full flex items-start py-2 px-3 rounded-lg hover:bg-accent transition-colors text-left ${
                                    selectedResource?.id === resource.id ? 'bg-accent' : ''
                                  }`}
                                >
                                  {getFileIcon(resource.url)}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium leading-tight break-words">
                                      {resource.title}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setResourceToDelete(resource);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </nav>
            )}
          </ScrollArea>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Resource</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Selected File:</p>
                  <p className="text-sm text-muted-foreground">{selectedFile?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">File Name:</p>
                  <Input 
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Category: <span className="text-red-500">*</span></p>
                  <Select value={selectedCategory || ''} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => {
                    setUploadDialogOpen(false);
                    setSelectedFile(null);
                    setSelectedCategory(null);
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUploadSubmit} 
                    disabled={uploadState.isUploading || !selectedCategory}
                  >
                    {uploadState.isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </aside>
        <main className="flex w-full flex-col overflow-hidden">
          <h1 className="text-2xl font-bold mb-4">
            {classroomTitle}
          </h1>
          <Card className="flex-1">
            <CardContent className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : !selectedResource ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a resource to view</p>
                </div>
              ) : (
                <div className="w-full h-[calc(100vh-8rem)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                      {selectedResource.title}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedResource.url;
                        link.download = selectedResource.title;
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <iframe
                    src={getPreviewUrl(selectedResource.url)}
                    className="w-full h-[calc(100%-3rem)] border-0 rounded-lg"
                    title={selectedResource.title}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      <AlertDialog 
        open={!!resourceToDelete} 
        onOpenChange={(open) => !open && setResourceToDelete(null)}
      >
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
              onClick={() => resourceToDelete && handleDeleteResource(resourceToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


