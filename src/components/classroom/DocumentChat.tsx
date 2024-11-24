import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { generateWithGeminiStream } from '@/lib/utils/gemini';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface DocumentChatProps {
  documentContent: string;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export default function DocumentChat({ documentContent, chatMessages, setChatMessages }: DocumentChatProps) {
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !documentContent || isChatLoading) return;
    const newUserMessage: ChatMessage = { role: 'user', content: userInput };
    setChatMessages([...chatMessages, newUserMessage]);
    setUserInput('');
    setIsChatLoading(true);

    try {
      let accumulatedResponse = '';
      const stream = generateWithGeminiStream(userInput, documentContent);
      
      for await (const chunk of stream) {
        accumulatedResponse += chunk;
        scrollToBottom();
      }

      setChatMessages((prev: ChatMessage[]) => [...prev, { 
        role: 'assistant' as const, 
        content: accumulatedResponse 
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages((prev: ChatMessage[]) => [
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
    scrollToBottom();
  }, [chatMessages]);

  if (!documentContent) {
    return (
      <div className="flex-[0.35] border-l flex flex-col h-full bg-background">
        <div className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <div>
            <h3 className="font-semibold">Processing Document</h3>
            <p className="text-sm text-muted-foreground">Please wait while we analyze the content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-[0.35] border-l flex flex-col h-full bg-background">
      <div className="p-4 border-b flex items-center gap-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">Document Chat</h3>
          <p className="text-sm text-muted-foreground">Ask questions about this document</p>
        </div>
      </div>
      
      <ScrollArea 
        className="flex-1 p-4" 
        ref={scrollAreaRef}
      >
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`flex gap-4 mb-6 ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.role !== 'user' && (
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}
            <div
              className={`rounded-xl px-4 py-2.5 max-w-[80%] ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-12'
                  : 'bg-accent/50 border'
              }`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown
                  components={{
                    h3: ({ children }) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground">
                        {children}
                      </blockquote>
                    ),
                    code: ({ node, inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || '');
                      const language = match ? match[1] : 'text';
                      
                      if (inline) {
                        return (
                          <code className="bg-muted px-1.5 py-0.5 rounded-md text-sm" {...props}>
                            {children}
                          </code>
                        );
                      }
                      
                      return (
                        <div className="relative rounded-md my-4">
                          <div className="absolute top-0 right-0 px-3 py-1 text-xs text-muted-foreground rounded-tr-md rounded-bl-md bg-muted">
                            {language}
                          </div>
                          <SyntaxHighlighter
                            language={language}
                            style={oneDark as any}
                            customStyle={{
                              margin: 0,
                              borderRadius: '0.375rem',
                              padding: '1.5rem 1rem'
                            }}
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        </div>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            )}
          </div>
        ))}
        {isChatLoading && (
          <div className="flex justify-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="rounded-xl px-4 py-2.5 bg-accent/50 border">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          </div>
        )}
      </ScrollArea>
      
      <form onSubmit={handleChatSubmit} className="p-4 border-t">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Badge variant={documentContent ? "default" : "secondary"} className="px-3 py-1">
              <Bot className="h-3.5 w-3.5 mr-1" />
              {documentContent ? "Ready to answer" : "Processing document..."}
            </Badge>
          </div>
          <div className="relative flex gap-2">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask about this document..."
              className="min-h-[80px] pr-12 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (userInput.trim()) {
                    handleChatSubmit(e);
                  }
                }
              }}
            />
            <Button 
              type="submit" 
              disabled={isChatLoading || !documentContent}
              size="icon"
              className="absolute right-2 bottom-2 h-8 w-8"
            >
              {isChatLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
} 