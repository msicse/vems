/**
 * Migration Example: Before and After
 * 
 * This file shows how to migrate from the old manual form pattern
 * to the new reusable form components
 */

import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { 
  BaseForm, 
  FormField, 
  FormSelect, 
  FormActions 
} from '@/base-components/base-form';

type UserForm = {
  name: string;
  email: string;
  role: string;
};

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'User', value: 'user' },
];

// ============================================================================
// BEFORE: Old manual form pattern (repetitive and verbose)
// ============================================================================

export function OldFormPattern() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<UserForm>>({
    name: '',
    email: '',
    role: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('users.store'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div>
      <Head title="Old Form Pattern" />
      
      <form className="flex flex-col gap-6" onSubmit={submit}>
        <div className="grid gap-6">
          {/* Name field - lots of boilerplate */}
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              required
              autoFocus
              tabIndex={1}
              autoComplete="name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)} // Manual onChange
              disabled={processing}
              placeholder="Full name"
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          {/* Email field - same boilerplate repeated */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              required
              tabIndex={2}
              autoComplete="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)} // Manual onChange
              disabled={processing}
              placeholder="email@example.com"
            />
            <InputError message={errors.email} />
          </div>

          {/* Role field - even more complex for select */}
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            {/* Would need to implement select manually or use a complex select component */}
            <Input
              id="role"
              type="text"
              value={data.role}
              onChange={(e) => setData('role', e.target.value)}
              disabled={processing}
              placeholder="Enter role"
            />
            <InputError message={errors.role} />
          </div>
        </div>

        {/* Submit button with manual loading state */}
        <div className="flex items-center justify-end gap-4">
          <Button type="submit" disabled={processing}>
            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
            Create User
          </Button>
        </div>
      </form>
    </div>
  );
}

// ============================================================================
// AFTER: New reusable form components (clean and concise)
// ============================================================================

export function NewFormPattern() {
  const { data, setData, post, processing, errors, reset } = useForm<Required<UserForm>>({
    name: '',
    email: '',
    role: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('users.store'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <div>
      <Head title="New Form Pattern" />
      
      {/* Single BaseForm wrapper handles form submission and loading states */}
      <BaseForm onSubmit={submit} processing={processing}>
        
        {/* Each field is a single component with all functionality built-in */}
        <FormField
          label="Name"
          name="name"
          value={data.name}
          onChange={(value) => setData('name', value)} // Simplified onChange
          error={errors.name}
          required
          autoFocus
          placeholder="Full name"
        />

        <FormField
          label="Email address"
          name="email"
          type="email"
          value={data.email}
          onChange={(value) => setData('email', value)} // Simplified onChange
          error={errors.email}
          required
          placeholder="email@example.com"
        />

        {/* Select is just as easy as input */}
        <FormSelect
          label="Role"
          name="role"
          value={data.role}
          onChange={(value) => setData('role', value)}
          error={errors.role}
          options={roleOptions}
          placeholder="Select a role..."
          required
        />

        {/* Actions component handles loading states automatically */}
        <FormActions align="right">
          <Button type="submit">Create User</Button>
        </FormActions>
        
      </BaseForm>
    </div>
  );
}

// ============================================================================
// COMPARISON SUMMARY
// ============================================================================

/*

BEFORE (Old Pattern):
- 50+ lines of repetitive code
- Manual onChange handlers for each field
- Manual loading state management
- Manual error display for each field
- Complex select implementation needed
- No built-in validation
- Inconsistent styling
- Poor accessibility

AFTER (New Pattern):
- 25 lines of clean, declarative code
- Simplified onChange handlers
- Automatic loading state management
- Built-in error display
- Easy select component
- Built-in validation support
- Consistent styling
- Built-in accessibility

BENEFITS:
✅ 50% less code
✅ More maintainable
✅ Consistent UI/UX
✅ Better accessibility
✅ Built-in validation
✅ TypeScript support
✅ Easier to test
✅ Faster development

MIGRATION STEPS:
1. Replace form wrapper with BaseForm
2. Replace field groups with FormField/FormSelect/etc
3. Simplify onChange handlers
4. Replace button section with FormActions
5. Add validation if needed
6. Remove manual loading state code

*/
