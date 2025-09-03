# Vehicle Management System

This directory contains the vehicle management pages for the Laravel + Inertia.js application.

## Features

### Vehicle Index Page (`index.tsx`)
- **Data Table**: Server-side paginated table with sorting and filtering
- **Search**: Full-text search across brand, model, color, registration number, and vendor
- **Filters**: Multi-select filters for brand, color, and status (active/inactive)
- **Actions**: View, Edit, and Delete buttons for each vehicle
- **Stats**: Dashboard showing total vehicles, active vehicles, brands, and inactive count
- **Responsive Design**: Mobile-friendly layout with collapsible sidebar

### Vehicle Show Page (`show.tsx`)
- **Vehicle Details**: Complete vehicle information display
- **System Information**: Creation and update timestamps
- **Actions**: Edit and Delete buttons
- **Responsive Cards**: Information organized in clean card layout

### Vehicle Edit Page (`edit.tsx`)
- **Form Validation**: Client and server-side validation
- **Pre-filled Data**: Form populated with existing vehicle data
- **Status Toggle**: Active/Inactive status selection
- **Responsive Form**: Two-column layout on larger screens

### Vehicle Create Page (`create.tsx`)
- **New Vehicle Form**: Complete form for adding new vehicles
- **Validation**: Required field validation and unique registration number
- **Default Values**: Sensible defaults (active status)
- **User-friendly Interface**: Clear labels and placeholders

## Database Schema

The vehicles table includes:
- `id` - Primary key
- `brand` - Vehicle brand (e.g., Toyota, Honda)
- `model` - Vehicle model (e.g., Camry, Civic)
- `color` - Vehicle color
- `registration_number` - Unique registration/license plate
- `vendor` - Optional vendor/dealer information
- `is_active` - Boolean status flag
- `created_at` / `updated_at` - Timestamps

## Backend Implementation

### VehicleController
- **index()**: Paginated listing with search and filters
- **create()**: Show create form
- **store()**: Save new vehicle with validation
- **show()**: Display single vehicle
- **edit()**: Show edit form
- **update()**: Update existing vehicle
- **destroy()**: Delete vehicle

### VehicleIndexRequest
- Validation for search, sorting, filtering, and pagination parameters
- Default values for sort (id, desc) and per_page (15)

### Routes
All standard RESTful routes are available:
- `GET /vehicles` - Index page
- `GET /vehicles/create` - Create form
- `POST /vehicles` - Store new vehicle
- `GET /vehicles/{vehicle}` - Show vehicle
- `GET /vehicles/{vehicle}/edit` - Edit form
- `PUT/PATCH /vehicles/{vehicle}` - Update vehicle
- `DELETE /vehicles/{vehicle}` - Delete vehicle

## Sample Data

The `VehicleSeeder` creates:
- 10 realistic sample vehicles with proper brands, models, and colors
- 15 additional random vehicles using the factory
- Mix of active and inactive vehicles for testing filters

## Navigation

Vehicles are accessible through:
- Main sidebar navigation (Car icon)
- Header navigation on mobile
- Breadcrumb navigation on all vehicle pages

## Usage Examples

### Accessing the Vehicle Index
```
/vehicles
```

### Creating a New Vehicle
```
/vehicles/create
```

### Viewing a Specific Vehicle
```
/vehicles/{id}
```

### Editing a Vehicle
```
/vehicles/{id}/edit
```

## Testing

To populate test data:
```bash
php artisan db:seed --class=VehicleSeeder
```

To run migrations:
```bash
php artisan migrate
```

## File Structure

```
resources/js/pages/vehicles/
├── index.tsx           # Vehicle listing page
├── create.tsx          # Vehicle creation form
├── edit.tsx           # Vehicle edit form
├── show.tsx           # Vehicle details page
└── README.md          # This documentation

app/Http/
├── Controllers/
│   └── VehicleController.php    # Vehicle CRUD operations
└── Requests/
    └── VehicleIndexRequest.php  # Validation rules

database/
├── migrations/
│   └── 2025_08_12_012740_create_vehicles_table.php
├── factories/
│   └── VehicleFactory.php
└── seeders/
    └── VehicleSeeder.php
```

## Dependencies

This implementation uses:
- **Laravel Inertia.js**: For seamless SPA experience
- **React**: Frontend framework
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **shadcn/ui**: UI components
- **Lucide React**: Icons
- **Server-side DataTable**: For efficient pagination and filtering
