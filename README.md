# Athenium: The Ultimate Student Academic Management System

![image](https://github.com/user-attachments/assets/d119a9e6-5f66-426f-a449-09bacf8d81f2)

Athenium is a comprehensive student academic management system designed to streamline coursework, simplify submissions, and elevate the educational experience for both students and educators. It serves as an all-in-one platform that empowers students and educators to manage their academic activities efficiently.

## 🌟 Features

- **Classroom Management**: Create and join virtual classrooms with ease.
- **Assignment Tracking**: Manage and submit assignments with real-time updates.
- **Attendance System**: Track and manage student attendance effortlessly.
- **User Dashboard**: Personalized dashboard with todo lists, study timer, and quick notes.
- **Analytics**: Gain insights into classroom performance and engagement.
- **Resource Sharing**: Centralized hub for sharing course materials and resources.
- **Real-time Collaboration**: Built-in tools for group projects and discussions.
- **Code Execution Environment**: Integrated system for coding assignments and practice.
- **Responsive Design**: Seamless experience across desktop and mobile devices.

## 🚀 Getting Started

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/lifeashaze/major-olp.git
   cd athenium
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   DATABASE_URL="your_postgresql_connection_string"
   CLERK_SECRET_KEY="your_clerk_secret_key"
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
   ```

4. Run database migrations:
   ```
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework for production
- [TypeScript](https://www.typescriptlang.org/) - Typed superset of JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
- [PostgreSQL](https://www.postgresql.org/) - Open source relational database
- [Clerk](https://clerk.dev/) - Authentication and user management
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React
- [Axios](https://axios-http.com/) - Promise-based HTTP client
- [date-fns](https://date-fns.org/) - Modern JavaScript date utility library
- [AWS S3](https://aws.amazon.com/s3/) - Object storage for file handling
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor for browser
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
- [Google Generative AI](https://cloud.google.com/ai-platform) - AI integration
