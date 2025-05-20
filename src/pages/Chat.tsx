import React, { useEffect, useState, useRef } from "react";
import Layout from "../components/Layout";
import { apiService, API_BASE_URL } from "../services/apiService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Code } from "lucide-react";

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
      <span className="text-sm text-gray-500">Analyzing code...</span>
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!codeInput.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message to UI
      const userMessageObj = {
        participantType: "USER",
        response: JSON.stringify(codeInput)
      };
      
      setMessages([...messages, userMessageObj]);
      
      // Send to API
      const response = await fetch(`${API_BASE_URL}/chat/codeReview`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("jwt")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(codeInput)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Format the response based on the structure
      let formattedResponse = '';
      if (data.optimizationSuggestions) {
        formattedResponse = `
          <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <!-- Optimization Suggestions Section -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-800">Optimization Suggestions</h3>
              </div>
              <div class="space-y-3">
                ${data.optimizationSuggestions.map((s: string, i: number) => `
                  <div class="flex gap-3 items-start">
                    <span class="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">${i + 1}</span>
                    <p class="text-gray-700 leading-relaxed">${s}</p>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Time Complexity Section -->
            <div class="p-4 border-b border-gray-100">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-800">Time Complexity</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div class="bg-purple-50 rounded-lg p-3">
                  <div class="text-sm font-medium text-purple-700 mb-1">Worst Case</div>
                  <div class="text-gray-700 font-mono text-sm">${data.timeComplexity.worst}</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-3">
                  <div class="text-sm font-medium text-purple-700 mb-1">Best Case</div>
                  <div class="text-gray-700 font-mono text-sm">${data.timeComplexity.best}</div>
                </div>
                <div class="bg-purple-50 rounded-lg p-3">
                  <div class="text-sm font-medium text-purple-700 mb-1">Average Case</div>
                  <div class="text-gray-700 font-mono text-sm">${data.timeComplexity.average}</div>
                </div>
              </div>
            </div>

            <!-- Space Complexity Section -->
            <div class="p-4">
              <div class="flex items-center gap-2 mb-3">
                <svg class="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <h3 class="text-lg font-semibold text-gray-800">Space Complexity</h3>
              </div>
              <div class="bg-orange-50 rounded-lg p-3 inline-block">
                <div class="text-gray-700 font-mono text-sm">${data.spaceComplexity}</div>
              </div>
            </div>
          </div>
        `;
      } else {
        formattedResponse = data.response || data;
      }
      
      const botResponse = {
        participantType: "CHATBOT",
        response: formattedResponse
      };
      
      setMessages(prev => [...prev, botResponse]);
      setCodeInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Code Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-[400px] overflow-y-auto border rounded-lg p-4">
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
                      dangerouslySetInnerHTML={{ __html: message.response }}
                    />
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
                <Textarea
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="Paste your code here..."
                  className="flex-1 h-[200px] font-mono"
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Chat;
