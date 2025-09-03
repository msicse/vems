import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { 
  BaseForm, 
  FormField, 
  FormSelect, 
  FormCheckbox, 
  FormTextarea,
  FormActions,
  FormSection
} from '@/base-components/base-form';
import { 
  useFormValidation, 
  commonValidationRules,
  ValidationRules 
} from '@/hooks/use-form-validation';

/**
 * Example demonstrating form validation with the custom validation hook
 * 
 * This shows how to:
 * - Use client-side validation with custom rules
 * - Combine server-side and client-side errors
 * - Validate on submit and optionally on change
 * - Handle complex validation scenarios
 */

type UserForm = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  bio: string;
  terms: boolean;
  newsletter: boolean;
};

const roleOptions = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
];

export default function ValidatedFormExample() {
  const { data, setData, post, processing, errors: serverErrors, reset } = useForm<Required<UserForm>>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    bio: '',
    terms: false,
    newsletter: false,
  });

  // Define validation rules
  const validationRules: ValidationRules<UserForm> = {
    name: [
      commonValidationRules.required('Name is required'),
      commonValidationRules.minLength(2, 'Name must be at least 2 characters'),
      commonValidationRules.maxLength(50, 'Name must be less than 50 characters')
    ],
    email: [
      commonValidationRules.required('Email is required'),
      commonValidationRules.email('Please enter a valid email address')
    ],
    password: [
      commonValidationRules.required('Password is required'),
      commonValidationRules.minLength(8, 'Password must be at least 8 characters'),
      commonValidationRules.pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      )
    ],
    confirmPassword: [
      commonValidationRules.required('Please confirm your password'),
      commonValidationRules.confirmPassword(data.password, 'Passwords do not match')
    ],
    role: [
      commonValidationRules.required('Please select a role'),
      commonValidationRules.oneOf(['admin', 'editor', 'viewer'], 'Invalid role selected')
    ],
    bio: [
      commonValidationRules.maxLength(500, 'Bio must be less than 500 characters')
    ],
    terms: [
      (value) => !value ? 'You must accept the terms and conditions' : undefined
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
  const getFieldError = (field: keyof UserForm): string | undefined => {
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
    post(route('users.store'), {
      onSuccess: () => {
        reset();
        // Show success message
      },
      onError: (errors) => {
        // Server errors will be handled by Inertia
        console.log('Server validation errors:', errors);
      }
    });
  };

  // Clear client error when user starts typing
  const handleFieldChange = (field: keyof UserForm, value: any) => {
    setData(field, value);
    clearError(field);
  };

  return (
    <AppLayout>
      <Head title="Validated Form Example" />
      
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create User Account</h1>
          <p className="text-muted-foreground mt-1">
            Example form with comprehensive client-side validation
          </p>
        </div>

        <BaseForm onSubmit={submit} processing={processing}>
          <FormSection 
            title="Account Information"
            description="Enter the basic account details"
          >
            <FormField
              label="Full Name"
              name="name"
              value={data.name}
              onChange={(value) => handleFieldChange('name', value)}
              error={getFieldError('name')}
              placeholder="Enter full name"
              required
              autoFocus
              description="This will be displayed as your public name"
            />

            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={data.email}
              onChange={(value) => handleFieldChange('email', value)}
              error={getFieldError('email')}
              placeholder="user@example.com"
              required
              autoComplete="email"
              description="We'll use this for account notifications"
            />

            <FormField
              label="Password"
              name="password"
              type="password"
              value={data.password}
              onChange={(value) => handleFieldChange('password', value)}
              error={getFieldError('password')}
              placeholder="Enter a strong password"
              required
              autoComplete="new-password"
              description="Must be at least 8 characters with uppercase, lowercase, and number"
            />

            <FormField
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={data.confirmPassword}
              onChange={(value) => handleFieldChange('confirmPassword', value)}
              error={getFieldError('confirmPassword')}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />

            <FormSelect
              label="Role"
              name="role"
              value={data.role}
              onChange={(value) => handleFieldChange('role', value)}
              error={getFieldError('role')}
              options={roleOptions}
              placeholder="Select a role..."
              required
              description="Choose the user's access level"
            />
          </FormSection>

          <FormSection 
            title="Profile Information"
            description="Optional details about the user"
          >
            <FormTextarea
              label="Bio"
              name="bio"
              value={data.bio}
              onChange={(value) => handleFieldChange('bio', value)}
              error={getFieldError('bio')}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
              description="Brief description about the user (optional)"
            />
          </FormSection>

          <FormSection 
            title="Preferences"
            description="Configure your account preferences"
          >
            <FormCheckbox
              label="I accept the terms and conditions"
              name="terms"
              checked={data.terms}
              onChange={(checked) => handleFieldChange('terms', checked)}
              error={getFieldError('terms')}
              description="You must accept our terms to create an account"
            />

            <FormCheckbox
              label="Subscribe to newsletter"
              name="newsletter"
              checked={data.newsletter}
              onChange={(checked) => handleFieldChange('newsletter', checked)}
              error={getFieldError('newsletter')}
              description="Receive weekly updates about new features (optional)"
            />
          </FormSection>

          <FormActions align="right">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => reset()}
              disabled={processing}
            >
              Reset Form
            </Button>
            <Button type="submit">
              Create Account
            </Button>
          </FormActions>
        </BaseForm>

        {/* Validation Status for debugging */}
        <div className="mt-8 space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Form Status (Debug)</h3>
            <div className="text-sm space-y-1">
              <p>Processing: {processing ? 'Yes' : 'No'}</p>
              <p>Client Errors: {Object.keys(clientErrors).length}</p>
              <p>Server Errors: {Object.keys(serverErrors).length}</p>
            </div>
          </div>

          {Object.keys(clientErrors).length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Client Validation Errors:</h4>
              <ul className="text-sm text-destructive space-y-1">
                {Object.entries(clientErrors).map(([field, error]) => (
                  <li key={field}>• {field}: {error}</li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(serverErrors).length > 0 && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">Server Validation Errors:</h4>
              <ul className="text-sm text-destructive space-y-1">
                {Object.entries(serverErrors).map(([field, error]) => (
                  <li key={field}>• {field}: {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
