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
├── .env                          # Environment variables (API URL)
├── AGENTS.md                     # AI agent guidelines
├── README.md                     # Project documentation
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
│           ├── page.tsx              # Incident listing table + detail dialog
│           ├── IncidentTable.tsx     # Incident table component
│           ├── IncidentDetails.tsx   # Incident detail dialog component
│           ├── AdminManagementForm.tsx # Management report form component
│           ├── register/page.tsx     # User registration (Admin+ only)
│           ├── users/page.tsx        # User search/enable-disable (Super Admin)
│           └── resetpassword/page.tsx # Password override (Super Admin)
│
├── components/
│   └── ui/
│       ├── alert.tsx            # Alert, AlertTitle, AlertDescription
│       ├── button.tsx           # Button with variants and sizes
│       ├── card.tsx             # Card, CardHeader, CardContent, CardFooter
│       ├── dialog.tsx           # Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
│       ├── input.tsx            # Input field
│       ├── label.tsx            # Form label (Radix-based)
│       ├── select.tsx           # Select components with scroll buttons
│       ├── sonner.tsx           # Themed toast notifications
│       ├── table.tsx            # Table, TableHeader, TableBody, TableRow, TableHead, TableCell
│       └── textarea.tsx         # Multi-line text input
│
├── lib/
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
│
└── public/
    └── images/
        └── rhv logo.png
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

### Environment Variables

Create a `.env` file in the project root:

```env
NEXT_PUBLIC_apiurl=http://localhost:3002/api/v1
```

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_apiurl` | Base URL of the backend API | Yes |

> **Note**: The `NEXT_PUBLIC_` prefix exposes the variable to the browser. Do not put sensitive server-only secrets here.

## API Integration

### Environment
- Base URL: `process.env.NEXT_PUBLIC_apiurl` (defined in `.env`)
- Example: `http://192.168.9.227:3002/api/v1`

### Endpoints
- `GET /incidents?page=${page}&limit=10` - Paginated incident list
- `GET /incidents/${id}/management` - Get management report for incident
- `POST /incidents` - Create new incident report
- `POST /incidents/${id}/management` - Create management report
- `PATCH /incidents/${id}/status` - Update incident status
- `GET /user?email=${email}` - Search user by email (Super Admin)
- `PUT /auth/enable` - Enable user account
- `PUT /auth/disable` - Disable user account
- `PUT /auth/resetpassword` - Reset user password

### Headers
```typescript
{
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
}
```

## Data Structures

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

## Component Usage

### Dashboard Components

#### IncidentDetails Modal
The incident details dialog displays comprehensive incident information and management forms. Located at `app/(dashboard)/dashboard/IncidentDetails.tsx`.

**Features:**
- **Header Section**: Shows incident ID (#`{incident.id}`), severity level badge, and status selector (admin only)
- **Left Sidebar**: Reporter details including name, designation, contact info, date filed, and signature status
- **Right Content Area**:
  - Principal Person Involved section with type-specific fields (patient/staff/consultant/other)
  - Witness Details section (when witnesses exist)
  - Description & Treatment section showing cause group, prescribing doctor, root causes, and treatment received
  - Equipment section (when equipment involved) showing model, serial number, and disposition
- **Admin Management Section**: Contains the `AdminManagementForm` component for follow-up reports

**Props Interface:**
```typescript
interface IncidentDetailsProps {
  incident: IncidentReport | null;
  isAdmin: boolean;
  updatingStatus: boolean;
  loadingManagement: boolean;
  managementReport: IncidentManagement | null;
  isAddingManagement: boolean;
  submittingManagement: boolean;
  mgmtForm: Partial<IncidentManagement>;
  onClose: () => void;
  onStatusChange: (status: IncidentStatus) => void;
  onFormChange: (updated: Partial<IncidentManagement>) => void;
  onManagementSubmit: (e: React.FormEvent) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
}
```

#### AdminManagementForm
The management report form for creating/updating incident follow-up documentation. Located at `app/(dashboard)/dashboard/AdminManagementForm.tsx`.

**Display States:**
1. **Loading State**: Shows spinner while fetching existing report
2. **Existing Report View**: Displays read-only management report with:
   - Operational Evaluation (Impact on Service, Contributory Factors, Actions/Outcomes, Recommendations, Lessons Learned)
   - Stakeholder Notifications (Patient, Relative, Senior Manager, Pharmacist, Police, Other)
   - OHS Matrix (Absence >3 days, Violence/Danger, Hospitalization >24h, Staff details)
   - Risk Assessment (Severity, Likelihood, Rating product)
   - Sign-off Status (Manager name, designation, date, signature verification)
3. **Form State**: Admin-only form with all management fields for new/updated reports
4. **Empty State**: Shows prompt for admins to add first management report

**Form Fields:**
- **Operational Evaluation**: impactOnService, contributoryFactors, actionsTakenOutcomes, recommendations, lessonsLearned
- **Notifications**: informedPatient, informedRelative, informedSeniorManager, informedPharmacist, policeIncidentNumber, informedOther
- **Risk Assessment**: riskSeverity (1-5), riskLikelihood (1-5), riskRating (auto-calculated)
- **OHS Compliance**: ohsAbsenceOver3Days, ohsActOfViolenceOrDanger, ohsHospitalizationOver24Hours, ohsStaffName, ohsStaffDob, ohsStaffAddress
- **Authorization**: managerName, managerSignature, managerDesignation, managerDate

**Props Interface:**
```typescript
interface AdminManagementFormProps {
  isAdmin: boolean;
  loadingManagement: boolean;
  managementReport: IncidentManagement | null;
  isAddingManagement: boolean;
  submittingManagement: boolean;
  mgmtForm: Partial<IncidentManagement>;
  selectedIncident: IncidentReport;
  onFormChange: (updated: Partial<IncidentManagement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onStartAdding: () => void;
  onCancelAdding: () => void;
}
```

### UI Components (shadcn/ui)
- `Button` - Use `variant="default|outline|destructive|ghost|link"` and `size="sm|lg|icon"`
- `Input` - Standard form input with focus/disabled states
- `Label` - Radix-based form labels
- `Textarea` - Multi-line text input
- `Select` - `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectValue`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton`
- `Card` - Container with `CardHeader`, `CardContent`, `CardFooter`, `CardTitle`, `CardDescription`
- `Dialog` - Modal with `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogTrigger`, `DialogOverlay`, `DialogPortal`, `DialogClose`
- `Alert` - Error/success messages with `AlertTitle`, `AlertDescription`
- `Table` - Data display with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableFooter`, `TableCaption`

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
