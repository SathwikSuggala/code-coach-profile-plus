
import React, { useEffect, useState, useRef } from "react";
import { apiService } from "../services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquare, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  participantType: string;
  response: string;
}

type ChatPosition = "bottom-right" | "bottom-left" | "top-right" | "top-left";

interface FloatingChatProps {
  position?: ChatPosition;
  initiallyOpen?: boolean;
}

const FloatingChat: React.FC<FloatingChatProps> = ({
  position = "bottom-right",
  initiallyOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Position styles
  const positionClasses = {
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Create new session when component mounts
  useEffect(() => {
    if (isOpen && !sessionId) {
      createNewSession();
    }
  }, [isOpen]);

  // Load session history when sessionId changes
  useEffect(() => {
    if (sessionId) {
      loadSessionHistory();
    }
  }, [sessionId]);

  const createNewSession = async () => {
    try {
      setIsLoading(true);
      const newSessionId = await apiService.createChatSession();
      setSessionId(newSessionId);
      setMessages([]);
      toast.success("New chat session created");
    } catch (error) {
      console.error("Error creating chat session:", error);
      toast.error("Failed to create chat session");
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionHistory = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const history = await apiService.getChatHistory(sessionId);
      setMessages(history);
    } catch (error) {
      console.error("Error loading session history:", error);
      toast.error("Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to UI
      const userMessageObj = {
        participantType: "USER",
        response: JSON.stringify(inputMessage)
      };
      
      setMessages([...messages, userMessageObj]);
      
      // Send to API
      const response = await apiService.sendChatMessage(sessionId, inputMessage);
      
      // Add bot response to UI
      const botResponse = {
        participantType: "CHATBOT",
        response
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Clear input
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message for display
  const formatMessage = (content: string) => {
    try {
      // If content is JSON string, parse it
      if (content.startsWith("\"") && content.endsWith("\"")) {
        return JSON.parse(content);
      }
      return content;
    } catch (e) {
      return content;
    }
  };

  // Toggle chat window
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Toggle expanded view
  const toggleExpandedView = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      {/* Floating button when chat is closed */}
      {!isOpen && (
        <Button
          onClick={toggleChat}
          className={`rounded-full h-14 w-14 shadow-lg fixed z-50 ${positionClasses[position]}`}
        >
          <MessageSquare size={24} />
        </Button>
      )}

      {/* Chat window when open */}
      {isOpen && (
        <Card 
          className={cn(
            "fixed z-50 shadow-xl transition-all duration-300",
            positionClasses[position],
            isExpanded 
              ? "w-[90vw] h-[80vh] inset-x-[5vw] inset-y-[10vh]"
              : "w-[350px] h-[500px]"
          )}
        >
          <CardHeader className="p-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" onClick={toggleExpandedView}>
                {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleChat}>
                <X size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-60px)] flex flex-col">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <p>Welcome! How can I help you today?</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.participantType === "USER" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        message.participantType === "USER"
                          ? "bg-dev-blue text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <pre className="whitespace-pre-wrap break-words font-sans">
                        {formatMessage(message.response)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type your message here..."
                  className="flex-1 resize-none"
                  rows={2}
                />
                <Button 
                  onClick={handleSendMessage} 
                  className="self-end"
                  disabled={isLoading || !inputMessage.trim() || !sessionId}
                >
                  {isLoading ? "..." : "Send"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default FloatingChat;
