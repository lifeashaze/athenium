# Athenium: The Ultimate Student Academic Management System

![image](https://github.com/user-attachments/assets/d119a9e6-5f66-426f-a449-09bacf8d81f2)


Athenium is a comprehensive student academic management system designed to streamline coursework, simplify submissions, and elevate the educational experience for both students and educators.

## 🌟 Features

- **Classroom Management**: Create and join virtual classrooms with ease.
- **Assignment Tracking**: Manage and submit assignments with real-time updates.
- **Attendance System**: Track and manage student attendance effortlessly.
- **User Dashboard**: Personalized dashboard with todo lists, study timer, and quick notes.
- **Analytics**: Gain insights into classroom performance and engagement.
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
   git clone https://github.com/yourusername/athenium.git
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
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## 🛠️ Built With

- [Next.js](https://nextjs.org/) - React framework for production
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM for Node.js and TypeScript
- [Clerk](https://clerk.dev/) - Authentication and user management
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React
- [Axios](https://axios-http.com/) - Promise-based HTTP client
- [date-fns](https://date-fns.org/) - Modern JavaScript date utility library

## 📁 Project Structure

```
athenium/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── classroom/
│   │   ├── dashboard/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── ...
├── prisma/
├── public/
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide Icons](https://lucide.dev/) for the icon set
- All contributors who have helped shape Athenium
