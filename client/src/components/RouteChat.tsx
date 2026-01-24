import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Message, type User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";

export function RouteChat({ routeId }: { routeId: number }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, isLoading } = useQuery<(Message & { user: User })[]>({
    queryKey: ["/api/routes", routeId, "messages"],
    queryFn: async () => {
      const res = await fetch(`/api/routes/${routeId}/messages`);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return res.json();
    },
    refetchInterval: 3000, // Poll every 3s
  });

  const mutation = useMutation({
    mutationFn: async (newContent: string) => {
      const res = await apiRequest("POST", `/api/routes/${routeId}/messages`, { content: newContent });
      return res.json();
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["/api/routes", routeId, "messages"] });
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || mutation.isPending) return;
    mutation.mutate(content);
  };

  if (!user) {
    return (
      <Card className="mt-8">
        <CardContent className="py-8 text-center text-muted-foreground">
          Please log in to participate in the chat.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8 border-border/60 shadow-lg overflow-hidden flex flex-col h-[500px]">
      <CardHeader className="bg-primary text-primary-foreground py-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-secondary" />
          Route Discussion
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : messages?.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
            ) : (
              [...(messages || [])].reverse().map((msg) => {
                const isMe = msg.userId === user.id;
                const isOperator = msg.user.role === 'admin';
                
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={isOperator ? "bg-secondary text-secondary-foreground" : ""}>
                        {(msg.user.firstName || msg.user.email || "P").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col max-w-[80%] ${isMe ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold">
                          {isOperator ? "Operator" : (msg.user.firstName || msg.user.email || "Passenger")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(msg.createdAt!), "HH:mm")}
                        </span>
                      </div>
                      <div className={`px-3 py-2 rounded-2xl text-sm ${
                        isMe 
                          ? "bg-primary text-primary-foreground rounded-tr-none" 
                          : isOperator 
                            ? "bg-secondary/10 border border-secondary/20 rounded-tl-none"
                            : "bg-muted rounded-tl-none"
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSend} className="p-4 border-t bg-muted/30 flex gap-2">
          <Input 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="rounded-xl border-border/50"
            disabled={mutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-xl shrink-0" 
            disabled={mutation.isPending || !content.trim()}
          >
            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
