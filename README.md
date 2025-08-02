# 🎫 QuickDesk - Modern Help Desk System

A comprehensive, full-stack help desk and ticketing system built with React.js, Node.js, Express, and MongoDB. QuickDesk provides a modern, intuitive interface for managing customer support tickets with real-time notifications, file attachments, and administrative controls.


## 🌟 Features

### 🎯 Core Features
- **Ticket Management**: Create, view, update, and resolve support tickets
- **Real-time Notifications**: Instant updates for ticket status changes
- **File Attachments**: Upload and manage files with tickets (up to 10MB per file)
- **Category Management**: Organize tickets by customizable categories
- **Priority Levels**: Urgent, High, Medium, and Low priority classification
- **User Roles**: Admin, Agent, and Customer role-based access control
- **Dashboard Analytics**: Visual statistics and ticket metrics
- **Responsive Design**: Mobile-friendly interface with Material-UI

### 👥 User Management
- **Authentication**: Secure JWT-based login/registration system
- **Profile Management**: Update user information and preferences
- **Role-based Access**: Different permissions for admins, agents, and customers
- **User Administration**: Admin panel for managing users and permissions

### 📊 Administrative Features
- **Category Management**: Create and manage ticket categories with color coding
- **User Management**: Admin dashboard for user oversight
- **System Statistics**: Comprehensive dashboard with ticket analytics
- **Notification System**: Automated notifications for ticket updates

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern UI library with hooks
- **Material-UI (MUI) 5** - Professional component library
- **React Router 6** - Client-side routing
- **Axios** - HTTP client for API requests
- **Vite** - Fast build tool and development server

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### Additional Tools
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **Nodemon** - Development server auto-restart

## 🚀 Quick Start

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### 📥 Installation Steps

