'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Book, FileText, FileSpreadsheet, FileImage, File, Video, ChevronRight, Loader2, Upload, Trash2, ChevronDown, Search, Download, FolderOpen, Bot, User, Send } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import axios from 'axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser } from '@clerk/nextjs';
import { generateWithGemini, generateWithGeminiStream } from '@/lib/utils/gemini';
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from 'react-markdown'
import { Badge } from "@/components/ui/badge"
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import DocumentChat from '@/components/classroom/DocumentChat';

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

interface User {
  id: string;
  firstName: string;
  email: string;
  role: "STUDENT" | "PROFESSOR" | "ADMIN";
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
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

const ResourceItemSkeleton = () => (
  <div className="flex items-start py-2 px-3 rounded-lg">
    <Skeleton className="h-4 w-4 mr-2" />
    <Skeleton className="h-4 flex-1" />
  </div>
);

const CategorySkeleton = () => (
  <div className="space-y-1">
    <div className="flex items-center gap-1 py-2">
      <Skeleton className="h-4 w-4" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-4 ml-auto" />
    </div>
    <div className="pl-4 space-y-2">
      {[...Array(3)].map((_, i) => (
        <ResourceItemSkeleton key={i} />
      ))}
    </div>
  </div>
);

const MobileView = ({ 
  resources, 
  selectedResource, 
  setSelectedResource, 
  handleDeleteResource,
  dbUser,
  classroomTitle,
  searchQuery,
  setSearchQuery,
  params,
  setResourceToDelete,
  organizedResources,
  sortCategories,
  RESOURCE_CATEGORIES,
  getFileIcon,
  downloadCategoryFiles,
  getPreviewUrl
}: {
  resources: Resource[];
  selectedResource: Resource | null;
  setSelectedResource: (resource: Resource | null) => void;
  handleDeleteResource: (id: string) => void;
  dbUser: User | null;
  classroomTitle: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  params: { id: string };
  setResourceToDelete: (resource: Resource | null) => void;
  organizedResources: () => { [key: string]: Resource[] };
  sortCategories: (a: string, b: string) => number;
  RESOURCE_CATEGORIES: { value: string; label: string; }[];
  getFileIcon: (url: string) => JSX.Element;
  downloadCategoryFiles: (classroomId: string, category: string, categoryLabel: string) => Promise<void>;
  getPreviewUrl: (url: string) => string;
}) => {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <h1 className="text-lg font-bold">{classroomTitle}</h1>
      </div>

      {/* Mobile Content */}
      {selectedResource ? (
        // Document Preview Mode
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedResource(null)}
            >
              <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
              Back
            </Button>
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
          <div className="flex-1">
            <iframe
              src={getPreviewUrl(selectedResource.url)}
              className="w-full h-full border-0"
              title={selectedResource.title}
            />
          </div>
        </div>
      ) : (
        // Resource List Mode
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sticky top-0 bg-background border-b">
            <Input
              placeholder="Search resources..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="p-4">
            {Object.entries(organizedResources())
              .sort(([a], [b]) => sortCategories(a, b))
              .map(([category, categoryResources]) => {
                const categoryLabel = RESOURCE_CATEGORIES.find(c => c.value === category)?.label || 'Uncategorized';
                
                return (
                  <div key={category} className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm text-muted-foreground">
                        {categoryLabel}
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadCategoryFiles(params.id, category, categoryLabel)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      {categoryResources.map((resource) => (
                        <div key={resource.id} className="w-full">
                          {dbUser?.role === 'PROFESSOR' ? (
                            // Version with delete button for professors
                            <div className="flex items-center p-3 rounded-lg bg-accent/50 hover:bg-accent">
                              <button
                                onClick={() => setSelectedResource(resource)}
                                className="flex items-center flex-1"
                              >
                                {getFileIcon(resource.url)}
                                <span className="flex-1 text-left text-sm">
                                  {resource.title}
                                </span>
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2"
                                onClick={() => setResourceToDelete(resource)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            // Simpler version for students
                            <button
                              onClick={() => setSelectedResource(resource)}
                              className="w-full flex items-center p-3 rounded-lg bg-accent/50 hover:bg-accent"
                            >
                              {getFileIcon(resource.url)}
                              <span className="flex-1 text-left text-sm">
                                {resource.title}
                              </span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Upload FAB for professors */}
      {dbUser?.role === 'PROFESSOR' && !selectedResource && (
        <Button 
          className="fixed bottom-4 right-4 rounded-full shadow-lg"
          size="icon"
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <Upload className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
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
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const [dbUser, setDbUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [documentContent, setDocumentContent] = useState<string>('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await axios.get('/api/user');
      setDbUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  }, []);

  useEffect(() => {
    if (isUserLoaded && clerkUser) {
      fetchUserData();
    }
  }, [isUserLoaded, clerkUser, fetchUserData]);

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
      
      // Clear the selected resource if it's the one being deleted
      if (selectedResource?.id === resourceId) {
        setSelectedResource(null);
      }
      
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const extractDocumentContent = async (url: string) => {
    try {
      setChatMessages([]);
      setIsChatLoading(true);

      const response = await fetch(`/api/extract-content?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      if (data.error) {
        setDocumentContent('');
        setChatMessages([{
          role: 'assistant',
          content: `${data.content}${data.details ? `\n\nTechnical details: ${data.details}` : ''}`
        }]);
      } else {
        setDocumentContent(data.content);
        // Simple confirmation message instead of analysis
        setChatMessages([{
          role: 'assistant',
          content: 'I have successfully processed the document. Feel free to ask any questions about it!'
        }]);
      }
    } catch (error) {
      console.error('Failed to extract document content:', error);
      setDocumentContent('');
      setChatMessages([{
        role: 'assistant',
        content: 'Sorry, I was unable to process this document. Please try with a different file.'
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const scrollToBottom = () => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !documentContent || isChatLoading) return;
    
    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsChatLoading(true);

    try {
      let accumulatedResponse = '';
      const stream = generateWithGeminiStream(userInput, documentContent);
      
      for await (const chunk of stream) {
        accumulatedResponse += chunk;
        scrollToBottom();
      }

      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: accumulatedResponse 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [
        ...prev,
        { 
          role: 'assistant', 
          content: 'Sorry, I encountered an error while processing your question. Please try again.'
        }
      ]);
    } finally {
      setIsChatLoading(false);
      scrollToBottom();
    }
  };

  useEffect(() => {
    if (selectedResource) {
      // Reset chat messages and document content
      setChatMessages([]);
      setDocumentContent('');
      setUserInput('');
      
      // Then extract new document content
      extractDocumentContent(selectedResource.url);
    }
  }, [selectedResource]); // Only trigger when selectedResource changes

  useEffect(() => {
    // Scroll when messages change or when loading state changes
    scrollToBottom();
  }, [chatMessages, isChatLoading]);

  if (isMobile) {
    return (
      <MobileView
        resources={resources}
        selectedResource={selectedResource}
        setSelectedResource={setSelectedResource}
        handleDeleteResource={handleDeleteResource}
        dbUser={dbUser}
        classroomTitle={classroomTitle}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        params={params}
        setResourceToDelete={setResourceToDelete}
        organizedResources={organizedResources}
        sortCategories={sortCategories}
        RESOURCE_CATEGORIES={RESOURCE_CATEGORIES}
        getFileIcon={getFileIcon}
        downloadCategoryFiles={downloadCategoryFiles}
        getPreviewUrl={getPreviewUrl}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Button
        variant="ghost"
        size="sm"
        className="fixed bottom-4 right-4 z-50 rounded-full p-3 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <ChevronRight className={`h-4 w-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
      </Button>

      <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] lg:grid-cols-[320px_1fr]">
        <aside className={`
          fixed inset-y-0 left-0 z-30 w-[280px] lg:w-[320px] bg-background
          transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0
        `}>
          <ScrollArea className="h-screen py-6 px-4">
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

              {dbUser?.role === 'PROFESSOR' && (
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
              )}
            </div>

            {loading ? (
              <div className="space-y-4 mt-4">
                {[...Array(5)].map((_, i) => (
                  <CategorySkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <div className="text-red-500 text-sm py-4">{error}</div>
            ) : resources.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <FolderOpen className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <p className="text-sm text-muted-foreground mb-2">No resources available yet</p>
                <p className="text-xs text-muted-foreground">
                  Check back later for course materials.
                </p>
              </div>
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
                                {dbUser?.role === 'PROFESSOR' ? (
                                  // Version with delete button for professors
                                  <div className={`flex items-start py-2 px-3 rounded-lg hover:bg-accent transition-colors ${
                                    selectedResource?.id === resource.id ? 'bg-accent' : ''
                                  }`}>
                                    <button
                                      onClick={() => setSelectedResource(resource)}
                                      className="flex items-start flex-1"
                                    >
                                      {getFileIcon(resource.url)}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium leading-tight break-words">
                                          {resource.title}
                                        </p>
                                      </div>
                                    </button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => setResourceToDelete(resource)}
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                ) : (
                                  // Simpler version for students
                                  <button
                                    onClick={() => setSelectedResource(resource)}
                                    className={`w-full flex items-start py-2 px-3 rounded-lg hover:bg-accent transition-colors ${
                                      selectedResource?.id === resource.id ? 'bg-accent' : ''
                                    }`}
                                  >
                                    {getFileIcon(resource.url)}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium leading-tight break-words">
                                        {resource.title}
                                      </p>
                                    </div>
                                  </button>
                                )}
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
        <main className="flex-1 p-4 md:p-6">
          <h1 className="text-xl md:text-2xl font-bold mb-4">
            {classroomTitle}
          </h1>
          
          <Card className="flex-1">
            <CardContent className="p-2 sm:p-4 md:p-6">
              {selectedResource ? (
                <div className="w-full h-[calc(100vh-8rem)]">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                    <h2 className="text-lg md:text-xl font-semibold truncate">
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
                  <div className="flex h-[calc(100%-3rem)]">
                    <div className="flex-[0.65]">
                      <iframe
                        src={getPreviewUrl(selectedResource.url)}
                        className="w-full h-full border-0 rounded-lg"
                        title={selectedResource.title}
                      />
                    </div>
                    
                    <DocumentChat 
                      documentContent={documentContent}
                      chatMessages={chatMessages}
                      setChatMessages={setChatMessages}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center h-[calc(100vh-16rem)]">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Course Materials</h3>
                  <p className="text-sm max-w-sm text-muted-foreground">
                    Select a resource from the sidebar to view course materials and other learning resources shared by your instructor.
                  </p>
                  <div className="mt-6 flex flex-col items-center gap-2 text-sm">
                    <p className="font-medium">Quick Tips:</p>
                    <ul className="list-disc text-left text-muted-foreground">
                      <li>Use the search bar to find specific materials</li>
                      <li>Click on any file to preview it</li>
                      <li>Use the download button to save files for offline access</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

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


