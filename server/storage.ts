import { 
  type User, type InsertUser,
  type Meme, type InsertMeme,
  type Confession, type InsertConfession,
  type Question, type InsertQuestion,
  type Match
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private memes: Map<number, Meme>;
  private confessions: Map<number, Confession>;
  private questions: Map<number, Question>;
  private matches: Map<number, Match>;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.memes = new Map();
    this.confessions = new Map();
    this.questions = new Map();
    this.matches = new Map();
    this.currentIds = {
      users: 1,
      memes: 1,
      confessions: 1,
      questions: 1,
      matches: 1
    };
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
}

export const storage = new MemStorage();
