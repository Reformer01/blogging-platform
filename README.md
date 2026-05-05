# BlogHub - Full-Stack Blogging Platform

A modern, production-ready blogging platform built with React, Node.js, and PostgreSQL.

## Features

- **User Authentication** - JWT-based auth with secure password hashing
- **Post Management** - Create, edit, publish, and delete blog posts
- **Draft Saving** - Save posts as drafts before publishing
- **Rich Text Editor** - React Quill for beautiful content editing
- **SEO-Friendly URLs** - Auto-generated slugs for better SEO
- **Author Profiles** - Display author info and post history
- **View Tracking** - Track post views in real-time
- **Admin Dashboard** - Manage users, posts, and platform analytics
- **Responsive Design** - Beautiful UI on all devices
- **Modern Stack** - Latest React, Node.js, and database best practices

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT Authentication
- Bcrypt Password Hashing

**Frontend:**
- React 18
- React Router v6
- Zustand (State Management)
- Vite (Build Tool)
- Tailwind CSS
- React Quill (Rich Text Editor)
- Lucide Icons

## Setup Instructions

### Prerequisites
- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Backend Setup

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your database credentials

# Set up database
psql -U postgres -d blogging_platform -f server/database/schema.sql

# Start backend server
npm run server:dev
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

### Run Both Simultaneously

```bash
npm run dev
```

Backend will run on `http://localhost:3000`
Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires token)

### Blog Posts
- `GET /api/blog/posts` - Get all published posts (paginated)
- `GET /api/blog/posts/:slug` - Get single post by slug
- `POST /api/blog/posts` - Create new post (requires auth)
- `PUT /api/blog/posts/:id` - Update post (requires auth, must be owner)
- `DELETE /api/blog/posts/:id` - Delete post (requires auth, must be owner)
- `GET /api/blog/my-posts` - Get user's posts (requires auth)

### Admin
- `GET /api/admin/stats` - Dashboard stats (admin only)
- `GET /api/admin/users` - All users (admin only)
- `GET /api/admin/posts` - All posts (admin only)
- `PATCH /api/admin/comments/:id` - Moderate comments (admin only)

## Database Schema

### Users Table
```sql
- id (PK)
- email (unique)
- username (unique)
- password_hash
- full_name
- bio
- avatar_url
- role (author/admin)
- created_at, updated_at
```

### Posts Table
```sql
- id (PK)
- author_id (FK)
- title
- slug (unique, auto-generated)
- content
- excerpt
- featured_image_url
- status (draft/published)
- view_count
- published_at
- created_at, updated_at
```

### Categories Table
```sql
- id (PK)
- name
- slug
- description
```

### Comments Table
```sql
- id (PK)
- post_id (FK)
- author_id (FK)
- content
- status (pending/approved)
- created_at, updated_at
```

## Deployment

### Deploy to Vercel (Frontend)
```bash
cd client
vercel
```

### Deploy to Railway/Render (Backend)
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NODE_ENV=production`
   - `CLIENT_URL`
4. Deploy!

## Future Enhancements

- [ ] Comment system with nested replies
- [ ] Tags and categories
- [ ] Full-text search
- [ ] Email notifications
- [ ] Social sharing buttons
- [ ] Analytics dashboard
- [ ] Markdown preview mode
- [ ] Post scheduling
- [ ] Image upload
- [ ] Reading time estimation
- [ ] Newsletter subscription
- [ ] Dark/Light theme toggle

## Project Structure

```
blogging-platform/
├── server/
│   ├── index.js
│   ├── database/
│   │   └── schema.sql
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── routes/
│       ├── auth.js
│       ├── blog.js
│       └── admin.js
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── BlogPost.jsx
│   │   │   ├── Editor.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   └── Navigation.jsx
│   │   ├── store/
│   │   │   └── authStore.js
│   │   └── index.css
│   └── vite.config.js
├── package.json
├── .env.example
└── README.md
```

## Security Features

- Bcrypt password hashing
- JWT token authentication
- SQL injection prevention (parameterized queries)
- CORS protection
- Helmet.js security headers
- Input validation
- Role-based access control

## License

MIT License - feel free to use this project for portfolio or production

## Contributing

Contributions are welcome! Feel free to open issues and pull requests.

## Support

Have questions? Create an issue or contact me!

---

**Built by Reformer01**
