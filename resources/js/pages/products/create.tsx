import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/base-components/page-header';
import {
  BaseForm,
  FormField,
  FormSelect,
  FormTextarea
} from '@/base-components/base-form';
import {
  useFormValidation,
  commonValidationRules,
  ValidationRules
} from '@/hooks/use-form-validation';

/**
 * Create Product Page
 *
 * Features:
 * - Comprehensive form validation
 * - Category suggestions with custom input
 * - Price formatting
 * - Rich text description
 * - Status selection
 * - Responsive design
 */

type ProductForm = {
  name: string;
  description: string;
  price: string;
  category: string;
  status: string;
};

interface CreateProductProps {
  categories: string[];
  statusOptions: Array<{ label: string; value: string }>;
}

// Enhanced status options with icons and descriptions
const enhancedStatusOptions = [
  {
    label: "Active",
    value: "active",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    description: "Product is live and available for purchase"
  },
  {
    label: "Pending",
    value: "pending",
    icon: <Clock className="h-4 w-4 text-amber-600" />,
    description: "Product is under review before going live"
  },
  {
    label: "Inactive",
    value: "inactive",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    description: "Product is hidden from customers"
  }
];

export default function CreateProduct({ categories, statusOptions }: CreateProductProps) {
  const { data, setData, post, processing, errors: serverErrors, reset } = useForm<Required<ProductForm>>({
    name: '',
    description: '',
    price: '',
    category: '',
    status: 'active',
  });

  // Define validation rules
  const validationRules: ValidationRules<ProductForm> = {
    name: [
      commonValidationRules.required('Product name is required'),
      commonValidationRules.minLength(2, 'Product name must be at least 2 characters'),
      commonValidationRules.maxLength(255, 'Product name must be less than 255 characters')
    ],
    description: [
      commonValidationRules.required('Product description is required'),
      commonValidationRules.minLength(10, 'Description must be at least 10 characters'),
      commonValidationRules.maxLength(1000, 'Description must be less than 1000 characters')
    ],
    price: [
      commonValidationRules.required('Price is required'),
      (value) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return 'Price must be a valid number';
        if (numValue < 0) return 'Price must be a positive number';
        if (numValue > 999999.99) return 'Price cannot exceed $999,999.99';
        return undefined;
      }
    ],
    category: [
      commonValidationRules.required('Category is required'),
      commonValidationRules.maxLength(255, 'Category must be less than 255 characters')
    ],
    status: [
      commonValidationRules.required('Status is required'),
      commonValidationRules.oneOf(['active', 'inactive', 'pending'], 'Invalid status selected')
    ]
  };

  // Initialize validation hook
  const {
    errors: clientErrors,
    validate,
    clearError,
    hasErrors
  } = useFormValidation(validationRules);

  // Combine server and client errors (server errors take precedence)
  const getFieldError = (field: keyof ProductForm): string | undefined => {
    return serverErrors[field] || clientErrors[field];
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    // Run client-side validation
    const validationErrors = validate(data);

    if (hasErrors(validationErrors)) {
      // Don't submit if there are validation errors
      return;
    }

    // Submit the form
    post(route('products.store'), {
      onSuccess: () => {
        // Redirect will be handled by the controller
      },
      onError: (errors) => {
        console.log('Server validation errors:', errors);
      }
    });
  };

  // Clear client error when user starts typing
  const handleFieldChange = (field: keyof ProductForm, value: string) => {
    setData(field, value);
    clearError(field);
  };

  // Calculate form completion percentage
  const getFormCompletion = () => {
    const requiredFields = ['name', 'description', 'price', 'category', 'status'];
    const completedFields = requiredFields.filter(field => {
      const value = data[field as keyof ProductForm];
      return value && value.toString().trim() !== '';
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const formCompletion = getFormCompletion();

  // Format price input
  const handlePriceChange = (value: string) => {
    // Remove any non-numeric characters except decimal point
    const cleanValue = value.replace(/[^\d.]/g, '');

    // Ensure only one decimal point
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      const formatted = parts[0] + '.' + parts.slice(1).join('');
      handleFieldChange('price', formatted);
    } else {
      handleFieldChange('price', cleanValue);
    }
  };

  // Create category options from existing categories
  const categoryOptions = [
    ...categories.map(cat => ({
      label: cat,
      value: cat
    })),
    { label: "Add new category...", value: "__custom__" }
  ];

  // Handle category selection including custom input
  const handleCategoryChange = (value: string) => {
    if (value === "__custom__") {
      // For now, we'll just clear the field to allow custom input
      // In a real app, you might want to show a modal or inline input
      handleFieldChange('category', '');
    } else {
      handleFieldChange('category', value);
    }
  };

  return (
    <AppLayout>
      <Head title="Create Product" />

      <div className="space-y-8">
        <PageHeader
          title="Create Product"
          description="Add a new product to your inventory"
          actions={[
            {
              label: "Back to Products",
              icon: <ArrowLeft className="h-4 w-4" />,
              href: route('products.index'),
              variant: "outline"
            }
          ]}
        />

        <div className="max-w-4xl">
          <BaseForm onSubmit={submit} processing={processing}>
            {/* Single Card with Two Column Layout */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Product Details</CardTitle>
                      <CardDescription>Fill in the information below to create your product</CardDescription>
                    </div>
                  </div>
                  {/* Progress Indicator */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium flex items-center gap-1">
                        {formCompletion}%
                        {formCompletion === 100 && <CheckCircle className="h-3 w-3 text-green-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                    <div className="w-16 bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          formCompletion === 100 ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${formCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Two Column Grid */}
                <div className="grid gap-8 md:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField
                      label="Product Name"
                      name="name"
                      value={data.name}
                      onChange={(value) => handleFieldChange('name', value)}
                      error={getFieldError('name')}
                      placeholder="Enter product name"
                      required
                      autoFocus
                    />

                    <FormField
                      label="Price (USD)"
                      name="price"
                      value={data.price}
                      onChange={handlePriceChange}
                      error={getFieldError('price')}
                      placeholder="29.99"
                      required
                    />

                    {data.category && !categories.includes(data.category) ? (
                      <div className="space-y-2">
                        <FormField
                          label="Category"
                          name="category"
                          value={data.category}
                          onChange={(value) => handleFieldChange('category', value)}
                          error={getFieldError('category')}
                          placeholder="Enter custom category"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 text-xs text-primary"
                          onClick={() => handleFieldChange('category', '')}
                        >
                          ← Choose from list
                        </Button>
                      </div>
                    ) : (
                      <FormSelect
                        label="Category"
                        name="category"
                        value={data.category}
                        onChange={handleCategoryChange}
                        error={getFieldError('category')}
                        options={categoryOptions}
                        placeholder="Select category..."
                        required
                      />
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormTextarea
                      label="Description"
                      name="description"
                      value={data.description}
                      onChange={(value) => handleFieldChange('description', value)}
                      error={getFieldError('description')}
                      placeholder="Describe your product..."
                      rows={4}
                      maxLength={1000}
                      required
                    />

                    <FormSelect
                      label="Status"
                      name="status"
                      value={data.status}
                      onChange={(value) => handleFieldChange('status', value)}
                      error={getFieldError('status')}
                      options={statusOptions}
                      required
                    />

                    {/* Status Preview */}
                    {data.status && (
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <div className="flex items-center gap-2">
                          {enhancedStatusOptions.find(opt => opt.value === data.status)?.icon}
                          <div>
                            <div className="font-medium text-sm">
                              {enhancedStatusOptions.find(opt => opt.value === data.status)?.label}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {enhancedStatusOptions.find(opt => opt.value === data.status)?.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Preview */}
                {data.price && !isNaN(parseFloat(data.price)) && (
                  <div className="flex items-center justify-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Display Price</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        ${parseFloat(data.price).toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={processing}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={formCompletion < 100 || processing}
              >
                <Plus className="h-4 w-4" />
                Create Product
              </Button>
            </div>
          </BaseForm>
        </div>

        {/* Debug information in development */}
        {process.env.NODE_ENV === 'development' && Object.keys(clientErrors).length > 0 && (
          <div className="max-w-4xl">
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive text-sm mb-2">Validation Errors:</h4>
              <ul className="text-xs text-destructive space-y-1">
                {Object.entries(clientErrors).map(([field, error]) => (
                  <li key={field}>• {field}: {error}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
