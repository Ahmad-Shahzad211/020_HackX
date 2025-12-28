# ChatLegis - Technical Cheatsheet

> Quick reference guide for development

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/auth/          # Authentication endpoints
│   ├── auth/              # Auth pages (login, register, OTP)
│   ├── cl/                # Main chat application
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── auth/             # Auth-related components
│   ├── chatBotScreen/    # Chat interface components
│   └── home/             # Landing page sections
├── store/                # Zustand state stores
├── models/               # Mongoose schemas
├── handlers/             # Business logic handlers
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
└── data/                 # Static data & constants
```

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chatlegis
MONGODB_URI_TESTING=mongodb://localhost:27017/chatlegis_test

# JWT
JWT_SECRET=your_jwt_secret_here

# Email (Nodemailer)
ADMIN_EMAIL=your_email@gmail.com
ADMIN_PASSWORD=your_app_password

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🛣️ API Routes

### Authentication (`/api/auth/`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration with OTP |
| `/api/auth/login` | POST | Email/password login |
| `/api/auth/logout` | POST | Logout & clear session |
| `/api/auth/otp` | POST | Verify OTP code |
| `/api/auth/forgot` | POST | Request password reset |
| `/api/auth/passwordReset` | POST | Reset password with token |
| `/api/auth/google` | GET | Initiate Google OAuth |
| `/api/auth/google/callback` | GET | Google OAuth callback |

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "fullName": "John Doe",
  "gender": "male",
  "email": "john@example.com",
  "password": "password123",
  "ipAddress": "192.168.1.1",
  "country": "Pakistan",
  "city": "Karachi",
  "browser": "Chrome",
  "browserVersion": "120.0",
  "osName": "Windows"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123",
  "deviceInfo": {...}
}
```

## 🗄️ State Management (Zustand)

### Chat Store (`chatbotStore.ts`)
```typescript
interface ChatbotChatType {
  sessionID: string | undefined;
  fetchChat: boolean;
  thinking: boolean;
  messages: ChatbotMessageType[];
  inputMessage: string;
  setSessionID: (id: string) => void;
  setMessages: (msgs: ChatbotMessageType[]) => void;
  // ... other setters
}

// Usage
import useChatbotStore from '@/app/cl/store/chatbotStore';
const { messages, setMessages } = useChatbotStore();
```

### User Info Store (`userInfoStore.ts`)
```typescript
interface UserInfoType {
  userName: string;
  userAvatar: string;
  userInfo: any;
  devices: any;
  // ... setters
}
```

### Legis Store (`legisStore.ts`)
```typescript
interface LegisType {
  email: string;
  selectedTool: string;
  listOfChats: ChatType[];
  // ... setters
}
```

## 📊 Database Models

### User Model (`models/users.ts`)

```typescript
{
  fullName: String,          // Min 3, Max 50 chars
  gender: String,
  email: String,             // Unique, validated
  password: String,          // Min 8 chars (for email login)
  role: "admin" | "user",    // Default: "user"
  loginType: "email" | "google",
  googleId: String,
  avatarUrl: String,
  lastLogin: Date,
  otp: Number,
  otpCreationTime: Date,
  userDeviceAndLocationInfo: [{
    ipAddress: String,
    location: { country, city },
    deviceInfo: { browser, browserVersion, osName },
    lastActive: Date
  }]
}
```

## 🎨 Key Components

### Chat Interface
```typescript
// Main chat screen
<Chatscreen />              // src/components/chatBotScreen/chatscreen.tsx

// Sub-components
<Sidebar />                 // Collapsible sidebar with chat history
<Navbar />                  // Top navigation with toggle
<Messages />                // Message display with markdown
<ChatbotInput />            // Input field with file upload
<FileUploader />            // Drag-n-drop file upload
<AudioPlayer />             // Audio playback
<ToolSelector />            // Select AI tool/mode
```

### Auth Components
```typescript
<Login />                   // Login form
<Register />                // Registration form
<VerifyOTP />              // OTP verification
<ChangePassword />          // Password change
```

### Landing Page
```typescript
<HomeHero />               // Hero section with GSAP animations
<Features />               // Feature showcase
<Pricing />                // Pricing plans
<Testimonials />           // User testimonials
<FAQs />                   // FAQ accordion
<Stats />                  // Statistics display
<Footer />                 // Site footer
```

## 🎭 Theme System

```typescript
// Theme Provider wraps entire app
<ThemeProvider />

// Theme Toggle button
<ThemeToggle />

// CSS Variables (globals.css)
--color-bg
--color-text
--color-card-bg
--color-border
// ... etc
```

## 🔒 Authentication Flow

