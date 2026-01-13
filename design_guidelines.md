# Route Tracking Application - Design Guidelines

## Design Approach
**Material Design-inspired** with **Google Maps reference** for familiarity in navigation/location contexts. Focus on utility, clarity, and efficient route management workflows.

## Typography
- **Primary Font**: Inter (via Google Fonts CDN)
- **Hierarchy**: 
  - Hero/Display: 3xl-4xl, font-bold
  - Section Headers: 2xl, font-semibold
  - Body/Cards: base, font-normal
  - Labels/Meta: sm, font-medium, text-gray-600

## Layout System
**Spacing Primitives**: Use Tailwind units of 4, 6, 8, 12, 16, 20
- Component padding: p-4 to p-8
- Section spacing: py-12 to py-20
- Card gaps: gap-6
- Maximum content width: max-w-7xl

## Core Components

### Navigation
Top navbar with search-first design:
- Logo left (h-8)
- Centered prominent search bar (max-w-2xl, rounded-lg, shadow-sm)
- Right-aligned user menu and notification bell icon
- Sticky positioning on scroll

### Hero Section
Clean, purposeful hero with route visualization imagery:
- Height: 60vh (not full viewport)
- Large centered search input (oversized, w-full max-w-3xl)
- Heading: "Track Your Routes in Real Time"
- Subheading with value proposition
- Blurred backdrop overlay (backdrop-blur-md bg-white/10) for text readability
- CTA button with blurred background (backdrop-blur-sm bg-white/20) - no hover states defined

### Search Interface
Prominent throughout experience:
- Autocomplete dropdown with recent searches
- Filter chips (Active, Completed, Scheduled)
- Map/List view toggle
- Sort options dropdown

### Route Cards
Grid layout for search results (grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6):
- Card structure: rounded-xl, shadow-md, p-6
- Route name (text-lg font-semibold)
- Start/End locations with location pin icons
- Status badge (colored, rounded-full pill)
- ETA/Distance metrics
- Action buttons: View Details, Get Notifications

### Empty States
For pre-search home page:
- Centered illustration/icon (h-32)
- "Start by searching for a route" message
- Quick action suggestions below

### Notification Panel
Slide-out drawer (right-side):
- List of route updates
- Timestamp and route name
- Status change indicators
- Mark as read functionality

## Images

### Hero Image
**Description**: Aerial view of highway interchange or modern city roads at dusk/night with light trails from vehicles, conveying movement and connectivity
**Placement**: Full-width hero background with gradient overlay (from transparent to slight dark vignette)
**Treatment**: Subtle blur for depth, ensure text legibility with backdrop-blur on overlays

### Optional Card Thumbnails
Small map preview thumbnails in route cards (aspect-ratio-video, rounded-lg)

## Component Patterns
- **Icons**: Heroicons via CDN (outline style for UI, solid for emphasis)
- **Buttons**: Primary (blue gradient), Secondary (gray), Ghost for tertiary actions
- **Inputs**: Rounded-lg with focus ring, left-aligned icons for search/location fields
- **Badges**: Rounded-full pills for status (green for active, gray for completed, blue for scheduled)

## Interaction Principles
- Search triggers immediately on input (debounced)
- Loading states with skeleton screens for route cards
- Smooth transitions between empty/populated states (300ms ease)
- No route listing by default - clean slate encourages search action

## Accessibility
- High contrast text on images (use backdrop blur + shadows)
- Aria labels for all icon buttons
- Keyboard navigation for search autocomplete
- Focus indicators on all interactive elements