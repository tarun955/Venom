# College Social Network

A comprehensive college social networking platform designed to connect students through intuitive, secure, and interactive digital experiences.

## Features

- Secure authentication system with login and registration
- Profile management with customizable user details
- Real-time chat functionality
- Meme sharing with upvote/downvote system
- Anonymous confessions and Q&A section
- Social matching based on interests and preferences

## Tech Stack

- Frontend: React with TypeScript
- Backend: Express.js
- Database: In-memory storage (can be extended to PostgreSQL)
- Real-time: WebSocket for chat functionality
- UI Components: shadcn/ui
- Form Handling: react-hook-form with Zod validation
- State Management: TanStack Query
- Routing: wouter

## Setup

1. Clone the repository:
```bash
git clone [your-repo-url]
cd college-social-network
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the application (default: http://localhost:5000)

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```
SESSION_SECRET=your_session_secret
```

## Project Structure

- `/client` - Frontend React application
- `/server` - Backend Express server
- `/shared` - Shared types and schemas
- `/public` - Static assets

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
