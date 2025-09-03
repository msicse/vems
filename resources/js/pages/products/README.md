# Product Management

This directory contains the product management pages for the Laravel + React + Inertia.js application.

## Features

### ✅ Product Creation (`create.tsx`)
- **Comprehensive Form Validation**: Both client-side and server-side validation
- **Smart Category Management**: Suggests existing categories or allows custom input
- **Price Formatting**: Automatically formats and validates price input
- **Rich Text Description**: Multi-line description with character counting
- **Status Management**: Active, inactive, and pending status options
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Full ARIA support and keyboard navigation

### ✅ Product Listing (`index.tsx`)
- **Advanced Data Table**: Sorting, filtering, and pagination
- **Export Functionality**: CSV, Excel, and PDF export options
- **Search & Filter**: Real-time search and category/status filters
- **Statistics Dashboard**: Overview of product metrics
- **Bulk Actions**: Multi-select operations

## Usage

### Creating a Product

1. Navigate to the products page
2. Click "Add Product" button
3. Fill in the required fields:
   - **Product Name**: Unique, descriptive name
   - **Description**: Detailed product description (10-1000 characters)
   - **Price**: Numeric value (supports currency symbols)
   - **Category**: Select existing or enter new category
   - **Status**: Active, inactive, or pending

### Form Validation

The create product form includes comprehensive validation:

**Client-Side Validation:**
- Real-time validation as you type
- Immediate feedback for errors
- Prevents submission with invalid data

**Server-Side Validation:**
- Duplicate name detection
- Data sanitization
- Security validation

**Validation Rules:**
```php
'name' => 'required|string|max:255|unique:products,name'
'description' => 'required|string|max:1000'
'price' => 'required|numeric|min:0|max:999999.99'
'category' => 'required|string|max:255'
'status' => 'required|string|in:active,inactive,pending'
```

### Form Components Used

The create product form demonstrates the reusable form components:

```tsx
import { 
  BaseForm, 
  FormField, 
  FormSelect, 
  FormTextarea,
  FormActions,
  FormSection
} from '@/base-components/base-form';
```

**Components:**
- `BaseForm`: Main form container with loading states
- `FormField`: Standard input fields with validation
- `FormSelect`: Dropdown with options
- `FormTextarea`: Multi-line text input
- `FormSection`: Groups related fields
- `FormActions`: Button container with loading states

### Success/Error Handling

The application includes a flash message system:

**Success Messages:**
- Displayed after successful product creation
- Auto-dismiss after 5 seconds
- Positioned in top-right corner

**Error Messages:**
- Field-level validation errors
- Server-side error handling
- Clear, actionable error messages

## API Endpoints

### Product Creation
```
POST /products
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description...",
  "price": "29.99",
  "category": "Electronics",
  "status": "active"
}
```

**Response (Success):**
```
302 Redirect to /products
Session: success = "Product created successfully!"
```

**Response (Validation Error):**
```json
{
  "errors": {
    "name": ["The name field is required."],
    "price": ["The price must be a number."]
  }
}
```

## Testing

The product creation functionality includes comprehensive tests:

```bash
# Run product tests
php artisan test tests/Feature/ProductTest.php

# Run specific test
php artisan test --filter "can create a product with valid data"
```

**Test Coverage:**
- ✅ Form display
- ✅ Successful creation
- ✅ Validation rules
- ✅ Authorization
- ✅ Category management
- ✅ Price formatting
- ✅ Error handling

## Database

### Products Table Schema
```sql
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(255) NOT NULL,
    status ENUM('active', 'inactive', 'pending') NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);
```

### Sample Data

Use the ProductSeeder to populate test data:

```bash
php artisan db:seed --class=ProductSeeder
```

This creates:
- 15 realistic sample products
- 35 additional random products using factories
- Various categories and statuses
- Price range from $24.99 to $2,499.00

## File Structure

```
resources/js/pages/products/
├── index.tsx           # Product listing page
├── create.tsx          # Product creation form
└── README.md          # This documentation

app/Http/
├── Controllers/
│   └── ProductController.php    # Product CRUD operations
└── Requests/
    └── ProductStoreRequest.php  # Validation rules

database/
├── factories/
│   └── ProductFactory.php      # Test data generation
├── migrations/
│   └── *_create_products_table.php
└── seeders/
    └── ProductSeeder.php       # Sample data

tests/Feature/
└── ProductTest.php            # Comprehensive tests
```

## Best Practices Demonstrated

1. **Form Validation**: Comprehensive client and server-side validation
2. **User Experience**: Real-time feedback and loading states
3. **Accessibility**: ARIA labels and keyboard navigation
4. **Type Safety**: Full TypeScript integration
5. **Testing**: Comprehensive test coverage
6. **Code Reusability**: Modular form components
7. **Error Handling**: Graceful error display and recovery
8. **Performance**: Optimized form rendering and validation

## Next Steps

Potential enhancements:
- [ ] Image upload functionality
- [ ] Bulk product import
- [ ] Product variants (size, color, etc.)
- [ ] Inventory tracking
- [ ] Product categories management
- [ ] Advanced search filters
- [ ] Product reviews and ratings
