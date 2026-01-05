# System Design: Lead Tracker & Manager

## 1. High-Level Architecture
The application is a client-side Single Page Application (SPA) built with **React** and **Vite**, designed for high interactivity and data-heavy operations (similar to a CRM or Data Grid). It relies on **Supabase** for Backend-as-a-Service (BaaS), handling database, authentication, and security.

### Core Stack
*   **Frontend**: React 18, TypeScript, Vite
*   **State Management**:
    *   **Server State**: `@tanstack/react-query` (Caching, synchronization, and optimistic updates).
    *   **UI State**: React Context (`ActionHistoryContext` for Undo/Redo) and local component state.
*   **Routing**: React Router v6.
*   **Styling**: CSS Modules and standard CSS variables (`index.css`) for theming; `Lucide React` for icons.
*   **Database**: PostgreSQL (via Supabase).
*   **External Libraries**:
    *   `papaparse` & `xlsx` (Data Import/Export).
    *   `date-fns` (Date formatting).

---

## 2. Data Model (Schema)

The database schema is designed to be flexible, supporting both structured core business data and dynamic custom fields.

### Core Entities

#### 1. Lead
The central entity representing a potential client or business.
*   **Identity**: `id` (UUID), `created_at`.
*   **Business Info**: `business_name`, `contact_name`, `email`, `phone`.
*   **Categorization**:
    *   `niche`: Enum ('Cafe', 'Gym', 'Clinic', 'Other').
    *   `city`, `country`.
*   **Online Presence**: `website`, `website_status` ('yes', 'no', 'bad'), `social_media`, `map` (URL).
*   **Pipeline Tracking**:
    *   `deal_stage`: Enum ('New', 'Contacting', 'Interested', 'Proposal', 'Closed', 'Lost').
    *   `priority`: 'High', 'Medium', 'Low'.
    *   `contacted`: Boolean.
    *   `follow_up_date`: Date string.
*   **Extensibility**: `custom_data` (JSONB) - Stores user-defined fields (e.g., specific metrics).

#### 2. Custom Field
Defines dynamic columns available in the leads table.
*   **Structure**: `id`, `key`, `name`, `type` ('text', 'number', 'date', 'boolean', 'url').

---

## 3. Frontend Architecture & Modules

### A. Layout Structure
*   **AuthLayout**: Wraps protected routes, ensuring user authentication.
*   **MainLayout**: Provides the application shell, likely containing the sidebar/navigation and main content area.

### B. Route Structure (App.tsx)
*   **Dashboard** (`/`): Main overview.
*   **Leads Management** (`/leads`): The core workload interface.
*   **Reference Data Managers**: `/niches`, `/cities`, `/countries`.
*   **Activity Logs**: `/activity`.

### C. Core Feature: Leads Page (`LeadsPage.tsx`)
This is the most complex component, functioning as a high-performance data grid.

1.  **State Management Strategy**:
    *   **Optimistic UI**: Changes are applied locally to `pendingUpdates` immediately, providing instant feedback.
    *   **Auto-Save**: A "debounced" effect triggers server saves after 2 seconds of inactivity, or on specific update thresholds.
    *   **Undo/Redo System**: A specialized `ActionHistoryContext` tracks changes to leads (single or bulk), allowing users to revert actions locally before they are finalized or even after (by reversing the logic).

2.  **Filtering & Sorting**:
    *   **Filters**: Multi-select support for Niche, City, Deal Stage, and Boolean filters for "Contacted".
    *   **Search**: Local filtering across multiple text fields (Business Name, City, Email, Website).
    *   **Sorting**: Supports sorting on root fields and JSONB `custom_data` fields, with specific logic for numeric vs. string comparisons.

3.  **Components**:
    *   `LeadsTable`: Principal view for rendering data.
    *   `LeadsToolbar`: Control bar for search, filtering, and bulk operations.
    *   `ColumnManager`: Allows toggling visibility of columns and adding new custom fields to the schema.
    *   `ImportModal`: Handles CSV/XLSX parsing and bulk insertion.

### D. Activity Tracking
*   **ActionHistoryProvider**: Global context that records user actions defined with `undo` and `redo` functions. This powers the "command-z" style experience within the app.

---

## 4. Integration Logic
*   **Supabase Client** (`lib/supabaseClient`): Typesafe database interaction.
*   **React Query**:
    *   Handles data fetching (`useQuery`) with 5-minute stale times to reduce DB load.
    *   Handles mutations (`useMutation`) for CRUD operations, triggering cache invalidation (`invalidateQueries`) to refresh UI.
*   **Local Storage**: Used via custom hooks to persist user preferences like "visible columns" (`leads_visible_columns_v2`) and temporary "pending updates" to prevent data loss on refresh.

## 5. Security & Access Control
*   **Row Level Security (RLS)**: Database policies in Supabase restrict access.
*   **App-Level**: The `AuthLayout` ensures only authenticated sessions can access the application routes.
