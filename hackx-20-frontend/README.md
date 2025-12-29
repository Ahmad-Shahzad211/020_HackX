# Chat Legis - Smart Legal Assistant for Pakistani Law

![Chat Legis](public/chatlegis.svg)

## 🎯 Project Goal

**Chat Legis** is an intelligent legal assistant platform designed specifically for Pakistani law. The application aims to democratize access to legal information and services by providing an AI-powered chatbot that helps users understand legal concepts, draft legal documents, prepare cases, and stay updated with the latest legal developments in Pakistan.

The platform serves three primary user groups:
- **Lawyers**: Streamline case preparation, document drafting, and legal research
- **Judges**: Access legal precedents, case law, and legislative updates
- **Citizens**: Understand their rights, get legal guidance, and access legal information

## ✨ Key Features

### 1. **AI-Powered Legal Chat Assistant**
- Interactive chatbot for legal queries and consultation
- Context-aware responses based on Pakistani law
- Multi-turn conversations with chat history
- Real-time message streaming
- Support for legal document analysis
- File upload capability for document review

### 2. **User Authentication & Authorization**
- Secure user registration and login
- Email verification with OTP
- Password recovery system
- Google OAuth integration
- Role-based access control (Admin/User)
- Session management with JWT tokens

### 3. **Admin Dashboard** (Admin Only)
- **User Management**:
  - View all registered users
  - Search and filter users
  - Promote/demote admin roles
  - Delete user accounts
  - Track user activity and login history
  - View user plans and subscription details

- **Document Management**:
  - Upload legal documents (PDF, DOC, DOCX, TXT)
  - Categorize documents (Constitutional, Criminal, Civil, Corporate, Labor, General)
  - View and manage document library
  - Delete outdated documents
  - Track document upload history

### 4. **Chat Management**
- Create new chat conversations
- View and search chat history
- Edit chat titles
- Resume previous conversations
- Auto-refresh chat list
- Organize conversations by date

### 5. **User Profile & Settings**
- View and edit profile information
- Upload profile avatar
- Change password
- View device login history
- Manage account settings
- Track usage statistics

### 6. **Theme Support**
- Light and Dark mode toggle
- Persistent theme preference
- Smooth theme transitions
- Accessible color schemes

### 7. **Responsive Design**
- Mobile-first approach
- Tablet and desktop optimized
- Collapsible sidebar for mobile
- Touch-friendly interface
- Adaptive layouts

## 🏗️ Application Architecture

### Technology Stack

**Frontend:**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion, GSAP
- **Forms**: Formik + Yup
- **Markdown**: React Markdown with syntax highlighting
- **Icons**: Lucide React

**Backend Integration:**
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport (Google OAuth)
- **Email**: Nodemailer
- **API**: RESTful APIs

**Development Tools:**
- **Package Manager**: pnpm
- **Linting**: ESLint
- **Type Checking**: TypeScript

### Project Structure

```
hackx-20-frontend/
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── api/                  # API routes
│   │   │   ├── admin/            # Admin API endpoints
│   │   │   ├── auth/             # Authentication APIs
│   │   │   ├── chat/             # Chat APIs
│   │   │   └── user/             # User APIs
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── verify-otp/
│   │   │   └── forgot-password/
│   │   ├── cl/                   # Chat Legis app pages
│   │   │   ├── chatscreen/       # Main chat interface
│   │   │   ├── admin-dashboard/  # Admin panel
│   │   │   └── settings/         # User settings
│   │   ├── contact/              # Contact page
│   │   ├── privacy-policy/       # Privacy policy
│   │   └── terms-conditions/     # Terms and conditions
│   ├── components/               # Reusable React components
│   │   ├── auth/                 # Auth components
│   │   ├── chatBotScreen/        # Chat interface components
│   │   ├── chatHistory/          # Chat history components
│   │   ├── home/                 # Landing page components
│   │   ├── navigation/           # Navigation components
│   │   ├── ui/                   # UI primitives
│   │   ├── sidebar.tsx           # Main sidebar
│   │   └── navbar.tsx            # Top navbar
│   ├── handlers/                 # API handler functions
│   ├── models/                   # Database models
│   ├── store/                    # Zustand state stores
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   └── db/                       # Database configuration
├── public/                       # Static assets
│   └── images/                   # Image assets
└── package.json                  # Dependencies

```

## 🔄 Application Flow

### 1. **User Journey - New User**

```
Landing Page → Register → Email Verification (OTP) → Login → Chat Screen
```

1. User visits the landing page
2. Clicks "Try it Now" or "Get Started"
3. Redirected to registration page
4. Fills registration form with personal details
5. Receives OTP via email
6. Verifies OTP
7. Redirected to login page
8. Logs in with credentials
9. Lands on Chat Screen

### 2. **User Journey - Existing User**

```
Landing Page → Login → Chat Screen (or Admin Dashboard if admin)
```