1. **Registration:**
   - User submits form → POST `/api/auth/register`
   - Server creates user with hashed password
   - Generates OTP → sends via email
   - Redirects to OTP verification page

2. **OTP Verification:**
   - User enters OTP → POST `/api/auth/otp`
   - Server validates OTP & time (10 min expiry)
   - Sets JWT cookie `__chatLegis__`
   - Redirects to chat screen

3. **Login:**
   - User submits credentials → POST `/api/auth/login`
   - Server validates password with bcrypt
   - Updates device info & last login
   - Sets JWT cookie
   - Redirects to chat screen

4. **Google OAuth:**
   - User clicks "Sign in with Google"
   - Redirects to `/api/auth/google`
   - Google callback → `/api/auth/google/callback`
   - Creates/updates user → sets JWT cookie

5. **Protected Routes:**
   - Middleware checks JWT cookie (`proxy.ts`)
   - Public paths: `/`, `/auth/*`
   - Protected paths: `/cl/*`
   - Redirects based on auth state

## 🛡️ Middleware & Route Protection

```typescript
// src/proxy.ts
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/verify-otp"
];

// All other routes require authentication
// JWT stored in cookie: __chatLegis__
```

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `next@16` | Framework |
| `react@19` | UI library |
| `typescript` | Type safety |
| `zustand` | State management |
| `mongodb` | Database driver |
| `mongoose` | ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth |
| `passport` | OAuth strategies |
| `nodemailer` | Email service |
| `framer-motion` | Animations |
| `gsap` | Advanced animations |
| `tailwindcss@4` | Styling |
| `react-markdown` | Markdown rendering |
| `highlight.js` | Code highlighting |
| `rehype-katex` | Math equations |
| `formik` | Forms |
| `yup` | Validation |
| `axios` | HTTP client |

## 🎯 Common Development Tasks

### Adding a New Page
```typescript
// Create file: src/app/your-page/page.tsx
export default function YourPage() {
  return <div>Your content</div>;
}

// Route: http://localhost:3000/your-page
```

### Adding a New API Route
```typescript
// Create file: src/app/api/your-route/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  return NextResponse.json({ data: "response" });
}
```

### Creating a New Store
```typescript
import { create } from 'zustand';

interface YourStore {
  value: string;
  setValue: (val: string) => void;
}

const useYourStore = create<YourStore>((set) => ({
  value: '',
  setValue: (val) => set({ value: val })
}));

export default useYourStore;
```

### Adding Protected Route
```typescript
// Update src/proxy.ts matcher config
// Add route protection logic
```

## 🧪 Testing Quick Commands

```bash
# Check MongoDB connection
mongosh

# Test API endpoint
curl http://localhost:3000/api/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Check environment variables
echo $MONGODB_URI
```

## 🐛 Common Issues & Solutions

### Issue: MongoDB Connection Failed
```bash
# Solution: Check if MongoDB is running
mongod --version
# Start MongoDB service
net start MongoDB
```

### Issue: Port 3000 Already in Use
```bash
# Solution: Kill process or use different port
npx kill-port 3000
# Or
PORT=3001 pnpm dev
```

### Issue: Module Not Found
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Issue: JWT Token Invalid
```bash
# Solution: Clear cookies in browser DevTools
# Or logout and login again
```

## 📝 File Naming Conventions

- Components: `PascalCase.tsx` (e.g., `Sidebar.tsx`)
- Utils/Handlers: `camelCase.ts` (e.g., `issueHandler.ts`)
- API Routes: `route.ts` (Next.js convention)
- Stores: `camelCaseStore.ts` (e.g., `legisStore.ts`)
- Types: `index.ts` or `mongoTypes.ts`

## 🎨 Styling Guidelines

```typescript
// Use Tailwind classes
<div className="flex items-center justify-between p-4">

// Use theme variables for colors
style={{ backgroundColor: 'var(--color-card-bg)' }}

// Responsive design
<div className="hidden md:flex lg:grid-cols-3">
```

## 🔥 Hot Tips

1. **Zustand DevTools**: Install Redux DevTools extension for debugging
2. **Next.js Caching**: Clear `.next` folder if seeing stale data
3. **Type Safety**: Always define TypeScript interfaces in `/types`
4. **Animations**: Use `framer-motion` for component animations, `gsap` for scroll
5. **Forms**: Use Formik + Yup for complex forms with validation
6. **API Calls**: Use axios with retry logic (already configured)
7. **MongoDB**: Always use `await dbConnect()` before DB operations
8. **Security**: Never commit `.env.local` to git

## 📚 Useful Links

- [Next.js Docs](https://nextjs.org/docs)
- [Zustand Docs](https://docs.pmnd.rs/zustand/)
- [Mongoose Docs](https://mongoosejs.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

---

**Last Updated:** December 27, 2025
