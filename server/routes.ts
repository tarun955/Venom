import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertUserSchema, insertMemeSchema, insertConfessionSchema, insertQuestionSchema, insertChatMessageSchema } from "@shared/schema";
import { setupAuth } from "./auth";

interface ChatClient extends WebSocket {
  userId?: number;
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/images/memes',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'meme-' + uniqueSuffix + path.extname(file.originalname));
    }
  })
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);

  // Protected route middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Users
  app.get("/api/users", requireAuth, async (req, res) => {
    const users = await storage.getUsers();
    res.json(users);
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  });

  app.post("/api/users", requireAuth, async (req, res) => {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error });
      return;
    }
    const user = await storage.createUser(parsed.data);
    res.json(user);
  });

  // Memes
  app.get("/api/memes", requireAuth, async (req, res) => {
    const memes = await storage.getMemes();
    res.json(memes);
  });

  app.post("/api/memes", upload.single('image'), requireAuth, async (req, res) => {
    try {
      const memeData = {
        userId: parseInt(req.body.userId),
        caption: req.body.caption || null,
        tags: req.body.tags ? JSON.parse(req.body.tags) : [],
        imageUrl: req.file ? `/images/memes/${req.file.filename}` : null
      };

      const parsed = insertMemeSchema.safeParse(memeData);
      if (!parsed.success) {
        res.status(400).json({ message: parsed.error });
        return;
      }

      const meme = await storage.createMeme(parsed.data);
      res.json(meme);
    } catch (error) {
      console.error('Error creating meme:', error);
      res.status(500).json({ message: 'Error creating meme' });
    }
  });

  // Updated upvote/downvote routes
  app.post("/api/memes/:id/:voteType", requireAuth, async (req, res) => {
    const { id } = req.params;
    const voteType = req.params.voteType as 'upvote' | 'downvote';
    const userId = req.user.id; // Assuming req.user is populated by authentication middleware


    if (voteType !== 'upvote' && voteType !== 'downvote') {
      res.status(400).json({ message: "Invalid vote type" });
      return;
    }

    // Check if user has already voted
    const existingVote = await storage.getMemeVote(userId, parseInt(id));
    if (existingVote) {
      res.status(400).json({ message: "You have already voted on this meme" });
      return;
    }

    const meme = await storage.voteMeme(userId, parseInt(id), voteType);
    if (!meme) {
      res.status(404).json({ message: "Meme not found" });
      return;
    }
    res.json(meme);
  });

  // Add reject match route
  app.post("/api/matches/reject", requireAuth, async (req, res) => {
    const { user1Id, user2Id } = req.body;
    await storage.rejectMatch(user1Id, user2Id);
    res.json({ success: true });
  });


  // Confessions
  app.get("/api/confessions", requireAuth, async (req, res) => {
    const confessions = await storage.getConfessions();
    res.json(confessions);
  });

  app.post("/api/confessions", requireAuth, async (req, res) => {
    const parsed = insertConfessionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error });
      return;
    }
    const confession = await storage.createConfession(parsed.data);
    res.json(confession);
  });

  // Questions
  app.get("/api/questions", requireAuth, async (req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });

  app.post("/api/questions", requireAuth, async (req, res) => {
    const parsed = insertQuestionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error });
      return;
    }
    const question = await storage.createQuestion(parsed.data);
    res.json(question);
  });

  // Matches
  app.post("/api/matches", requireAuth, async (req, res) => {
    const { user1Id, user2Id } = req.body;
    const match = await storage.createMatch(user1Id, user2Id);
    res.json(match);
  });

  app.get("/api/matches/:userId", requireAuth, async (req, res) => {
    const matches = await storage.getMatches(parseInt(req.params.userId));
    res.json(matches);
  });

  // Add new chat routes
  app.get("/api/chat/:matchId", requireAuth, async (req, res) => {
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
            if (!ws.userId) {
              ws.send(JSON.stringify({ type: 'error', error: 'Authentication required' }));
              return;
            }

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