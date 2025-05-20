import React, { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, PlusCircle } from "lucide-react";
import { API_BASE_URL } from "@/services/apiService";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

interface Message {
  participantType: string;
  response: string;
}

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-100 rounded-lg w-fit">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span className="text-sm text-gray-500">Assistant is typing...</span>
    </div>
  );
};

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchRecentSession = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/chat/recentChatId`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data) {
            setSessionId(data);
            // Fetch chat history for this session
            const historyResponse = await fetch(`${API_BASE_URL}/chat/sessionHistory/${data}`, {
              method: "GET",
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
              },
            });

            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              if (!historyData.error) {
                setMessages(historyData);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching recent session:", error);
      }
    };

    if (isOpen) {
      fetchRecentSession();
    }
  }, [isOpen]);

  // Check if current route is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  // Don't render anything on auth pages
  if (isAuthPage) {
    return null;
  }

  const createNewSession = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/createNewSession`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setMessages([]); // Clear messages for new session
        toast.success("New chat session created!");
      }
    } catch (error) {
      console.error("Error creating new session:", error);
      toast.error("Failed to create new session");
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to UI
      const userMessageObj = {
        participantType: "USER",
        response: inputMessage
      };
      
      setMessages([...messages, userMessageObj]);
      
      // Send to API
      const response = await fetch(`${API_BASE_URL}/chat/sessionChat/${sessionId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(inputMessage)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const botResponse = {
        participantType: "CHATBOT",
        response: data.response || data
      };
      
      setMessages(prev => [...prev, botResponse]);
      setInputMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-4 z-50">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      ) : (
        <Card className="w-[400px] shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-bold">Chat Assistant</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={createNewSession}
                variant="outline"
                size="sm"
                className="h-8"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Session
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-[300px] overflow-y-auto border rounded-lg p-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 ${
                      message.participantType === "USER" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block p-3 rounded-lg ${
                        message.participantType === "USER"
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {message.response}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="mb-4 text-left">
                    <TypingIndicator />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloatingChat;
