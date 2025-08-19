# Database Schema & Seed Data

This project includes a comprehensive database schema with sample data for a blog/content management system.

## Database Models

### User
- **Fields**: id, email, name, avatar, bio, createdAt, updatedAt
- **Relations**: Has many posts and comments
- **Sample Data**: 4 users with different roles (developer, designer, product manager, founder)

### Category
- **Fields**: id, name, description, color, createdAt, updatedAt
- **Relations**: Has many posts
- **Sample Data**: 4 categories (Technology, Design, Business, Lifestyle)

### Post
- **Fields**: id, title, content, published, createdAt, updatedAt, authorId, categoryId
- **Relations**: Belongs to User and Category, has many comments
- **Sample Data**: 6 posts across different categories (5 published, 1 draft)

### Comment
- **Fields**: id, content, createdAt, updatedAt, authorId, postId
- **Relations**: Belongs to User and Post
- **Sample Data**: 6 comments on various posts

### Message
- **Fields**: id, content, role, createdAt, updatedAt, metadata
- **Sample Data**: 4 chat messages (user/assistant conversation)

### Important
- **Fields**: id, content, createdAt, updatedAt, metadata
- **Sample Data**: 3 system notifications

## Setup Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up your database**:
   - Make sure you have PostgreSQL running
   - Set your `DATABASE_URL` in your environment variables
   - Run migrations: `npx prisma migrate dev`

3. **Seed the database with sample data**:
   ```bash
   npm run db:seed
   ```

4. **Reset database (if needed)**:
   ```bash
   npm run db:reset
   ```

## Sample Data Overview

### Users
- **Alice Johnson** - Full-stack developer
- **Bob Smith** - UI/UX designer  
- **Carol Davis** - Product manager
- **Dave Wilson** - Startup founder

### Categories
- **Technology** (Blue) - Tech news and tutorials
- **Design** (Green) - UI/UX design tips
- **Business** (Yellow) - Business insights
- **Lifestyle** (Red) - Personal development

### Posts
1. "Getting Started with Next.js 14" (Technology)
2. "Design Principles for Better UX" (Design)
3. "Building a Successful SaaS Business" (Business)
4. "The Power of Morning Routines" (Lifestyle)
5. "TypeScript Best Practices" (Technology)
6. "Color Theory in Web Design" (Design) - Draft

### Comments
- Various user interactions on posts
- Demonstrates the relationship between users, posts, and comments

## Database Relationships

```
User (1) ←→ (Many) Post
User (1) ←→ (Many) Comment
Category (1) ←→ (Many) Post
Post (1) ←→ (Many) Comment
```

## Useful Queries

### Get all published posts with author and category
```typescript
const posts = await prisma.post.findMany({
  where: { published: true },
  include: {
    author: true,
    category: true,
    comments: {
      include: { author: true }
    }
  }
})
```

### Get posts by category
```typescript
const techPosts = await prisma.post.findMany({
  where: {
    category: { name: 'Technology' },
    published: true
  },
  include: { author: true }
})
```

### Get user with their posts and comments
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'alice@example.com' },
  include: {
    posts: { include: { category: true } },
    comments: { include: { post: true } }
  }
})
```

## Next Steps

1. Run the seed script to populate your database
2. Explore the data using Prisma Studio: `npx prisma studio`
3. Build your application features using the existing models
4. Extend the schema as needed for your specific requirements
