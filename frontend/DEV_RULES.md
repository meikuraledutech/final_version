# Development Rules & Best Practices

## Frontend-Backend Contract

### API Response Format

The backend returns responses in this format:

```json
{
  "message": "Operation successful",
  "user": { /* user object */ },
  "accessToken": "jwt_token_string",
  "refreshToken": "jwt_token_string"
}
```

**Key Points:**
- Tokens are at the top level (not nested in `data`)
- JWT tokens contain the full user information in the payload
- `role` field in JWT determines which dashboard to show

### JWT Token Structure

The accessToken is a JWT with this payload:

```json
{
  "userId": "uuid",
  "role": "superadmin|college-admin|trainer|students",
  "iat": 1234567890,
  "exp": 1234571490
}
```

**Important:**
- Always extract `role` from JWT for role-based access control
- Never assume role from API response - decode the token
- Use `decodeToken()` from `lib/auth.ts`

## Naming Conventions

### Authentication
- Use `useAuth()` hook for all auth-related operations
- Field names from auth claims: `user_id`, `email`, `role`, `permissions`, `groups`
- Store tokens in both Zustand store AND localStorage

### Routes & Pages
- Use lowercase for route names: `/home`, `/users`, `/colleges`, not `/Home`, `/Users`
- Match sidebar activeItem prop with exact menu item title

### Components
- UI components in `components/ui/` (shadcn/ui)
- Page-specific components in `components/`
- Guards and wrappers in `components/` (auth-guard, public-guard, etc.)
- Sidebar in `components/app-sidebar.tsx`

### Store (Zustand)
- Single source of truth: `authStore` from `store/authStore.ts`
- Use `authStore.getState()` to access state outside components
- Use hook syntax in components: `const { isAuthenticated } = useAuth()`

## Page Structure

### All Protected Pages Must Follow This Pattern:

```typescript
"use client"

function PageContent() {
  const { claims, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner />

  return (
    <SidebarProvider>
      <AppSidebar activeItem="Menu Item Title" />
      <SidebarInset>
        {/* Header - always include */}
        <header className="flex h-14 shrink-0 items-center gap-2 border-b">
          <SidebarTrigger />
          <Separator orientation="vertical" />
          <Breadcrumb>{/* Navigation breadcrumb */}</Breadcrumb>
          <div className="ml-auto">
            {/* User email, role badge, logout */}
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Your content here */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function PageName() {
  return (
    <AuthGuard>
      <PageContent />
    </AuthGuard>
  )
}
```

## Role-Based Access Control

### Role Definitions

**Super Admin (`superadmin`)**
- Can access: User Management, Colleges, Batch Management, Courses, Questions, Test, Settings
- Only 1 superadmin per system
- Cannot be deleted via frontend

**College Admin (`college-admin`)**
- Can access: Settings
- Tied to a specific college
- Manages college-level operations

**Trainer (`trainer`)**
- Can access: Settings
- Not tied to any college
- Can create and manage courses across colleges

**Students (`students`)**
- Can access: Courses, Test, Results, Batch, Settings
- Tied to a college
- Can take tests and view results

### Implementation

```typescript
const { claims } = useAuth()
const userRole = claims?.role

// For role-specific rendering
{userRole === "superadmin" && <AdminDashboard />}
{userRole === "students" && <StudentDashboard />}

// For permission checking
if (claims?.role !== "superadmin") {
  return <Unauthorized />
}
```

### Sidebar Navigation

The sidebar automatically shows different menus based on role:

```typescript
const navigationByRole = {
  superadmin: [/* 8 items */],
  "college-admin": [/* 2 items */],
  trainer: [/* 2 items */],
  students: [/* 6 items */],
}
```

Sidebar uses the `activeItem` prop to highlight the current page:

```typescript
<AppSidebar activeItem="Courses" />  // Highlights "Courses" in menu
```

## Authentication Flow

### Login
1. User submits email + password on `/login`
2. `handleLogin()` calls API with credentials
3. Response contains `accessToken` and `refreshToken`
4. `authStore.login()` is called with both tokens
5. Tokens are saved to store AND localStorage
6. User redirected to `/home`
7. PublicGuard prevents returning to `/login`

### Token Lifecycle
- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- **Storage**: Both Zustand store + localStorage

### Automatic Token Refresh
When a request gets 401:
1. API interceptor checks if it's an auth endpoint (skip refresh)
2. For other endpoints, call `/api/auth/refresh` with refreshToken
3. Update tokens in store and localStorage
4. Retry original request with new token
5. If refresh fails, logout user and redirect to `/login`