1. User visits landing page
2. Clicks "Login"
3. Enters credentials
4. **If Regular User**: Redirected to Chat Screen
5. **If Admin**: Redirected to Admin Dashboard

### 3. **Chat Flow**

```
Chat Screen → New Chat → Ask Question → AI Response → Continue Conversation
```

1. User clicks "New Chat" or selects existing chat
2. Types legal query in input box
3. Can attach files if needed
4. Clicks send
5. AI processes query and streams response
6. User can ask follow-up questions
7. Chat history is automatically saved
8. Can search previous chats anytime

### 4. **Admin Flow**

```
Admin Dashboard → User Management / Document Management → Actions → Updates
```

**User Management:**
1. Admin logs in → Redirected to Admin Dashboard
2. Views user statistics (Total Users, Admins, Documents)
3. Can search/filter users
4. Can promote user to admin or demote admin to user
5. Can delete users
6. Views user details (email, role, plan, last login)

**Document Management:**
1. Admin clicks "Upload Document"
2. Fills document details (title, category)
3. Uploads file (PDF/DOC/DOCX/TXT)
4. Document processed and stored
5. Available for users in chat context
6. Can edit or delete documents

### 5. **Authentication Flow**

```
Login → JWT Token → Protected Routes → API Calls with Token
```

1. User submits login credentials
2. Server validates credentials
3. Server generates JWT token
4. Token stored in localStorage
5. All API requests include token in Authorization header
6. Server verifies token for protected routes
7. Token expires after set duration
8. User logs out → Token cleared

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- MongoDB database
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hackx-20-frontend
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=your_mongodb_connection_string
   
   # JWT
   JWT_SECRET=your_jwt_secret_key
   
   # Email (Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # API Base URL
   NEXT_PUBLIC_API_URL=http://localhost:3000
   
   # AI/LLM API
   AI_API_KEY=your_ai_api_key
   AI_API_URL=your_ai_service_url
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
pnpm build
pnpm start
```

## 🔐 User Roles & Permissions

### Regular User
- ✅ Access chat interface
- ✅ Create and manage own chats
- ✅ Upload documents for analysis
- ✅ View and edit own profile
- ✅ Change password
- ❌ Access admin dashboard
- ❌ Manage other users
- ❌ Upload system documents

### Admin User
- ✅ All regular user permissions
- ✅ Access admin dashboard
- ✅ View all users
- ✅ Manage user roles
- ✅ Delete users
- ✅ Upload system documents
- ✅ Manage document library
- ✅ View system statistics

## 📱 Pages Overview

### Public Pages
- **Landing Page** (`/`): Marketing page with hero section, features, testimonials
- **Contact** (`/contact`): Contact form for inquiries
- **Privacy Policy** (`/privacy-policy`): Privacy policy details
- **Terms & Conditions** (`/terms-conditions`): Terms of service

### Authentication Pages
- **Login** (`/auth/login`): User login form
- **Register** (`/auth/register`): User registration form
- **Verify OTP** (`/auth/verify-otp`): Email verification
- **Forgot Password** (`/auth/forgot-password`): Password recovery

### Protected Pages (Requires Login)
- **Chat Screen** (`/cl/chatscreen`): Main AI chat interface
- **Profile Settings** (`/cl/settings/profile`): User profile management
- **Admin Dashboard** (`/cl/admin-dashboard`): Admin control panel (Admin only)

## 🎨 Design Features

- **Theme Toggle**: Seamless switching between light and dark modes
- **Responsive Sidebar**: Collapsible on mobile, persistent on desktop
- **Animated Transitions**: Smooth page transitions and loading states
- **Toast Notifications**: User feedback for actions
- **Loading States**: Skeletons and spinners for better UX
- **Error Handling**: Graceful error messages and fallbacks
- **Accessibility**: WCAG compliant color contrasts and keyboard navigation

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt encryption for passwords
- **Email Verification**: OTP-based email confirmation
- **Protected Routes**: Server-side and client-side route guards
- **CSRF Protection**: Token validation on sensitive operations
- **Session Management**: Automatic logout on token expiry
- **Input Validation**: Comprehensive form validation with Yup
- **XSS Prevention**: Sanitized user inputs
- **Secure Headers**: Security headers configured

## 📊 State Management

### Zustand Stores

1. **User Store** (`userInfoStore`):
   - User name, email, avatar
   - User role (admin/user)
   - Device information
   - Persisted in localStorage

2. **Chatbot Store** (`chatbotStore`):
   - Current messages
   - Session ID
   - Loading states
   - Selected tools

3. **Legis Store** (`legisStore`):
   - Chat history list
   - Selected tool
   - Chat metadata

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is part of HackX-20 competition.

## 👥 Team

Developed by the Chat Legis team for HackX-20

## 📧 Support

For support, email support@chatlegis.com or open an issue in the repository.

---

**Made with ❤️ for the Pakistani legal community**
