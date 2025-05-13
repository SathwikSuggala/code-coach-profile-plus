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
        formattedResponse = `Optimization Suggestions:\n${data.optimizationSuggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        formattedResponse += `Readability and Maintainability:\n${data.readabilityAndMaintainability.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        formattedResponse += `Time Complexity: ${data.timeComplexity}\n`;
        formattedResponse += `Space Complexity: ${data.spaceComplexity}`;
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
                    >
                      {message.response}
                    </div>
                  </div>
                ))}
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
