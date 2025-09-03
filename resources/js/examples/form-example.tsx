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
  FormSection,
  validationRules
} from '@/base-components/base-form';

/**
 * Example demonstrating the reusable form components
 * 
 * This shows how to:
 * - Use BaseForm with Inertia's useForm hook
 * - Implement different field types
 * - Add client-side validation
 * - Group fields with FormSection
 * - Handle form submission and loading states
 */

type UserForm = {
  name: string;
  email: string;
  role: string;
  bio: string;
  notifications: boolean;
  newsletter: boolean;
};

const roleOptions = [
  { label: 'Administrator', value: 'admin' },
  { label: 'Editor', value: 'editor' },
  { label: 'Viewer', value: 'viewer' },
];

export default function FormExample() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<UserForm>>({
    name: '',
    email: '',
    role: '',
    bio: '',
    notifications: false,
    newsletter: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('users.store'), {
      onSuccess: () => {
        reset();
        // Show success message
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Form Example" />
      
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create User</h1>
          <p className="text-muted-foreground mt-1">
            Example form using reusable form components
          </p>
        </div>

        <BaseForm onSubmit={submit} processing={processing}>
          <FormSection 
            title="Basic Information"
            description="Enter the user's basic details"
          >
            <FormField
              label="Full Name"
              name="name"
              value={data.name}
              onChange={(value) => setData('name', value)}
              error={errors.name}
              placeholder="Enter full name"
              required
              autoFocus
              validation={[
                validationRules.required(),
                validationRules.minLength(2, "Name must be at least 2 characters")
              ]}
            />

            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={data.email}
              onChange={(value) => setData('email', value)}
              error={errors.email}
              placeholder="user@example.com"
              required
              autoComplete="email"
              validation={[
                validationRules.required(),
                validationRules.email()
              ]}
            />

            <FormSelect
              label="Role"
              name="role"
              value={data.role}
              onChange={(value) => setData('role', value)}
              error={errors.role}
              options={roleOptions}
              placeholder="Select a role..."
              required
              description="Choose the user's access level"
            />
          </FormSection>

          <FormSection 
            title="Additional Details"
            description="Optional information about the user"
          >
            <FormTextarea
              label="Bio"
              name="bio"
              value={data.bio}
              onChange={(value) => setData('bio', value)}
              error={errors.bio}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
              description="Brief description about the user"
            />
          </FormSection>

          <FormSection 
            title="Preferences"
            description="Configure notification settings"
          >
            <FormCheckbox
              label="Enable email notifications"
              name="notifications"
              checked={data.notifications}
              onChange={(checked) => setData('notifications', checked)}
              error={errors.notifications}
              description="Receive important updates via email"
            />

            <FormCheckbox
              label="Subscribe to newsletter"
              name="newsletter"
              checked={data.newsletter}
              onChange={(checked) => setData('newsletter', checked)}
              error={errors.newsletter}
              description="Get weekly updates about new features"
            />
          </FormSection>

          <FormActions align="right">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => reset()}
              disabled={processing}
            >
              Reset
            </Button>
            <Button type="submit">
              Create User
            </Button>
          </FormActions>
        </BaseForm>

        {/* Example of form data for debugging */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Form Data (Debug)</h3>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    </AppLayout>
  );
}
