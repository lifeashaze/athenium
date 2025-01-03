# Athenium: Academic Management System

A comprehensive learning management platform built with modern technologies to streamline education workflows.

![image](https://github.com/user-attachments/assets/d119a9e6-5f66-426f-a449-09bacf8d81f2)

## 🌟 Overview

Athenium is a full-featured academic management system that combines classroom management, assignment tracking, resource sharing, and AI-powered features. Built for educational institutions, it supports multiple user roles and provides a seamless experience for both educators and students.

## 🚀 Key Features

### User Management
- Role-based access (Admin, Professor, Student)
- Comprehensive onboarding flow
- Student information tracking (SRN, PRN, Roll No)
- Profile management with academic performance tracking

### Classroom Management
- Automated classroom invitations based on year/division
- Virtual classroom creation and management
- Resource categorization by units
- Attendance tracking with analytics

### Assignment System
- AI-powered requirement generation using Google Gemini
- AWS S3-based file submissions
- Real-time grade management
- Performance analytics and trends
- Automated deadline enforcement

### Resource Management
- Unit-wise resource categorization
- Bulk download functionality
- AI-powered document chat using Gemini 1.5
- S3-based file storage and retrieval

### Analytics & Notifications
- Real-time grade and attendance tracking
- Performance trend visualization
- Email notifications via Resend
- In-app notification system

## 🛠️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- TailwindCSS
- Framer Motion
- ShadcnUI & Radix UI
- TipTap Editor
- React Query

### Backend & Database
- Prisma ORM
- Neon PostgreSQL
- AWS S3
- Clerk Authentication

### AI & Communications
- Google Gemini 1.5
- Resend Email Service

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- npm/yarn
- PostgreSQL database

### Setup Steps

1. Clone the repository:
```bash
git clone https://github.com/lifeashaze/major-olp.git
cd athenium
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```env
DATABASE_URL="your_postgresql_connection_string"
DIRECT_URL="your_direct_postgresql_connection"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
AWS_ACCESS_KEY="your_aws_access_key"
AWS_SECRET_KEY="your_aws_secret_key"
AWS_BUCKET_NAME="your_s3_bucket_name"
GEMINI_API_KEY="your_gemini_api_key"
RESEND_API_KEY="your_resend_api_key"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start development server:
```bash
npm run dev
```

## 🏗️ Architecture

### Database Schema
- User management with role-based access
- Classroom and membership system
- Assignment and submission tracking
- Resource management with categories
- Attendance tracking
- Notification system

### Key Workflows
1. **Student Onboarding**
   - Sign-up with Clerk
   - Required student information collection
   - Classroom auto-enrollment

2. **Classroom Operations**
   - Professor-led classroom creation
   - Automated student invitations
   - Resource and assignment management

3. **Assignment Lifecycle**
   - AI-assisted requirement generation
   - Secure file submissions
   - Automated notifications
   - Grade management

4. **Resource Management**
   - Unit-based categorization
   - AI-powered document chat
   - Bulk download capabilities

## 📄 License

[MIT License](LICENSE)

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.
