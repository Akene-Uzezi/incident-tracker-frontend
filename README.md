# Incident Tracker

A production-ready incident management system built with Next.js 16, designed for workplace safety and technical incident reporting and tracking.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Authentication](#authentication)
- [API Integration](#api-integration)
- [Roles & Permissions](#roles--permissions)
- [Navigation](#navigation)
- [Incident Data Structure](#incident-data-structure)
- [Components](#components)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Features

- **Incident Reporting**: Multi-step public form for submitting workplace safety incidents
- **Incident Management**: View, filter, and update incident status via dashboard
- **User Authentication**: JWT-based login/logout with token persistence
- **User Management**: Register new users (Admin+), enable/disable accounts (Super Admin)
- **Password Override**: Administrative password reset (Super Admin only)
- **Role-Based Access**: Four-tier role system (Reporter, Supervisor, Admin, Super Admin)
- **Severity Classification**: Color-coded badges (Critical, Major, Minor, Near Miss)
- **Status Tracking**: Resolved, In Progress, Unresolved with visual indicators
- **Pagination**: Efficient incident list browsing
- **Responsive Design**: Mobile-friendly sidebar and layouts
- **Dark Mode**: Theme support via `next-themes`
- **Toast Notifications**: Success/error feedback via `sonner`

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16.2.7 |
| UI Library | React 19.2.4 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui 4.10.0, Radix UI 1.4.3 |
| Icons | Lucide React |
| Animations | Framer Motion |
| Notifications | Sonner |
| Themes | next-themes |

## Project Structure

```
incidenttracker/
├── .env                          # Environment variables (API URL)
├── .gitignore
├── AGENTS.md                     # AI agent guidelines
├── README.md                     # This file
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── package.json
├── postcss.config.mjs            # PostCSS/Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
│
├── app/
│   ├── favicon.ico
│   ├── globals.css               # Global styles + CSS variables
│   ├── layout.tsx                # Root layout (HTML shell + Toaster)
│   ├── page.tsx                  # PUBLIC: Multi-step incident reporting form
│   │
│   ├── (auth)/
│   │   ├── layout.tsx            # Auth layout (centered card wrapper)
│   │   └── login/
│   │       └── page.tsx          # Login page (email/password, JWT)
│   │
│   └── (dashboard)/
│       ├── layout.tsx            # Dashboard layout (sidebar + auth guard)
│       ├── types/
│       │   └── navTypes.ts       # NavigationItem type definitions
│       └── dashboard/
│           ├── page.tsx          # Incident listing table + detail dialog
│           ├── IncidentTable.tsx # Incident table component
│           ├── IncidentDetails.tsx # Incident detail dialog component
│           ├── AdminManagementForm.tsx # Management report form component
│           ├── register/page.tsx # User registration (Admin+ only)
│           ├── users/page.tsx    # User search/enable-disable (Super Admin)
│           └── resetpassword/page.tsx # Password override (Super Admin)
│
├── components/
│   └── ui/
│       ├── alert.tsx            # Alert, AlertTitle, AlertDescription, AlertAction
│       ├── button.tsx           # Button with variants and sizes
│       ├── card.tsx             # Card, CardHeader, CardContent, CardFooter
│       ├── dialog.tsx           # Dialog, DialogContent, DialogHeader
│       ├── input.tsx            # Input field
│       ├── label.tsx            # Form label (Radix-based)
│       ├── select.tsx           # Select, SelectTrigger, SelectContent, SelectItem
│       ├── sonner.tsx           # Themed toast notifications
│       ├── table.tsx            # Table, TableHeader, TableBody, TableRow
│       └── textarea.tsx         # Multi-line text input
│
├── lib/
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
└── public/
    ├── images/
    │   └── rhv logo.png
    └── ...static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
cd incidenttracker
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_apiurl=http://localhost:3001/api/v1
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_apiurl` | Base URL of the backend API | Yes |

> **Note**: The `NEXT_PUBLIC_` prefix exposes the variable to the browser. Do not put sensitive server-only secrets here.

## Authentication

The application uses JWT token-based authentication:

1. User logs in via `/login` with email and password
2. Server returns `{ token, user }`
3. Token and user data are stored in `localStorage`
4. Subsequent API requests include `Authorization: Bearer ${token}` header
5. On 401 responses, token is cleared and user is redirected to `/login`

### Token Storage

```typescript
// Storing after login
localStorage.setItem("token", token);
localStorage.setItem("user", JSON.stringify(user));

// Retrieving for API calls
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "{}");
```

## API Integration

### Base URL

All API calls use the configured base URL:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_apiurl;
```

### Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/auth/login` | No | Authenticate user, returns `{ token, user }` |
| POST | `/auth/register` | Yes (Admin+) | Register new user |
| GET | `/incidents?page=N&limit=10` | Yes | Fetch paginated incident list |
| GET | `/incidents/{id}/management` | Yes | Get management report for incident |
| POST | `/incidents` | No | Create new incident report |
| POST | `/incidents/{id}/management` | Yes (Admin+) | Create management report |
| PATCH | `/incidents/{id}/status` | Yes | Update incident status |
| GET | `/user?email={email}` | Yes (Super Admin) | Search user by email |
| PUT | `/auth/enable` | Yes (Super Admin) | Enable user account |
| PUT | `/auth/disable` | Yes (Super Admin) | Disable user account |
| PUT | `/auth/resetpassword` | Yes (Super Admin) | Reset user password |

### Request Headers

```typescript
const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};
```

### Example API Call

```typescript
const response = await fetch(`${process.env.NEXT_PUBLIC_apiurl}/incidents?page=1&limit=10`, {
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
  throw new Error("Failed to fetch incidents");
}

const data = await response.json();
```

## Roles & Permissions

| Feature | Reporter | Supervisor | Admin | Super Admin |
|---------|----------|------------|-------|-------------|
| Submit incident reports (public) | Yes | Yes | Yes | Yes |
| View dashboard incidents | Yes | Yes | Yes | Yes |
| Submit reports via dashboard | Yes | Yes | Yes | Yes |
| Register new users | No | No | Yes | Yes |
| Manage users (enable/disable) | No | No | No | Yes |
| Reset user passwords | No | No | No | Yes |

### Checking Roles

```typescript
const user = JSON.parse(localStorage.getItem("user") || "{}");

// Check for Super Admin
if (user.role === "superadmin") {
  // Show Super Admin features
}

// Check for Admin or above
if (user.role === "admin" || user.role === "superadmin") {
  // Show Admin features
}
```

## Navigation

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Multi-step incident reporting form |
| `/login` | Authentication page |

### Protected Routes (Dashboard)

| Route | Access | Description |
|-------|--------|-------------|
| `/dashboard` | All authenticated users | Incident listing with pagination |
| `/dashboard/register` | Admin+ | User registration form |
| `/dashboard/users` | Super Admin | User search and status management |
| `/dashboard/resetpassword` | Super Admin | Password override |

### Sidebar Navigation

The dashboard features a collapsible sidebar with:
- **All users**: View Incidents, Report an Incident
- **Super Admin only**: Add User, Users, Reset Password
- **Logout** button
- Mobile-responsive hamburger menu

## Incident Data Structure

### Incident Report Interface

```typescript
export interface IncidentReport {
  id: number;
  principalName: string;
  principalGender: string;
  principalDob: string;
  principalType: string;
  patientId?: string;
  patientWardDept?: string;
  staffJobTitle?: string;
  staffPhone?: string;
  staffPlaceOfWork?: string;
  staffSite?: string;
  peopleInvolved: string;
  dateOfIncident: string;
  timeOfIncident: string;
  locationOfIncident: string;
  incidentWardDept: string;
  witnesses?: string;
  witnessType?: string;
  witnessWardDept?: string;
  witnessJobTitle?: string;
  witnessPhone?: string;
  isNearMiss: boolean;
  causeGroup: string;
  causes: string;
  prescribingDoctor?: string;
  treatmentReceived: string;
  equipmentInvolved: string;
  equipmentModel?: string;
  equipmentSentForRepair: boolean;
  equipmentWithdrawn: boolean;
  equipmentRetained: boolean;
  equipmentNumber?: string;
  isMedicalDevice?: string;
  reporterName: string;
  reporterDesignation: string;
  signature: boolean;
  reporterInfo: string;
  date: string;
  severityLevel: "critical" | "major" | "minor" | "near miss";
  incidentStatus: "unresolved" | "inprogress" | "resolved";
}
```

### Management Report Interface

```typescript
export interface IncidentManagement {
  id?: number;
  incidentId: number;
  impactOnService: string;
  contributoryFactors: string;
  actionsTakenOutcomes: string;
  recommendations: string;
  lessonsLearned: string;
  informedPatient: boolean;
  informedRelative: boolean;
  informedSeniorManager: boolean;
  informedPharmacist: boolean;
  policeIncidentNumber?: string;
  informedOther?: string;
  riskSeverity: number;
  riskLikelihood: number;
  riskRating: number;
  ohsAbsenceOver3Days: boolean;
  ohsActOfViolenceOrDanger: boolean;
  ohsHospitalizationOver24Hours: boolean;
  ohsStaffName?: string;
  ohsStaffDob?: string;
  ohsStaffAddress?: string;
  managerName: string;
  managerSignature: boolean;
  managerDesignation: string;
  managerDate: string;
}
```

### Severity Levels

| Level | Color |
|-------|-------|
| Critical | Red |
| Major | Orange |
| Minor | Blue |
| Near Miss | Gray |

### Status Values

| Status | Color |
|--------|-------|
| Resolved | Emerald |
| In Progress | Amber |
| Unresolved | Rose |

## Components

### UI Components (shadcn/ui)

All components are in `components/ui/`:

| Component | Exports |
|-----------|---------|
| `Button` | `Button` with `variant="default|outline|destructive|ghost|link"` and `size="sm|default|lg|icon"` |
| `Input` | Standard input with focus/disabled states |
| `Label` | Radix-based form labels |
| `Textarea` | Multi-line text input |
| `Select` | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectValue`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` |
| `Card` | `Card`, `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription` |
| `Dialog` | `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogTrigger`, `DialogOverlay`, `DialogPortal`, `DialogClose` |
| `Alert` | `Alert`, `AlertTitle`, `AlertDescription` (uses `variant="default|destructive"`) |
| `Table` | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter`, `TableCaption` |
| `Toaster` | Themed toast notifications via `sonner` |

### Form Patterns

```typescript
"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function FormComponent() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_APIurl}/endpoint`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Request failed");

      toast.success("Operation successful");
      resetForm();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsLoading(false);
    }
  };
}
```

## Dashboard Components

### IncidentDetails Modal

The incident details dialog displays comprehensive incident information and management forms.

**Features:**
- **Header Section**: Shows incident ID, severity level badge, and status selector (admin only)
- **Left Sidebar**: Reporter details including name, designation, contact info, date filed, and signature status
- **Right Content Area**:
  - Principal Person Involved section with type-specific fields
  - Witness Details section (when witnesses exist)
  - Description & Treatment section
  - Equipment section (when equipment involved)
- **Admin Management Section**: Contains the `AdminManagementForm` component for follow-up reports

**Props:** See `IncidentDetails.tsx` for full interface

### AdminManagementForm

The management report form for creating/updating incident follow-up documentation.

**Display States:**
1. **Loading State**: Shows spinner while fetching existing report
2. **Existing Report View**: Displays read-only management report
3. **Form State**: Admin-only form with all management fields
4. **Empty State**: Shows prompt for admins to add first management report

**Form Sections:**
- **Operational Evaluation**: Impact on Service, Contributory Factors, Actions/Outcomes, Recommendations, Lessons Learned
- **Stakeholder Notifications**: Patient, Relative, Senior Manager, Pharmacist, Police, Other
- **Risk Assessment**: Severity (1-5), Likelihood (1-5), Rating (auto-calculated)
- **OHS Compliance**: Absence >3 days, Violence/Danger, Hospitalization >24h, Staff details
- **Authorization**: Manager Name, Designation, Date, Signature

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

### TypeScript Configuration

- Strict mode enabled
- Path alias: `@/*` maps to `./*`
- Target: ES2017
- Module resolution: bundler

### Code Conventions

- Use `"use client"` directive for components with hooks
- Destructure props at the top level
- Use `cn()` from `@/lib/utils` for conditional classNames
- Use `React.ComponentType<{ className?: string }>` for icon prop types
- Handle 401 responses by clearing storage and redirecting to `/login`

### Adding New Pages

1. Create a new directory in `app/` with the route name
2. Add a `page.tsx` file with the `"use client"` directive
3. Export a default function component
4. Add auth checks in `useEffect` if the route is protected

## Troubleshooting

### Common Issues

**API calls failing with CORS**
- Ensure the backend API allows requests from your frontend origin
- Check that `NEXT_PUBLIC_apiurl` is correctly set

**Authentication not persisting**
- Verify `localStorage` is available (not in SSR context)
- Check that the token is being stored correctly after login

**Dashboard redirecting to login**
- Clear browser localStorage and try again
- Verify the backend is returning a valid token

**Styles not applying**
- Ensure `globals.css` is imported in `app/layout.tsx`
- Check that Tailwind CSS is properly configured in `postcss.config.mjs`

### Build Errors

```bash
# Clear Next.js cache and rebuild
rm -rf .next
npm run build
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
