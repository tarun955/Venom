import {
  type User, type InsertUser,
  type Meme, type InsertMeme,
  type Confession, type InsertConfession,
  type Question, type InsertQuestion,
  type Match,
  type ChatMessage, type InsertChatMessage
} from "@shared/schema";

interface MemeVote {
  id: number;
  userId: number;
  memeId: number;
  voteType: 'upvote' | 'downvote';
}

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  updateUser(id: number, user: InsertUser): Promise<User>; // Added updateUser method

  // Memes
  createMeme(meme: InsertMeme): Promise<Meme>;
  getMemes(): Promise<Meme[]>;
  upvoteMeme(id: number): Promise<Meme | undefined>;
  downvoteMeme(id: number): Promise<Meme | undefined>;
  getMemeVote(userId: number, memeId: number): Promise<MemeVote | undefined>;
  voteMeme(userId: number, memeId: number, voteType: 'upvote' | 'downvote'): Promise<Meme | undefined>;

  // Confessions
  createConfession(confession: InsertConfession): Promise<Confession>;
  getConfessions(): Promise<Confession[]>;

  // Questions
  createQuestion(question: InsertQuestion): Promise<Question>;
  getQuestions(): Promise<Question[]>;

  // Matches
  createMatch(user1Id: number, user2Id: number): Promise<Match>;
  rejectMatch(user1Id: number, user2Id: number): Promise<void>;
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
  private memeVotes: Map<string, MemeVote>;
  private rejectedMatches: Set<string>;
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
        photoUrl: "/assets/ai2.png",
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
        photoUrl: "/assets/777398564146974381 3.png",
      },
      {
        username: "neil_shah",
        password: "test123",
        name: "Neil Shah",
        age: 21,
        branch: "Computer Engineering",
        hostelStatus: "Hostel B",
        hobbies: ["Web Development", "Gaming", "Basketball"],
        photoUrl: "/assets/boy coding.jpeg",
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
        photoUrl: "/assets/ai photo.png",
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
    this.memeVotes = new Map();
    this.rejectedMatches = new Set();
    this.currentIds = {
      users: 1,
      memes: 1,
      confessions: 1,
      questions: 1,
      matches: 1,
      chatMessages: 1,
      memeVotes: 1
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
    const user: User = {
      ...insertUser,
      id,
      instagramHandle: insertUser.instagramHandle || null,
    };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createMeme(insertMeme: InsertMeme): Promise<Meme> {
    const id = this.currentIds.memes++;
    const meme: Meme = {
      ...insertMeme,
      id,
      caption: insertMeme.caption || null,
      tags: insertMeme.tags || null,
      upvotes: 0,
      downvotes: 0,
    };
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
      isAnonymous: insertConfession.isAnonymous ?? true,
      timestamp: new Date(),
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
      isAnonymous: insertQuestion.isAnonymous ?? true,
      timestamp: new Date(),
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

  async rejectMatch(user1Id: number, user2Id: number): Promise<void> {
    const key = `${Math.min(user1Id, user2Id)}-${Math.max(user1Id, user2Id)}`;
    this.rejectedMatches.add(key);
  }

  async getMatches(userId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(match => {
      // Check if this match involves the user
      if (match.user1Id !== userId && match.user2Id !== userId) return false;

      // Check if this match was rejected
      const key = `${Math.min(match.user1Id, match.user2Id)}-${Math.max(match.user1Id, match.user2Id)}`;
      return !this.rejectedMatches.has(key);
    });
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
      .sort((a, b) => {
        const aTime = a.timestamp?.getTime() || 0;
        const bTime = b.timestamp?.getTime() || 0;
        return aTime - bTime;
      });
  }

  async upvoteMeme(id: number): Promise<Meme | undefined> {
    const meme = this.memes.get(id);
    if (!meme) return undefined;

    const updatedMeme = { ...meme, upvotes: (meme.upvotes || 0) + 1 };
    this.memes.set(id, updatedMeme);
    return updatedMeme;
  }

  async downvoteMeme(id: number): Promise<Meme | undefined> {
    const meme = this.memes.get(id);
    if (!meme) return undefined;

    const updatedMeme = { ...meme, downvotes: (meme.downvotes || 0) + 1 };
    this.memes.set(id, updatedMeme);
    return updatedMeme;
  }

  async getMemeVote(userId: number, memeId: number): Promise<MemeVote | undefined> {
    const key = `${userId}-${memeId}`;
    return this.memeVotes.get(key);
  }

  async voteMeme(userId: number, memeId: number, voteType: 'upvote' | 'downvote'): Promise<Meme | undefined> {
    const meme = this.memes.get(memeId);
    if (!meme) return undefined;

    const key = `${userId}-${memeId}`;
    const existingVote = this.memeVotes.get(key);

    if (existingVote) {
      // User has already voted, no changes allowed
      return meme;
    }

    // Record the new vote
    const voteId = this.currentIds.memeVotes++;
    const vote: MemeVote = {
      id: voteId,
      userId,
      memeId,
      voteType,
    };
    this.memeVotes.set(key, vote);

    // Update the meme's vote count
    const updatedMeme = {
      ...meme,
      upvotes: voteType === 'upvote' ? (meme.upvotes || 0) + 1 : meme.upvotes || 0,
      downvotes: voteType === 'downvote' ? (meme.downvotes || 0) + 1 : meme.downvotes || 0,
    };
    this.memes.set(memeId, updatedMeme);
    return updatedMeme;
  }

  async updateUser(id: number, updateData: InsertUser): Promise<User> {
    const existingUser = this.users.get(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...existingUser,
      ...updateData,
      id, // Ensure ID remains unchanged
      password: existingUser.password, // Keep existing password
      username: existingUser.username, // Keep existing username
      instagramHandle: updateData.instagramHandle || null,
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }
}

export const storage = new MemStorage();