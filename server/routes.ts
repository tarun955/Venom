import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertMemeSchema, insertConfessionSchema, insertQuestionSchema, insertChatMessageSchema } from "@shared/schema";

interface ChatClient extends WebSocket {
  userId?: number;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.get("/api/users", async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  });

  app.post("/api/users", async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error });
      return;
    }
    const user = await storage.createUser(parsed.data);
    res.json(user);
  });

  // Memes
  app.get("/api/memes", async (req, res) => {
    const memes = await storage.getMemes();
    res.json(memes);
  });

  app.post("/api/memes", async (req, res) => {
    const parsed = insertMemeSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error });
      return;
    }
    const meme = await storage.createMeme(parsed.data);
    res.json(meme);
  });

  // Confessions
  app.get("/api/confessions", async (req, res) => {
    const confessions = await storage.getConfessions();
    res.json(confessions);
  });

  app.post("/api/confessions", async (req, res) => {
    const parsed = insertConfessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error });
      return;
    }
    const confession = await storage.createConfession(parsed.data);
    res.json(confession);
  });

  // Questions
  app.get("/api/questions", async (req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });

  app.post("/api/questions", async (req, res) => {
    const parsed = insertQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error });
      return;
    }
    const question = await storage.createQuestion(parsed.data);
    res.json(question);
  });

  // Matches
  app.post("/api/matches", async (req, res) => {
    const { user1Id, user2Id } = req.body;
    const match = await storage.createMatch(user1Id, user2Id);
    res.json(match);
  });

  app.get("/api/matches/:userId", async (req, res) => {
    const matches = await storage.getMatches(parseInt(req.params.userId));
    res.json(matches);
  });

  // Add new chat routes
  app.get("/api/chat/:matchId", async (req, res) => {
    const messages = await storage.getChatMessages(parseInt(req.params.matchId));
    res.json(messages);
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: ChatClient) => {
    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);

        switch (message.type) {
          case 'auth':
            ws.userId = message.userId;
            break;

          case 'chat':
            const parsed = insertChatMessageSchema.safeParse({
              matchId: message.matchId,
              senderId: ws.userId,
              content: message.content
            });

            if (!parsed.success) {
              ws.send(JSON.stringify({ type: 'error', error: 'Invalid message format' }));
              return;
            }

            const chatMessage = await storage.createChatMessage(parsed.data);

            // Broadcast to all connected clients in the same match
            wss.clients.forEach((client: ChatClient) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                  type: 'chat',
                  message: chatMessage
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ type: 'error', error: 'Internal server error' }));
      }
    });
  });

  return httpServer;
}