### Logout
```typescript
const handleLogout = () => {
  authStore.getState().logout()  // Clears store + localStorage
  router.push("/login")
}
```

## API Integration

### Using the API Client

```typescript
import api from "@/lib/api"

// The api instance automatically:
// - Adds Authorization header with accessToken
// - Handles token refresh on 401
// - Catches and logs errors

// Example
const response = await api.post("/api/auth/login", {
  email,
  password,
})

// Response structure
const { accessToken, refreshToken, user, message } = response.data
```

### Error Handling

```typescript
try {
  const response = await api.post("/endpoint", data)
  // Use response.data
} catch (err: any) {
  const errorMessage = err.response?.data?.error || "Request failed"
  toast.error(errorMessage)
}
```

## Component Best Practices

### AuthGuard
- Wrap all protected pages with AuthGuard
- Prevents unauthorized access
- Shows loading state while checking auth
- Redirects to login if not authenticated

```typescript
export default function ProtectedPage() {
  return (
    <AuthGuard>
      <PageContent />
    </AuthGuard>
  )
}
```

### PublicGuard
- Wraps the login page
- Redirects authenticated users to home
- Prevents logged-in users from seeing login page

### useAuth Hook
- Call at component level to get auth state
- Returns: `isAuthenticated`, `isLoading`, `claims`, `email`, `userId`
- Use `claims?.role` for role-based rendering
- Use helper methods: `isAdmin()`, `hasPermission()`, `isInGroup()`

### Sidebar
- Every page must have SidebarProvider
- Pass correct `activeItem` matching menu title
- SidebarTrigger on header for mobile menu

## Code Review Checklist

- [ ] Page wrapped with AuthGuard
- [ ] activeItem prop correct and matches menu title
- [ ] Role-based content uses claims?.role
- [ ] All API calls use api instance (not axios directly)
- [ ] Error handling with toast notifications
- [ ] Loading states implemented
- [ ] Mobile responsive (test with SidebarTrigger)
- [ ] Logout functionality works
- [ ] Header includes Breadcrumb, user info, logout button

## Common Patterns

### Protected Page Template
```typescript
"use client"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { authStore } from "@/store/authStore"
import { AuthGuard } from "@/components/auth-guard"
import { AppSidebar } from "@/components/app-sidebar"

function PageContent() {
  const router = useRouter()
  const { email, claims, isLoading } = useAuth()

  const handleLogout = () => {
    authStore.getState().logout()
    router.push("/login")
  }

  if (isLoading) return <Loading />

  return (
    <SidebarProvider>
      <AppSidebar activeItem="Page Title" />
      <SidebarInset>
        {/* Header and content */}
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function PageName() {
  return <AuthGuard><PageContent /></AuthGuard>
}
```

### Role-Based Content
```typescript
{userRole === "superadmin" && (
  <div>Admin content</div>
)}
{userRole === "students" && (
  <div>Student content</div>
)}
```

## Environment Variables

Only one required for development:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

- Use environment variables for API endpoint only
- Never hardcode API URLs
- Public variables (used in browser) must start with `NEXT_PUBLIC_`

## Testing Notes

### Manual Testing Checklist
- [ ] Can login with valid credentials
- [ ] See correct role dashboard after login
- [ ] Sidebar shows correct menu items for role
- [ ] Clicking menu items highlights correctly
- [ ] Can navigate to all accessible pages
- [ ] Logout works and redirects to login
- [ ] Can't access protected pages without login
- [ ] Can't access login page while logged in
- [ ] Mobile menu (SidebarTrigger) works
- [ ] Tokens persist after page refresh

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| User sees wrong role | Role not extracted from JWT | Check lib/auth.ts decodeToken |
| Sidebar wrong active | activeItem doesn't match title | Use exact menu item title from navigationByRole |
| Tokens not persisting | localStorage not working | Check browser storage, clear cache |
| 401 loop | Token refresh failing | Check /api/auth/refresh endpoint |
| Can't see login page | Already logged in | Use PublicGuard on login page |
| Can access protected page without login | AuthGuard not used | Wrap page with AuthGuard |

## Performance Tips

1. Use `useCallback` for event handlers to prevent re-renders
2. Use `useMemo` for complex calculations
3. Lazy load images in content areas
4. Use SidebarProvider at page level, not root
5. Don't call useAuth() multiple times - store result in variable

## Security

1. Never log sensitive data (tokens, passwords)
2. Always use HTTPS in production
3. Store tokens in secure storage (currently localStorage - consider httpOnly cookies)
4. Validate all user input before sending to API
5. Don't trust role from localStorage - always verify JWT
6. Clear tokens on logout
7. Implement CSRF protection if needed
