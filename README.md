# Idea Marketplace

A modern, full-stack marketplace for buying and selling creative ideas. Built with React, Node.js, Express, and Supabase.

## ✨ Features

- **🎯 Full CRUD Operations**: Create, read, update, and delete ideas
- **🔍 Search & Filter**: Search by title/description and filter by category
- **🔐 Authentication**: Secure email/password authentication with Supabase
- **📱 Responsive Design**: Beautiful, mobile-first design with Tailwind CSS
- **🏷️ Tagging System**: Add tags to help users discover ideas
- **💰 Pricing**: Set prices for your creative ideas
- **🖼️ Image Support**: Add images to showcase your ideas
- **🔒 Authorization**: Users can only edit/delete their own ideas
- **🎨 Modern UI**: Clean, professional design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 1. Set up Supabase

1. Create a new project at [Supabase](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `supabase/migrations/create_ideas_table.sql`
4. Run the SQL migration to create the database schema

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend folder:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```

Start the backend server:
```bash
npm start
```

The API will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
npm install
```

Start the frontend development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
idea-marketplace/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth and validation middleware
│   ├── routes/            # API routes
│   ├── .env.example       # Environment variables template
│   └── server.js          # Main server file
├── src/                    # React application source
│   ├── components/         # Reusable components
│   ├── context/           # React Context providers
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   └── config/            # Configuration files
├── public/                # Static assets
├── supabase/
│   └── migrations/        # Database migrations
└── README.md
```

## 🛠️ API Endpoints

### Ideas
- `GET /api/ideas` - Get all ideas (with search and filter)
- `POST /api/ideas` - Create a new idea (auth required)
- `GET /api/ideas/:id` - Get a specific idea
- `PATCH /api/ideas/:id` - Update an idea (auth required, owner only)
- `DELETE /api/ideas/:id` - Delete an idea (auth required, owner only)

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/signin` - Sign in to existing account
- `POST /api/auth/signout` - Sign out user
- `GET /api/auth/user` - Get current user info

## 🗃️ Database Schema

### profiles
- `id` (uuid, primary key, references auth.users)
- `email` (text)
- `username` (text, unique)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### ideas
- `id` (uuid, primary key)
- `user_id` (uuid, foreign key to auth.users)
- `title` (text, required, 3-100 characters)
- `description` (text, required, 10-1000 characters)
- `category` (text, required)
- `tags` (text array)
- `price` (numeric, >= 0)
- `image_url` (text, optional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- JWT-based authentication via Supabase
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS protection
- Authorization checks for user-owned resources

## 🎨 UI/UX Features

- Responsive design with mobile-first approach
- Loading states and error handling
- Toast notifications for user feedback
- Smooth animations and transitions
- Professional color scheme and typography
- Accessible form controls and navigation

## 🚀 Deployment

### Backend
The backend can be deployed to platforms like:
- Heroku
- Railway
- DigitalOcean App Platform
- AWS EC2/Elastic Beanstalk

### Frontend
The frontend can be deployed to:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables

Make sure to set the following environment variables in your deployment:

**Backend:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PORT` (optional, defaults to 5000)

**Frontend:**
- Build-time configuration in `src/config/supabase.ts`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have any questions or need help setting up the project, please open an issue on GitHub or contact the development team.

## 🔄 Development Workflow

1. Start Supabase locally (optional): `supabase start`
2. Start the backend: `cd backend && npm start`
3. Start the frontend: `cd frontend && npm start`
4. Open `http://localhost:3000` in your browser

Happy coding! 🎉