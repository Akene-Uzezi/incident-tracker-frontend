<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Incident Tracker Agent Guidelines

## Project Overview

Incident Tracker is a Next.js 16 application for workplace safety incident management. It uses a custom App Router structure with route groups for authentication and protected dashboard routes.

## Project Structure

```
incidenttracker/
├── app/
│   ├── (auth)/login/page.tsx        # Authentication page (public)
│   ├── (dashboard)/                 # Protected routes with sidebar
│   │   ├── layout.tsx              # Dashboard layout with navigation
│   │   ├── types/navTypes.ts       # Navigation type definitions
│   │   └── dashboard/
│   │       ├── page.tsx            # Incident listing
│   │       ├── register/page.tsx   # User registration (Admin+)
│   │       ├── users/page.tsx      # User management (Super Admin)
│   │       └── resetpassword/page.tsx # Password reset (Super Admin)
│   ├── globals.css
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Public incident reporting form
├── components/ui/                  # shadcn/ui components
├── lib/utils.ts                    # Utility functions (cn helper)
└── ...config files
```

## Code Conventions

### File Naming
- Use `page.tsx` for route components
- Use `layout.tsx` for layout components
- Type definition files: `types/` directory with `PascalCase.ts` files

### React Patterns
- Use `"use client"` directive for client components
- Use `React.ComponentType<{ className?: string }>` for icon types
- Destructure props at the top level of components
- Use `cn()` helper from `@/lib/utils` for conditional className

### Styling
- Tailwind CSS 4 with CSS variables
- Dark mode support via `next-themes`
- Component variants: `"default" | "ghost"` for buttons
- Severity badges: critical (red), major (orange), minor (blue), near miss (gray)
- Status badges: resolved (emerald), inprogress (amber), unresolved (rose)

## Authentication & Authorization

### Token Management
- Token stored in `localStorage.getItem("token")`
- User data stored in `localStorage.getItem("user")`
- Always check for token before API calls
- Remove token and redirect to `/login` on 401 responses

### Role-Based Access
| Role | Dashboard | Register | Users | Reset Password |
|------|-----------|----------|-------|----------------|
| Reporter | ✓ | ✗ | ✗ | ✗ |
| Supervisor | ✓ | ✗ | ✗ | ✗ |
| Admin | ✓ | ✓ | ✗ | ✗ |
| Super Admin | ✓ | ✓ | ✓ | ✓ |

Check role via `user.role === "superadmin"` for Super Admin features.

## API Integration

### Environment
- Base URL: `process.env.NEXT_PUBLIC_apiurl` (defined in `.env`)
- Example: `http://192.168.9.227:3002/api/v1`

### Endpoints
- `GET /incidents?page=${page}&limit=10` - Paginated incident list
- `POST /auth/login` - Authentication (returns `{ token, user }`)
- `POST /incidents` - Create incident report
- `PATCH /incidents/${id}/status` - Update incident status
- `PUT /auth/${enable|disable}` - Toggle user status
- `PUT /auth/resetpassword` - Reset user password

### Headers
```typescript
{
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
}
```

## Component Usage

### UI Components (shadcn/ui)
- `Button` - Use `variant="default|outline|destructive"` and `size="sm|lg"`
- `Input` - Standard form input with `disabled` state
- `Label` - Form field labels with `className="text-xs font-bold uppercase"`
- `Textarea` - Multi-line text input
- `Select` - Dropdown with `SelectTrigger`, `SelectContent`, `SelectItem`
- `Card` - Container with `CardHeader`, `CardContent`, `CardFooter`
- `Dialog` - Modal with `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- `Alert` - Error/success messages with `AlertTitle`, `AlertDescription`
- `Table` - Data display with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`

### Framer Motion
- Use `motion.div`, `motion.button` for animations
- Variants pattern for staggered animations
- `whileTap` for button press effects

## State Management

### Local State
- Use `useState` for form inputs and UI state
- Use `useEffect` for authentication checks and data fetching
- Store pagination state separately from data

### Form Handling
- Reset forms on successful submission
- Clear error messages after 5 seconds
- Disable submit button during loading

## Error Handling

### Toaster Notifications
- Use `toast.success()` for success messages
- Use `toast.error()` for error messages
- Include specific error text from API responses

### Loading States
- Show loading indicators during API calls
- Use `Loader2` icon with `animate-spin`
- Disable buttons during submission

## Build & Quality

### Commands
```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Production server
npm run lint    # ESLint check
```

### TypeScript
- Strict mode enabled
- Path alias: `@/*` maps to `./`
- Check types before building

## File Patterns

### Page Component Template
```typescript
"use client";
import { useState, useEffect } from "react";
// ... other imports

export default function PageName() {
  const [state, setState] = useState(...);
  const router = useRouter();

  useEffect(() => {
    // Auth check, data fetch
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Content */}
    </div>
  );
}
```

### API Call Pattern
```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_apiurl}/endpoint`, {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

if (!response.ok) {
  if (response.status === 401) {
    localStorage.removeItem("token");
    router.push("/login");
  }
  throw new Error("Error message");
}
```

## DOs and DON'Ts

### DO
- Always use `"use client"` for components with hooks
- Check authentication before protected routes
- Use `process.env.NEXT_PUBLIC_apiurl` for API base
- Handle 401 responses by clearing storage and redirecting
- Use `cn()` for conditional classNames
- Add proper accessibility attributes (aria-label, title)

### DON'T
- Don't modify files in `node_modules/`
- Don't commit `.env` files with secrets
- Don't use `any` type - use proper TypeScript interfaces
- Don't mutate state directly - use setter functions
- Don't leave console.log statements in production code
