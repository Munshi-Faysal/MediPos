# GB Account Frontend - Angular 18 Application

A modern, responsive General Banking Account Portal frontend application built with Angular 18, featuring strict mode, Tailwind CSS, and comprehensive functionality.

## 🚀 Features

### Core Foundation
- **Angular 18** with strict mode enabled
- **Tailwind CSS** for styling with custom design system
- **Standalone components** architecture
- **Signals** for reactive programming
- **Lazy loading** for optimal performance
- **TypeScript** strict configuration

### Authentication & Security
- JWT-based authentication with refresh tokens
- Route guards (AuthGuard, AdminGuard)
- HTTP interceptors for token management
- Error handling with user-friendly notifications
- Role-based access control

### UI/UX Components
- **Responsive app shell** with collapsible sidebar
- **Dynamic table** with server-side pagination, sorting, and filtering
- **Dynamic form** builder with validation
- **Loading skeletons** and empty states
- **Toast notifications** system
- **Theme switching** (light/dark mode)
- **Accessibility** features (ARIA landmarks, focus management)

### Feature Modules
- **Public**: Company registration, login, callback
- **Admin**: Admin dashboard and approval console
- **Company**: Dashboard, organization management, user management
- **Chat**: Real-time messaging with typing indicators and audio calls

### Dashboard & Analytics
- Eye-catching dashboard with animated widgets
- KPI cards with trend indicators
- Recent activity feed
- "Who's out today" widget
- Quick stats and metrics

### Communication
- **Real-time messaging** with WebSocket integration
- **Audio call** modal (WebRTC ready)
- **Email templates** preview system
- **Notification center** with unread badges

## 🏗️ Architecture

### Project Structure
```
src/app/
├── core/                    # Core services and utilities
│   ├── guards/             # Route guards
│   ├── interceptors/       # HTTP interceptors
│   ├── models/             # TypeScript interfaces
│   └── services/           # Core services (Auth, Theme, etc.)
├── shared/                 # Reusable components
│   ├── components/         # UI components
│   ├── pipes/              # Custom pipes
│   └── directives/         # Custom directives
├── features/               # Feature modules
│   ├── public/             # Public pages
│   ├── admin/              # Admin functionality
│   ├── company/            # Company management
│   └── chat/               # Messaging system
└── presentation/           # App shell and routing
```

### Key Services

#### AuthService
- User authentication and session management
- Token refresh handling
- Role-based permissions
- Observable and signal-based state management

#### ThemeService
- Light/dark mode switching
- System preference detection
- LocalStorage persistence
- CSS class management

#### NotificationService
- Toast notifications
- In-app notification center
- Unread count tracking
- Real-time updates

#### RealtimeService
- WebSocket connection management
- Message handling for chat and notifications
- Connection status monitoring
- Auto-reconnection logic

## 🎨 Design System

### Color Palette
- **Primary**: Blue tones (#3b82f6)
- **Secondary**: Slate tones (#64748b)
- **Success**: Green tones (#22c55e)
- **Warning**: Amber tones (#f59e0b)
- **Error**: Red tones (#ef4444)

### Typography
- **Font Family**: Inter (primary), JetBrains Mono (code)
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliant

### Components
- **Buttons**: Primary, secondary, outline, ghost variants
- **Cards**: Elevated, floating, standard variants
- **Forms**: Consistent styling with validation states
- **Tables**: Sortable, filterable, paginated
- **Modals**: Accessible with focus management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 9+
- Angular CLI 18+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd medipos

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Development Commands
```bash
# Start development server
npm start

# Build application
npm run build

# Run tests
npm test

# Run E2E tests
npm run e2e

# Lint code
npm run lint
```

## 🧪 Testing

### E2E Tests
Comprehensive Playwright tests covering:
- Authentication flow (register → login → dashboard)
- Responsive design testing
- Theme switching
- Form validation
- Navigation and routing
- Error handling

### Test Coverage
- Unit tests for services and components
- Integration tests for feature modules
- E2E tests for critical user flows

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Collapsible sidebar
- Touch-friendly interactions
- Mobile-optimized forms
- Responsive tables with horizontal scroll

## 🔧 Configuration

### Environment Variables
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/v1',
  wsUrl: 'ws://localhost:8000/ws'
};
```

### Tailwind Configuration
Custom configuration with:
- Dark mode support
- Custom color palette
- Extended spacing and animations
- Form and typography plugins

## 🚀 Deployment

### Build Optimization
- Tree shaking enabled
- Lazy loading for routes
- Bundle splitting
- Compression and minification

### Production Build
```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Route Guards**: Protected routes and role-based access
- **XSS Protection**: Sanitized content rendering
- **CSRF Protection**: Token validation
- **Content Security Policy**: Restricted resource loading

## ♿ Accessibility

- **ARIA Landmarks**: Proper semantic structure
- **Focus Management**: Keyboard navigation support
- **Screen Reader**: Compatible with assistive technologies
- **Color Contrast**: WCAG 2.1 AA compliant
- **Skip Links**: Quick navigation for keyboard users

## 🔄 State Management

### Signals (Angular 18)
- Reactive state management
- Computed properties
- Effect-based side effects
- Performance optimized

### Services
- Centralized business logic
- Observable patterns for async operations
- Dependency injection
- Singleton pattern for shared state

## 📊 Performance

### Optimization Strategies
- **Lazy Loading**: Route-based code splitting
- **OnPush Change Detection**: Optimized change detection
- **TrackBy Functions**: Efficient list rendering
- **Virtual Scrolling**: Large dataset handling
- **Image Optimization**: Responsive images with lazy loading

### Bundle Analysis
- Initial bundle size: ~200KB (gzipped)
- Lazy-loaded chunks: ~50KB each
- Tree-shaking enabled
- Dead code elimination

## 🤝 Contributing

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Conventional commits

### Development Workflow
1. Create feature branch
2. Implement changes with tests
3. Run linting and tests
4. Submit pull request
5. Code review and merge

## 📝 API Integration

### Backend Requirements
- RESTful API endpoints
- WebSocket support for real-time features
- JWT token authentication
- CORS configuration
- Error response standardization

### API Endpoints
```
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
GET  /api/v1/users
GET  /api/v1/dashboard/widgets
POST /api/v1/notifications
WS   /ws (WebSocket connection)
```

## 🔮 Future Enhancements

### Planned Features
- **Video Calling**: WebRTC integration
- **File Sharing**: Drag-and-drop file uploads
- **Advanced Analytics**: Charts and reporting
- **Mobile App**: React Native or Flutter
- **Offline Support**: Service worker implementation
- **Multi-language**: i18n support

### Technical Improvements
- **Micro-frontends**: Module federation
- **GraphQL**: Alternative to REST API
- **PWA**: Progressive Web App features
- **Testing**: Increased coverage
- **Performance**: Further optimizations

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

---

**Built with ❤️ using Angular 18, Tailwind CSS, and modern web technologies.**