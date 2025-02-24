import {
  type User, type InsertUser,
  type Meme, type InsertMeme,
  type Confession, type InsertConfession,
  type Question, type InsertQuestion,
  type Match,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  
  // Memes
  createMeme(meme: InsertMeme): Promise<Meme>;
  getMemes(): Promise<Meme[]>;
  
  // Confessions
  createConfession(confession: InsertConfession): Promise<Confession>;
  getConfessions(): Promise<Confession[]>;
  
  // Questions
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestions(): Promise<Question[]>;
  
  // Matches
  createMatch(user1Id: number, user2Id: number): Promise<Match>;
  getMatches(userId: number): Promise<Match[]>;
  
  // Chat messages
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(matchId: number): Promise<ChatMessage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private memes: Map<number, Meme>;
  private confessions: Map<number, Confession>;
  private questions: Map<number, Question>;
  private matches: Map<number, Match>;
  private chatMessages: Map<number, ChatMessage>;
  private currentIds: { [key: string]: number };

  private initializeTestData() {
    // Add some test users
    const testUsers: InsertUser[] = [
      {
        username: "priya_sharma",
        password: "test123",
        name: "Priya Sharma",
        age: 20,
        branch: "Computer Science",
        hostelStatus: "Hostel A",
        hobbies: ["Coding", "Dance", "Photography"],
        instagramHandle: "priya.codes",
        photoUrl: "/ai2.png",
      },
      {
        username: "arya_patel",
        password: "test123",
        name: "Arya Patel",
        age: 19,
        branch: "Electronics",
        hostelStatus: "Day Scholar",
        hobbies: ["AI/ML", "Music", "Reading"],
        instagramHandle: "arya.tech",
        photoUrl: "/777398564146974381 3.png",
      },
      {
        username: "neil_shah",
        password: "test123",
        name: "Neil Shah",
        age: 21,
        branch: "Computer Engineering",
        hostelStatus: "Hostel B",
        hobbies: ["Web Development", "Gaming", "Basketball"],
        photoUrl: "/boy coding.jpeg",
      },
      {
        username: "zara_khan",
        password: "test123",
        name: "Zara Khan",
        age: 20,
        branch: "Data Science",
        hostelStatus: "Hostel C",
        hobbies: ["Machine Learning", "Yoga", "Writing"],
        instagramHandle: "zara.ai",
        photoUrl: "/ai photo.png",
      }
    ];

    // Create test users
    testUsers.forEach((user) => {
      const id = this.currentIds.users++;
      const newUser: User = { 
        ...user,
        id,
        instagramHandle: user.instagramHandle || null,
      };
      this.users.set(id, newUser);
    });

    // Create some initial matches and messages for testing chat
    const match = {
      id: this.currentIds.matches++,
      user1Id: 1,
      user2Id: 2,
      timestamp: new Date()
    };
    this.matches.set(match.id, match);

    // Add some test messages
    const messages = [
      {
        id: this.currentIds.chatMessages++,
        matchId: match.id,
        senderId: 1,
        content: "Hey! I saw we both like coding!",
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: this.currentIds.chatMessages++,
        matchId: match.id,
        senderId: 2,
        content: "Yes! What languages do you work with?",
        timestamp: new Date(Date.now() - 3000000)
      }
    ];

    messages.forEach(msg => this.chatMessages.set(msg.id, msg));
  }

  constructor() {
    this.users = new Map();
    this.memes = new Map();
    this.confessions = new Map();
    this.questions = new Map();
    this.matches = new Map();
    this.chatMessages = new Map();
    this.currentIds = {
      users: 1,
      memes: 1,
      confessions: 1,
      questions: 1,
      matches: 1,
      chatMessages: 1
    };

    // Initialize test data
    this.initializeTestData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createMeme(insertMeme: InsertMeme): Promise<Meme> {
    const id = this.currentIds.memes++;
    const meme: Meme = { ...insertMeme, id, upvotes: 0, downvotes: 0 };
    this.memes.set(id, meme);
    return meme;
  }

  async getMemes(): Promise<Meme[]> {
    return Array.from(this.memes.values());
  }

  async createConfession(insertConfession: InsertConfession): Promise<Confession> {
    const id = this.currentIds.confessions++;
    const confession: Confession = { 
      ...insertConfession, 
      id,
      timestamp: new Date()
    };
    this.confessions.set(id, confession);
    return confession;
  }

  async getConfessions(): Promise<Confession[]> {
    return Array.from(this.confessions.values());
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentIds.questions++;
    const question: Question = {
      ...insertQuestion,
      id,
      timestamp: new Date()
    };
    this.questions.set(id, question);
    return question;
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async createMatch(user1Id: number, user2Id: number): Promise<Match> {
    const id = this.currentIds.matches++;
    const match: Match = {
      id,
      user1Id,
      user2Id,
      timestamp: new Date()
    };
    this.matches.set(id, match);
    return match;
  }

  async getMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      match => match.user1Id === userId || match.user2Id === userId
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentIds.chatMessages++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async getChatMessages(matchId: number): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.matchId === matchId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

export const storage = new MemStorage();