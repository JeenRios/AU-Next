# AU-Next Pages Documentation

## 📄 Page Structure

### Public Pages
- **Home** (`/`) - Landing page with hero, features, and CTA
- **Login** (`/login`) - Authentication page for users and admins

### User Pages (Protected)
- **Dashboard** (`/dashboard`) - User overview with stats and recent trades
- **My Trades** (`/trades`) - Complete trade history with filtering
- **Profile** (`/profile`) - User settings and preferences

### Admin Pages (Protected)
- **Admin Dashboard** (`/admin`) - System overview with trade management
- **Analytics** (`/admin/analytics`) - Advanced trading analytics and reports

---

## 🔐 Authentication

### Demo Accounts
```
Admin: admin@au.com / admin
User: user@au.com / user
```

### Authentication Flow
1. User logs in via `/login`
2. Credentials stored in localStorage
3. Protected routes check for user data
4. Redirect to appropriate dashboard based on role

---

## 📊 User Pages Details

### 1. Home Page (`/`)
**Purpose:** Landing page for new visitors

**Features:**
- Hero section with CTA
- Key statistics display
- Feature highlights
- Navigation to login/signup

**Route:** Public (no auth required)

---

### 2. Login Page (`/login`)
**Purpose:** User authentication

**Features:**
- Email/password form
- Demo account credentials shown
- Role-based redirect (admin → `/admin`, user → `/dashboard`)
- Form validation
- Error handling

**Route:** Public (redirects if already logged in)

---

### 3. User Dashboard (`/dashboard`)
**Purpose:** Main user interface after login

**Features:**
- Welcome message with username
- Quick stats cards:
  - Total trades
  - Buy orders
  - Sell orders
  - Average amount
- Recent trades table (last 5)
- Navigation to other user pages

**API Calls:**
- `GET /api/stats` - Trading statistics
- `GET /api/trades` - Recent trades

**Route:** Protected (user role)

---

### 4. My Trades Page (`/trades`)
**Purpose:** Complete trade history management

**Features:**
- Full trade history table
- Filter by type (ALL/BUY/SELL)
- Trade details:
  - ID, Symbol, Type, Amount, Price, Status, Date
- Responsive design
- Real-time data

**API Calls:**
- `GET /api/trades` - All user trades

**Route:** Protected (user role)

---

### 5. Profile Page (`/profile`)
**Purpose:** User settings and preferences

**Features:**
- Profile information display
- Editable fields:
  - Full name
  - Phone number
  - Email notifications toggle
- Avatar with user initial
- Role badge
- Edit/Save/Cancel functionality
- LocalStorage persistence

**Route:** Protected (user role)

---

## 🛠️ Admin Pages Details

### 1. Admin Dashboard (`/admin`)
**Purpose:** System administration and trade management

**Features:**
- Enhanced statistics:
  - Total trades
  - Buy/Sell breakdown with percentages
  - Unique symbols count
- Complete trades table with all records
- Add new trade functionality
- Modal form for trade creation
- Real-time updates

**API Calls:**
- `GET /api/stats` - System statistics
- `GET /api/trades` - All trades
- `POST /api/trades` - Create new trade

**Form Fields:**
- Symbol (text)
- Type (BUY/SELL)
- Amount (decimal)
- Price (decimal)
- Status (PENDING/COMPLETED)

**Route:** Protected (admin role only)

---

### 2. Analytics Page (`/admin/analytics`)
**Purpose:** Advanced trading analytics and insights

**Features:**
- Key metrics:
  - Total volume
  - Average trade value
  - Buy/Sell ratio
- Top 5 trading pairs with:
  - Trade count
  - Volume
  - Visual progress bars
- Trade distribution visualization
- Recent activity feed

**Calculations:**
- Symbol statistics aggregation
- Volume summation
- Percentage distributions
- Real-time sorting

**API Calls:**
- `GET /api/stats` - Statistics
- `GET /api/trades` - Trade data for analysis

**Route:** Protected (admin role only)

---

## 🎨 UI/UX Features

### Design System
- **Colors:** Purple/Pink gradient theme
- **Dark Mode:** Slate-900 to Purple-900 gradient background
- **Glass Morphism:** Backdrop blur effects
- **Animations:** Smooth transitions and hover effects

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px)
- Grid layouts adapt to screen size
- Mobile navigation (collapsible on smaller screens)

### Components
- Reusable Navbar component
- Consistent card designs
- Status badges (color-coded)
- Loading states
- Modal dialogs

---

## 🔄 Data Flow

### User Flow
```
1. Visit Home → Click "Get Started"
2. Login Page → Enter credentials
3. Dashboard → View stats and recent trades
4. My Trades → Filter and view all trades
5. Profile → Update settings
```

### Admin Flow
```
1. Login as admin
2. Admin Dashboard → System overview
3. Add New Trade → Create trade via modal
4. Analytics → View insights and trends
```

### API Integration
All pages fetch data from Next.js API routes:
- `/api/health` - System health check
- `/api/stats` - Trading statistics
- `/api/trades` - CRUD operations
- `/api/init` - Database initialization

---

## 📱 Page Routes Summary

| Route | Role | Purpose |
|-------|------|---------|
| `/` | Public | Landing page |
| `/login` | Public | Authentication |
| `/dashboard` | User | User overview |
| `/trades` | User | Trade history |
| `/profile` | User | User settings |
| `/admin` | Admin | Admin dashboard |
| `/admin/analytics` | Admin | Analytics |

---

## 🚀 Best Practices Implemented

### Security
- Role-based access control
- Protected routes with auth checks
- Client-side validation
- Secure logout functionality

### Performance
- Dynamic rendering for API routes
- Client-side data caching
- Optimized re-renders
- Lazy loading where appropriate

### Code Quality
- TypeScript for type safety
- Component reusability
- Consistent naming conventions
- Clean separation of concerns

### User Experience
- Clear navigation
- Intuitive UI elements
- Helpful error messages
- Loading states
- Demo credentials visible

---

## 🔧 Development Notes

### Adding New Pages
1. Create folder in appropriate group: `(auth)`, `(user)`, or `(admin)`
2. Add `page.tsx` with default export
3. Implement auth check if protected
4. Add navigation link in Navbar component
5. Update this documentation

### Styling
- Use Tailwind CSS utility classes
- Follow existing color scheme
- Maintain glass morphism effect
- Ensure responsive breakpoints

### State Management
- Use React hooks (useState, useEffect)
- localStorage for auth persistence
- Fetch API for server communication
- No external state library needed (yet)
