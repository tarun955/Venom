import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import type { Match, User, ChatMessage } from "@shared/schema";

export default function Chat() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch current user's matches
  const { data: matches } = useQuery<Match[]>({
    queryKey: ["/api/matches/1"], // TODO: Replace with actual user ID
  });

  // Fetch users involved in matches
  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  // Connect to WebSocket
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      // Authenticate with user ID
      newSocket.send(JSON.stringify({
        type: 'auth',
        userId: 1, // TODO: Replace with actual user ID
      }));
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat') {
        setMessages(prev => [...prev, data.message]);
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Fetch chat messages when match is selected
  useEffect(() => {
    if (selectedMatch) {
      fetch(`/api/chat/${selectedMatch.id}`)
        .then(res => res.json())
        .then(setMessages);
    }
  }, [selectedMatch]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!socket || !selectedMatch || !newMessage.trim()) return;

    socket.send(JSON.stringify({
      type: 'chat',
      matchId: selectedMatch.id,
      content: newMessage.trim(),
    }));

    setNewMessage("");
  };

  const getMatchedUser = (match: Match) => {
    // Get the other user in the match
    const otherUserId = match.user1Id === 1 ? match.user2Id : match.user1Id; // TODO: Replace 1 with actual user ID
    return users?.find(user => user.id === otherUserId);
  };

  return (
    <div className="min-h-screen p-4 pb-20 flex gap-4">
      {/* Matches list */}
      <div className="w-1/3 space-y-4">
        <h2 className="text-2xl font-bold mb-4">Your Matches</h2>
        {matches?.map(match => {
          const matchedUser = getMatchedUser(match);
          return (
            <Card
              key={match.id}
              className={`cursor-pointer transition-colors ${
                selectedMatch?.id === match.id ? 'bg-primary/10' : ''
              }`}
              onClick={() => setSelectedMatch(match)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={matchedUser?.photoUrl}
                      alt={matchedUser?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold">{matchedUser?.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {matchedUser?.branch}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedMatch ? (
          <>
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.senderId === 1; // TODO: Replace with actual user ID
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p>{message.content}</p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message input */}
            <div className="p-4 border-t border-border flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            Select a match to start chatting
          </div>
        )}
      </div>
    </div>
  );
}