1. **Clone the Repository**
   \`\`\`bash
   git clone https://github.com/yourusername/quickdesk-helpdesk.git
   cd quickdesk-helpdesk
   \`\`\`

2. **Backend Setup**
   \`\`\`bash
   # Navigate to backend directory
   cd backend
   
   # Install dependencies
   npm install
   
   # Create environment file
   cp .env.example .env
   
   # Edit .env file with your MongoDB connection string
   nano .env
   \`\`\`

3. **Configure Environment Variables**
   
   Create a `.env` file in the `backend` directory:
   \`\`\`env
   NODE_ENV=development
   PORT=5000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   MONGODB_URI=your-mongodb-connection-string
   \`\`\`

4. **Frontend Setup**
   \`\`\`bash
   # Navigate to frontend directory (from project root)
   cd frontend
   
   # Install dependencies
   npm install
   \`\`\`

5. **Start the Application**
   
   **Terminal 1 - Backend:**
   \`\`\`bash
   cd backend
   npm run dev
   \`\`\`
   
   **Terminal 2 - Frontend:**
   \`\`\`bash
   cd frontend
   npm run dev
   \`\`\`

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## 🔐 Default Credentials

The system automatically creates a default admin account:

\`\`\`
Email: admin@quickdesk.com
Password: admin123
\`\`\`

**⚠️ Important**: Change these credentials immediately after first login in production!

## 📁 Project Structure

\`\`\`
quickdesk-helpdesk/
├── backend/                    # Node.js/Express backend
│   ├── models/                # Mongoose data models
│   │   ├── User.js           # User model
│   │   ├── Ticket.js         # Ticket model
│   │   ├── Category.js       # Category model
│   │   └── Notification.js   # Notification model
│   ├── routes/               # API route handlers
│   │   ├── auth.js          # Authentication routes
│   │   ├── tickets.js       # Ticket management routes
│   │   ├── users.js         # User management routes
│   │   ├── categories.js    # Category routes
│   │   └── notifications.js # Notification routes
│   ├── middleware/          # Custom middleware
│   │   └── auth.js         # JWT authentication middleware
│   ├── scripts/            # Database seeding scripts
│   │   └── seed-categories.js
│   ├── uploads/           # File upload directory
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env             # Environment variables
│
├── frontend/                  # React.js frontend
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   │   ├── Layout/      # Layout components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/        # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── pages/          # Page components
│   │   │   ├── Auth/       # Login/Register pages
│   │   │   ├── Dashboard/  # Dashboard page
│   │   │   ├── Tickets/    # Ticket-related pages
│   │   │   ├── Profile/    # User profile page
│   │   │   └── Admin/      # Admin pages
│   │   ├── services/       # API service functions
│   │   │   └── api.js
│   │   ├── App.jsx        # Main App component
│   │   └── main.jsx       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── vite.config.js     # Vite configuration
│
└── README.md              # Project documentation
\`\`\`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Tickets
- `GET /api/tickets` - Get all tickets (with filters)
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get specific ticket
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `POST /api/tickets/:id/comments` - Add comment to ticket

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category (Admin only)
- `PUT /api/categories/:id` - Update category (Admin only)
- `DELETE /api/categories/:id` - Delete category (Admin only)

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read

## 🎨 Features Overview

### 📊 Dashboard
- **Ticket Statistics**: Visual charts showing ticket distribution
- **Recent Activity**: Latest ticket updates and activities
- **Quick Actions**: Fast access to common tasks
- **Performance Metrics**: Response time and resolution statistics

### 🎫 Ticket Management
- **Create Tickets**: Rich form with category selection and file uploads
- **Ticket List**: Filterable and sortable ticket overview
- **Ticket Details**: Comprehensive view with comments and history
- **Status Tracking**: Real-time status updates and notifications

### 👤 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark/Light Theme**: Automatic theme detection
- **Real-time Updates**: Live notifications for ticket changes
- **File Management**: Secure file upload and download system

## 🔧 Development

### Running in Development Mode

1. **Backend Development**
   \`\`\`bash
   cd backend
   npm run dev  # Uses nodemon for auto-restart
   \`\`\`

2. **Frontend Development**
   \`\`\`bash
   cd frontend
   npm run dev  # Uses Vite dev server
   \`\`\`

### Building for Production

1. **Frontend Build**
   \`\`\`bash
   cd frontend
   npm run build
   \`\`\`

2. **Backend Production**
   \`\`\`bash
   cd backend
   npm start
   \`\`\`

### Database Seeding

The application automatically seeds default categories and creates an admin user on first run. To manually seed:

\`\`\`bash
cd backend
npm run seed
\`\`\`

## 🧪 Testing

### Manual Testing Checklist

- [ ] User registration and login
- [ ] Ticket creation with file attachments
- [ ] Ticket status updates and comments
- [ ] Category management (Admin)
- [ ] User management (Admin)
- [ ] Notification system
- [ ] File upload/download
- [ ] Responsive design on mobile

### API Testing

Use tools like Postman or curl to test API endpoints:

\`\`\`bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quickdesk.com","password":"admin123"}'
\`\`\`

## 🚀 Deployment

### Environment Setup

1. **Production Environment Variables**
   \`\`\`env
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=your-production-jwt-secret-very-long-and-secure
   MONGODB_URI=your-production-mongodb-uri
   \`\`\`

2. **MongoDB Atlas Setup**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get connection string and add to MONGODB_URI

3. **File Upload Directory**
   - Ensure `uploads/` directory exists and has proper permissions
   - Consider using cloud storage (AWS S3, Cloudinary) for production

### Deployment Platforms

**Recommended platforms:**
- **Backend**: Heroku, Railway, DigitalOcean, AWS
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: MongoDB Atlas, AWS DocumentDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Issues

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/quickdesk-helpdesk/issues) page
2. Create a new issue with detailed description
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- **Material-UI** for the beautiful component library
- **MongoDB** for the flexible database solution
- **React.js** community for excellent documentation
- **Node.js** ecosystem for robust backend tools

## 📈 Future Enhancements

- [ ] Real-time chat system
- [ ] Email notifications
- [ ] Advanced analytics and reporting
- [ ] Mobile app (React Native)
- [ ] Integration with third-party services
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Automated ticket routing
- [ ] SLA management
- [ ] Knowledge base integration

---

**Made with ❤️ by [Hacathon Hackers]**


