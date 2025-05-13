
import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import { apiService } from "../services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MessageSquare, Code, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Message {
  participantType: string;
  response: string;
}

const Chat = () => {
  const [chatMode, setChatMode] = useState("general"); // general, code-review, or session
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Create new session when in session chat mode
  useEffect(() => {
    if (chatMode === "session" && !sessionId) {
      createNewSession();
    }
  }, [chatMode]);

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
    if (!inputMessage.trim() && chatMode !== "code-review") return;
    if (chatMode === "code-review" && !codeInput.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to UI
      const userMessage = chatMode === "code-review" ? codeInput : inputMessage;
      const userMessageObj = {
        participantType: "USER",
        response: JSON.stringify(userMessage)
      };
      
      setMessages([...messages, userMessageObj]);
      
      // Send to API
      let response;
      if (chatMode === "general") {
        response = await fetch("https://capstone-1-y2mc.onrender.com/api/chat", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(inputMessage)
        });
      } else if (chatMode === "code-review") {
        response = await fetch("https://capstone-1-y2mc.onrender.com/api/chat/codeReview", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(codeInput)
        });
      } else if (chatMode === "session" && sessionId) {
        response = await fetch(`https://capstone-1-y2mc.onrender.com/api/chat/sessionChat/${sessionId}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(inputMessage)
        });
      }
      
      if (!response || !response.ok) {
        throw new Error(`HTTP error! status: ${response?.status}`);
      }
      
      const data = await response.json();
      
      // Add bot response to UI
      const botResponse = {
        participantType: "CHATBOT",
        response: chatMode === "session" ? data.response : data
      };
      
      setMessages(prev => [...prev, botResponse]);
      
      // Clear input
      setInputMessage("");
      if (chatMode === "code-review") {
        setCodeInput("");
      }
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

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
        <p className="text-gray-600">
          Get help with coding questions or general queries
        </p>
      </div>

      <Tabs defaultValue="general" value={chatMode} onValueChange={setChatMode} className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <MessageSquare size={16} />
            <span>General Chat</span>
          </TabsTrigger>
          <TabsTrigger value="code-review" className="flex items-center gap-2">
            <Code size={16} />
            <span>Code Review</span>
          </TabsTrigger>
          <TabsTrigger value="session" className="flex items-center gap-2">
            <Zap size={16} />
            <span>Session Chat</span>
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>
                {chatMode === "general" && "General Chat"}
                {chatMode === "code-review" && "Code Review"}
                {chatMode === "session" && `Session Chat #${sessionId || ""}`}
              </CardTitle>
              {chatMode === "session" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={createNewSession}
                  disabled={isLoading}
                >
                  New Session
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-4 h-[calc(100vh-16rem)] flex flex-col">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    <p>No messages yet. Start a conversation!</p>
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
              <TabsContent value="general" className="mt-0">
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here..."
                    className="flex-1"
                    rows={3}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="self-end"
                    disabled={isLoading || !inputMessage.trim()}
                  >
                    {isLoading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="code-review" className="mt-0">
                <div className="space-y-2">
                  <Textarea
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value)}
                    placeholder="Paste your code here for review..."
                    className="font-mono text-sm"
                    rows={6}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="w-full"
                    disabled={isLoading || !codeInput.trim()}
                  >
                    {isLoading ? "Analyzing..." : "Analyze Code"}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="session" className="mt-0">
                <div className="flex gap-2">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type your message here..."
                    className="flex-1"
                    rows={3}
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    className="self-end"
                    disabled={isLoading || !inputMessage.trim() || !sessionId}
                  >
                    {isLoading ? "Sending..." : "Send"}
                  </Button>
                </div>
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </Layout>
  );
};

export default Chat;
