import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Technology',
        description: 'Latest tech news and tutorials',
        color: '#3B82F6'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Design',
        description: 'UI/UX design tips and inspiration',
        color: '#10B981'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Business',
        description: 'Business insights and strategies',
        color: '#F59E0B'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Lifestyle',
        description: 'Personal development and lifestyle tips',
        color: '#EF4444'
      }
    })
  ])

  // Create users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        bio: 'Full-stack developer passionate about React and Node.js'
      }
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob Smith',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        bio: 'UI/UX designer creating beautiful user experiences'
      }
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        name: 'Carol Davis',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        bio: 'Product manager with 5+ years of experience'
      }
    }),
    prisma.user.create({
      data: {
        email: 'dave@example.com',
        name: 'Dave Wilson',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        bio: 'Startup founder and tech enthusiast'
      }
    })
  ])

  // Create posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: 'Getting Started with Next.js 14',
        content: 'Next.js 14 introduces several exciting new features including the App Router, Server Components, and improved performance. In this post, we\'ll explore how to get started with the latest version and build a modern web application.',
        published: true,
        authorId: users[0].id,
        categoryId: categories[0].id
      }
    }),
    prisma.post.create({
      data: {
        title: 'Design Principles for Better UX',
        content: 'Good design is not just about aesthetics. It\'s about creating experiences that are intuitive, accessible, and delightful for users. Let\'s explore some fundamental design principles that can improve your user experience.',
        published: true,
        authorId: users[1].id,
        categoryId: categories[1].id
      }
    }),
    prisma.post.create({
      data: {
        title: 'Building a Successful SaaS Business',
        content: 'Starting a SaaS business requires careful planning, market research, and execution. From idea validation to scaling, here are the key steps to build a successful software-as-a-service company.',
        published: true,
        authorId: users[3].id,
        categoryId: categories[2].id
      }
    }),
    prisma.post.create({
      data: {
        title: 'The Power of Morning Routines',
        content: 'How you start your day can significantly impact your productivity and overall well-being. Discover the science behind morning routines and learn how to create one that works for you.',
        published: true,
        authorId: users[2].id,
        categoryId: categories[3].id
      }
    }),
    prisma.post.create({
      data: {
        title: 'TypeScript Best Practices',
        content: 'TypeScript has become the standard for building scalable JavaScript applications. Learn about best practices, common patterns, and how to write more maintainable code with TypeScript.',
        published: true,
        authorId: users[0].id,
        categoryId: categories[0].id
      }
    }),
    prisma.post.create({
      data: {
        title: 'Color Theory in Web Design',
        content: 'Colors play a crucial role in web design, influencing user emotions and behavior. Understanding color theory can help you create more effective and visually appealing websites.',
        published: false,
        authorId: users[1].id,
        categoryId: categories[1].id
      }
    })
  ])

  // Create comments
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Great article! I especially liked the section about Server Components. Looking forward to trying these features out.',
        authorId: users[1].id,
        postId: posts[0].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'This is exactly what I needed to understand Next.js 14. Thanks for the clear explanation!',
        authorId: users[2].id,
        postId: posts[0].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'These design principles are timeless. I\'ve been applying them for years and they never fail.',
        authorId: users[0].id,
        postId: posts[1].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'The SaaS business model is fascinating. Would love to see more content about pricing strategies.',
        authorId: users[1].id,
        postId: posts[2].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'I\'ve been following a morning routine for 6 months now and the difference is incredible. Highly recommend!',
        authorId: users[3].id,
        postId: posts[3].id
      }
    }),
    prisma.comment.create({
      data: {
        content: 'TypeScript has saved me so many hours of debugging. These best practices are spot on.',
        authorId: users[2].id,
        postId: posts[4].id
      }
    })
  ])

  // Create some messages
  await Promise.all([
    prisma.message.create({
      data: {
        content: 'Hello! I have a question about the Next.js tutorial.',
        role: 'USER',
        metadata: { userId: users[0].id }
      }
    }),
    prisma.message.create({
      data: {
        content: 'Sure! I\'d be happy to help you with any Next.js questions. What specific topic are you struggling with?',
        role: 'ASSISTANT',
        metadata: { assistantId: 'support-bot' }
      }
    }),
    prisma.message.create({
      data: {
        content: 'I\'m having trouble with the App Router configuration.',
        role: 'USER',
        metadata: { userId: users[0].id }
      }
    }),
    prisma.message.create({
      data: {
        content: 'The App Router can be tricky at first. Let me walk you through the basic setup and common configuration options.',
        role: 'ASSISTANT',
        metadata: { assistantId: 'support-bot' }
      }
    })
  ])

  // Create some important items
  await Promise.all([
    prisma.important.create({
      data: {
        content: 'Database migration completed successfully',
        metadata: { type: 'system', priority: 'high' }
      }
    }),
    prisma.important.create({
      data: {
        content: 'New user registration feature deployed',
        metadata: { type: 'feature', priority: 'medium' }
      }
    }),
    prisma.important.create({
      data: {
        content: 'Security audit scheduled for next week',
        metadata: { type: 'security', priority: 'high' }
      }
    })
  ])

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${categories.length} categories`)
  console.log(`Created ${users.length} users`)
  console.log(`Created ${posts.length} posts`)
  console.log('Created 6 comments')
  console.log('Created 4 messages')
  console.log('Created 3 important items')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
