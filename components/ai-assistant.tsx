"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Bot, User, Trash2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  sendAIMessage,
  getAIConversation,
  listAIConversations,
  deleteAIConversation,
} from "@/app/actions/ai-assistant";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantProps {
  projectId: string;
  projectTitle: string;
}

export function AIAssistant({ projectId, projectTitle }: AIAssistantProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [conversations, setConversations] = useState<any[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, [projectId]);

  const loadConversations = async () => {
    try {
      const convs = await listAIConversations(projectId);
      setConversations(convs);
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await sendAIMessage(projectId, userMessage, conversationId);
      setConversationId(result.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: result.message }]);
      await loadConversations();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo obtener respuesta del asistente",
        variant: "destructive",
      });
      setMessages((prev) => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleLoadConversation = async (convId: string) => {
    try {
      const conv = await getAIConversation(convId);
      setConversationId(convId);
      setMessages((conv.messages as AIMessage[]) || []);
      setShowConversations(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo cargar la conversación",
        variant: "destructive",
      });
    }
  };

  const handleNewConversation = () => {
    setConversationId(undefined);
    setMessages([]);
    setShowConversations(false);
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await deleteAIConversation(convId);
      await loadConversations();
      if (conversationId === convId) {
        handleNewConversation();
      }
      toast({
        title: "Conversación eliminada",
        description: "La conversación ha sido eliminada exitosamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la conversación",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Asistente de IA
            </CardTitle>
            <CardDescription>
              Obtén ayuda con documentación, código, tareas y más para "{projectTitle}"
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConversations(!showConversations)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Conversaciones
            </Button>
            <Button variant="outline" size="sm" onClick={handleNewConversation}>
              Nueva
            </Button>
          </div>
        </div>
      </CardHeader>

      {showConversations && (
        <div className="px-6 pb-4 flex-shrink-0 border-b">
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay conversaciones</p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-accent cursor-pointer"
                    onClick={() => handleLoadConversation(conv.id)}
                  >
                    <span className="text-sm truncate flex-1">
                      {((conv.messages as any)?.[0]?.content || "Nueva conversación").substring(0, 50)}
                      ...
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConversation(conv.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      <CardContent className="flex-1 flex flex-col min-h-0 p-0">
        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Haz una pregunta para comenzar</p>
                <p className="text-sm mt-2">
                  Puedo ayudarte con documentación, código, planificación de tareas y más
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 border-t p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

