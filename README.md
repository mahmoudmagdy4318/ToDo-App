# Todo App MVP

A full-stack todo application built with Node.js, Express, SQLite, Prisma ORM, EJS templates, and TypeScript. This project implements a layered architecture with proper separation of concerns, comprehensive error handling, and modern development practices.

## Features

- ✅ **Full CRUD Operations** - Create, read, update, and delete tasks
- ✅ **Task Management** - Title, description, priority levels, due dates, and tags
- ✅ **Advanced Filtering** - Search, filter by priority/status, sort by multiple fields
- ✅ **Pagination** - Efficient handling of large task lists
- ✅ **Optimistic Locking** - Version control to prevent concurrent update conflicts
- ✅ **Soft Delete** - Tasks are marked as deleted rather than permanently removed
- ✅ **Responsive UI** - Bootstrap-powered interface that works on all devices
- ✅ **Real-time Feedback** - Toast notifications for user actions
- ✅ **Keyboard Shortcuts** - Quick navigation and task creation
- ✅ **Progressive Enhancement** - Works with and without JavaScript

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety and modern JavaScript features
- **Prisma ORM** - Database toolkit and query builder
- **SQLite** - Lightweight database for development

### Frontend
- **EJS** - Server-side templating engine
- **Bootstrap 5** - CSS framework for responsive design
- **Vanilla JavaScript** - Modern ES6+ modules for client-side functionality
- **Bootstrap Icons** - Icon library

### Development & Testing
- **Vitest** - Fast unit testing framework
- **Supertest** - HTTP assertion library for integration tests
- **ESLint** - Code linting and formatting
- **Prisma Studio** - Database visualization tool

## Project Structure

```
├── src/
│   ├── domain/              # Domain entities and business rules
│   │   ├── entities/        # Core business entities (Task)
│   │   ├── interfaces/      # Repository contracts
│   │   └── errors/          # Domain-specific errors
│   ├── application/         # Application services and use cases
│   │   ├── services/        # Business logic services (TaskService)
│   │   ├── schemas/         # Validation schemas (Zod)
│   │   └── dto/            # Data Transfer Objects
│   ├── infrastructure/      # External concerns
│   │   ├── database/        # Database connection and configuration
│   │   ├── repositories/    # Data access implementations
│   │   ├── logging/         # Logging utilities
│   │   ├── container/       # Dependency injection
│   │   └── bootstrap/       # Application initialization
│   ├── presentation/        # HTTP layer
│   │   ├── controllers/     # Request handlers (TaskController)
│   │   ├── routes/          # Route definitions
│   │   └── middleware/      # Custom middleware (error handling, CORS, etc.)
│   ├── app.ts              # Express application setup
│   └── server.ts           # Application entry point
├── views/                   # EJS templates
│   ├── layouts/            # Layout templates
│   ├── partials/           # Reusable template components
│   └── tasks/              # Task-specific views
├── public/                 # Static assets
│   ├── js/                 # Client-side JavaScript modules
│   ├── css/                # Custom styles
│   └── images/             # Images and icons
├── prisma/                 # Database schema and migrations
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
└── docs/                   # Project documentation
```

## Architecture

This application follows **Clean Architecture** principles with clear separation between layers:

1. **Domain Layer** - Core business logic and entities
2. **Application Layer** - Use cases and application services
3. **Infrastructure Layer** - Database, external services, and frameworks
4. **Presentation Layer** - HTTP controllers and view rendering

### Design Patterns Used
- **Repository Pattern** - Data access abstraction
- **Dependency Injection** - Loose coupling between components
- **Domain Driven Design** - Business logic encapsulation
- **CQRS-lite** - Separate read and write operations

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Database operations
npm run db:generate   # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio

# Code quality
npm run lint         # Check code style
npm run lint:fix     # Fix linting issues
```

## API Documentation

### Tasks API

#### Get Tasks
```http
GET /api/tasks?page=1&limit=25&search=&priority=&status=&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 25, max: 100)
- `search` - Search term for title and description
- `priority` - Filter by priority: LOW, MEDIUM, HIGH
- `status` - Filter by status: completed, incomplete
- `dueDate` - Filter by due date: overdue, today, week, none
- `tags` - Filter by tags (array)
- `sortBy` - Sort field: createdAt, dueDate, priority, title, completed
- `sortOrder` - Sort order: asc, desc

#### Get Single Task
```http
GET /api/tasks/:id
```

#### Create Task
```http
POST /api/tasks
Content-Type: application/json

{
  "title": "Task title",
  "description": "Optional description",
  "priority": "MEDIUM",
  "dueDate": "2024-12-31",
  "tags": ["work", "important"]
}
```

#### Update Task
```http
PUT /api/tasks/:id
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true,
  "version": 1
}
```

#### Delete Task
```http
DELETE /api/tasks/:id
```

### Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "pagination": {
    "page": 1,
    "pages": 5,
    "limit": 25,
    "total": 123,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "uuid",
    "version": "1.0.0"
  }
}
```

## Frontend Architecture

The frontend uses a modular JavaScript architecture with the following components:

- **ApiClient** - HTTP client for API communication
- **TaskManager** - Task operations and state management
- **ToastManager** - User notifications and feedback
- **UiStateManager** - UI state and filter management

### Key Features

- **Progressive Enhancement** - Works without JavaScript
- **Responsive Design** - Mobile-first approach
- **Keyboard Shortcuts** - Ctrl+N (new task), Ctrl+F (search), Esc (cancel)
- **Real-time Updates** - Instant feedback for all operations
- **Inline Editing** - Edit tasks without page refresh
- **Smart Pagination** - Efficient data loading

## Testing

### Unit Tests
```bash
npm run test:unit
```
Tests individual components and business logic in isolation.

### Integration Tests
```bash
npm run test:integration
```
Tests API endpoints and database interactions.

### Test Coverage
```bash
npm run test:coverage
```
Generates coverage reports for code quality metrics.

## Production Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables
Ensure these are set in production:
- `NODE_ENV=production`
- `DATABASE_URL` - Production database connection
- `SESSION_SECRET` - Secure session secret
- `LOG_LEVEL=warn` - Reduce log verbosity

### Security Considerations
- CORS properly configured
- Rate limiting enabled
- Input validation on all endpoints
- SQL injection protection via Prisma
- XSS protection via EJS auto-escaping

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] User authentication and authorization
- [ ] Task collaboration and sharing
- [ ] Email notifications and reminders
- [ ] File attachments
- [ ] Task templates and recurring tasks
- [ ] Export/import functionality (JSON, CSV)
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Task analytics and reporting
- [ ] Dark mode support
