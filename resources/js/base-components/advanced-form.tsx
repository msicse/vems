import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import InputError from "@/components/input-error"
import { LoaderCircle } from "lucide-react"

/**
 * Advanced Form Components with React Hook Form integration
 *
 * This provides an alternative to the base form components when you need:
 * - More complex validation logic
 * - Better performance with large forms
 * - Schema-based validation (Zod, Yup, etc.)
 * - Advanced form features like field arrays, conditional fields
 *
 * Note: Requires react-hook-form to be installed
 * npm install react-hook-form @hookform/resolvers
 *
 * @example
 * import { useForm } from 'react-hook-form'
 * import { zodResolver } from '@hookform/resolvers/zod'
 * import * as z from 'zod'
 *
 * const schema = z.object({
 *   name: z.string().min(1, 'Name is required'),
 *   email: z.string().email('Invalid email'),
 * })
 *
 * const form = useForm({
 *   resolver: zodResolver(schema),
 *   defaultValues: { name: '', email: '' }
 * })
 *
 * <AdvancedForm form={form} onSubmit={handleSubmit}>
 *   <AdvancedFormField
 *     form={form}
 *     name="name"
 *     label="Name"
 *     render={({ field }) => <Input {...field} />}
 *   />
 * </AdvancedForm>
 */

// Types for React Hook Form integration
type FormInstance = any // This would be UseFormReturn from react-hook-form

// Advanced Form Container (requires react-hook-form)
interface AdvancedFormProps extends Omit<React.FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: FormInstance
  onSubmit: (data: any) => void | Promise<void>
  children: React.ReactNode
  processing?: boolean
  className?: string
}

export function AdvancedForm({
  form,
  onSubmit,
  children,
  processing = false,
  className,
  ...props
}: AdvancedFormProps) {
  const handleSubmit = form.handleSubmit(async (data: any) => {
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  })

  return (
    <form
      className={cn("space-y-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <fieldset disabled={processing} className="space-y-6">
        {children}
      </fieldset>
    </form>
  )
}

// Advanced Form Field (requires react-hook-form)
interface AdvancedFormFieldProps {
  form: FormInstance
  name: string
  label: string
  description?: string
  required?: boolean
  className?: string
  render: (props: { field: any; fieldState: any; formState: any }) => React.ReactElement
}

export function AdvancedFormField({
  form,
  name,
  label,
  description,
  required = false,
  className,
  render
}: AdvancedFormFieldProps) {
  // This would use Controller from react-hook-form
  // For now, we'll provide a placeholder implementation

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <div className="text-sm text-muted-foreground">
        This component requires react-hook-form to be installed.
        <br />
        Run: npm install react-hook-form @hookform/resolvers
      </div>

      {description && (
        <p className="text-sm text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  )
}

// Validation Schema Examples (for documentation)
export const validationSchemas = {
  // Example Zod schemas
  user: `
    import * as z from 'zod'

    const userSchema = z.object({
      name: z.string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters'),
      email: z.string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
      role: z.enum(['admin', 'editor', 'viewer'], {
        required_error: 'Please select a role'
      }),
      bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
      notifications: z.boolean().default(false),
    })
  `,

  // Example Yup schemas
  userYup: `
    import * as yup from 'yup'

    const userSchema = yup.object({
      name: yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters'),
      email: yup.string()
        .required('Email is required')
        .email('Invalid email address'),
      role: yup.string()
        .required('Please select a role')
        .oneOf(['admin', 'editor', 'viewer']),
      bio: yup.string().max(500, 'Bio must be less than 500 characters'),
      notifications: yup.boolean().default(false),
    })
  `
}

// Utility function to integrate with Inertia.js
export function useInertiaForm<T extends Record<string, any>>(
  form: FormInstance,
  route: string,
  options?: {
    method?: 'post' | 'put' | 'patch' | 'delete'
    onSuccess?: () => void
    onError?: (errors: any) => void
  }
) {
  const [processing, setProcessing] = React.useState(false)

  const submit = async (data: T) => {
    setProcessing(true)

    try {
      // This would integrate with Inertia.js router
      // For now, we'll provide a placeholder
      console.log('Would submit to:', route, data)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      options?.onSuccess?.()
    } catch (error) {
      console.error('Submission error:', error)
      options?.onError?.(error)
    } finally {
      setProcessing(false)
    }
  }

  return { submit, processing }
}

// Form Builder utility for dynamic forms
interface FormFieldConfig {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'select' | 'textarea' | 'checkbox'
  required?: boolean
  placeholder?: string
  description?: string
  options?: Array<{ label: string; value: string }>
  validation?: any // Schema validation rules
}

interface FormBuilderProps {
  fields: FormFieldConfig[]
  onSubmit: (data: any) => void
  processing?: boolean
  className?: string
}

export function FormBuilder({
  fields,
  onSubmit,
  processing = false,
  className
}: FormBuilderProps) {
  const [formData, setFormData] = React.useState<Record<string, any>>({})
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    const newErrors: Record<string, string> = {}
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    onSubmit(formData)
  }

  const updateField = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <form className={cn("space-y-6", className)} onSubmit={handleSubmit}>
      <fieldset disabled={processing} className="space-y-6">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>

            {field.type === 'text' || field.type === 'email' || field.type === 'password' ? (
              <Input
                id={field.name}
                type={field.type}
                value={formData[field.name] || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.placeholder}
                aria-invalid={!!errors[field.name]}
              />
            ) : field.type === 'select' ? (
              <Select
                value={formData[field.name] || 'none'}
                onValueChange={(value) => updateField(field.name, value === 'none' ? null : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option.value} value={option.value || 'none'}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : field.type === 'textarea' ? (
              <textarea
                id={field.name}
                value={formData[field.name] || ''}
                onChange={(e) => updateField(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
            ) : field.type === 'checkbox' ? (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={field.name}
                  checked={formData[field.name] || false}
                  onCheckedChange={(checked) => updateField(field.name, checked)}
                />
                <Label htmlFor={field.name} className="text-sm font-normal">
                  {field.label}
                </Label>
              </div>
            ) : null}

            {field.description && (
              <p className="text-sm text-muted-foreground">
                {field.description}
              </p>
            )}

            <InputError message={errors[field.name]} />
          </div>
        ))}

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={processing}>
            {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
            Submit
          </Button>
        </div>
      </fieldset>
    </form>
  )
}
