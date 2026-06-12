# MCP Base - Model Context Protocol Directory

[![Next.js](https://img.shields.io/badge/Next.js-14.2.24-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

**MCP Base** is a community-driven web platform focused on the Model Context Protocol (MCP) ecosystem. This platform serves as a central directory for discovering, sharing, and organizing MCP servers and clients.

## Features

### **MCP Server and Client Directory**

- Comprehensive collection of MCP servers and clients
- Category-based filtering and search
- Sorting by GitHub stars
- AI-powered analysis and descriptions

### **Smart Categorization**

- 60+ specialized categories
- AI Model Integration, Context Management, Agent Frameworks
- Knowledge Management, Developer Tools, Security solutions
- Industry-specific and technological domains

### **Modern Web Technologies**

- Next.js 14 App Router
- Type safety with TypeScript
- Modern design with Tailwind CSS
- Responsive and mobile-friendly

### **Blog and Content Management**

- MCP-related blog posts
- Markdown-supported content editor
- SEO optimization
- Automatic reading time calculation

### **Secure Database Management**

- Supabase PostgreSQL
- Row Level Security (RLS)
- Real-time updates
- Automatic backups

## Project Structure

```
mcp-base/
├── app/                     # Next.js App Router
│   ├── (legal)/            # Legal pages (privacy, terms)
│   ├── blog/               # Blog pages and slug routing
│   ├── clients/            # MCP client directory
│   ├── servers/            # MCP server directory
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Homepage
│   └── providers.tsx       # Context providers
├── backend/                # Backend logic
│   ├── queries/            # Supabase queries
│   │   ├── blog.ts         # Blog CRUD operations
│   │   ├── clients.ts      # Client data
│   │   └── servers.ts      # Server data
│   ├── sql/                # Database schema
│   ├── supabase/           # Supabase configuration
│   └── types/              # TypeScript type definitions
├── components/             # React components
│   ├── core/               # Core application components
│   ├── layout/             # Layout components
│   ├── magicui/            # Custom UI components
│   └── ui/                 # Shadcn/ui components
├── data/                   # Static data files
│   ├── categories.ts       # Category definitions
│   └── faqs.ts             # FAQ data
└── helpers/                # Helper functions
    └── estimateReadingTime.ts
```

## Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### 1. Clone the Repository

```bash
git clone https://github.com/berkayderin/mcp-base.git
cd mcp-base
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Set Up Database

```bash
# Run the SQL files in backend/sql/ in Supabase SQL editor
# 1. 001-repo.sql - Main table structure
# 2. 002-blog.sql - Blog tables
```

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Main Tables

#### `servers` Table

```sql
- id (bigint): GitHub repo ID
- name (text): Repository name
- full_name (text): Full repository name (owner/repo)
- html_url (text): GitHub URL
- description (text): Description
- language (text): Programming language
- stars (integer): Star count
- categories (text[]): Category array
- ai_analysis (text): AI analysis
- slug (text): URL slug
- is_active (boolean): Active status
```

#### `clients` Table

- Same structure as `servers` table
- Dedicated for MCP clients

#### `blog_posts` Table

```sql
- id (string): UUID
- title (text): Article title
- description (text): Short description
- content (text): Markdown content
- keywords (text[]): Keywords
- slug (text): URL slug
- created_date (timestamp): Creation date
```

## Core Features

### Search and Filtering

- **Text Search**: Search in name, description, language, and AI analysis
- **Category Filter**: Filter by 60+ categories
- **Pagination**: Performance-optimized page navigation
- **Sorting**: Automatic sorting by star count

### API Endpoints

```typescript
// Server queries
getTopServers(limit: number)
getServersWithPagination(page, pageSize, category)
searchServers(searchQuery, page, pageSize, category)
getServerById(slug)

// Client queries
getTopClients(limit: number)
getClientsWithPagination(page, pageSize, category)
searchClients(searchQuery, page, pageSize, category)
getClientById(slug)

// Blog operations
getAllBlogPosts()
getBlogPostBySlug(slug)
```

### Category System

Content organized with 60+ specialized categories:

- **AI/ML**: Model Integration, Context Management, Agent Frameworks
- **Knowledge Management**: Knowledge Base, Vector Databases, RAG Systems
- **Developer Tools**: CLI Tools, Code Generation, API Frameworks
- **Security**: Security & Privacy, AI Safety, Compliance
- **Industry**: Enterprise, Healthcare, Financial Services

## UI/UX Features

### Design System

- **Shadcn/ui**: Modern component library
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Accessible primitive components
- **Lucide Icons**: Consistent icon system

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Dark/Light mode support
- Accessibility standards

### Performance

- Next.js App Router optimization
- Image optimization
- Code splitting
- Static generation (SSG)

## Development Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Production start
npm run start

# Linting
npm run lint

# Code formatting
npm run format

# Format check
npm run format:check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Adding MCP Server/Client

- Create a GitHub issue
- Share repository information
- Specify your category suggestions
- Wait for community review process

## Links

- **Website**: [model-context-protocol.com](https://model-context-protocol.com)
- **GitHub**: [github.com/berkayderin/mcp-base](https://github.com/berkayderin/mcp-base)
- **Issues**: [GitHub Issues](https://github.com/berkayderin/mcp-base/issues)
- **Discussions**: [GitHub Discussions](https://github.com/berkayderin/mcp-base/discussions)

## Acknowledgments

- [Anthropic](https://anthropic.com) - MCP protocol development
- [Next.js](https://nextjs.org) - React framework
- [Supabase](https://supabase.com) - Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com) - CSS framework
- MCP community - Continuous contributions and feedback

---

**Note**: This project is community-driven and has no official affiliation with Anthropic. For more information about the MCP protocol, visit [Anthropic's official documentation](https://github.com/modelcontextprotocol).
