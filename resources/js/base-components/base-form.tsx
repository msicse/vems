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
 * Reusable Form Components for Laravel + Inertia.js applications
 *
 * Features:
 * - Integrates with Inertia's useForm hook
 * - Built-in validation and error handling
 * - Consistent styling and accessibility
 * - TypeScript support
 * - Client-side validation support
 *
 * @example
 * const { data, setData, post, processing, errors } = useForm({
 *   name: '',
 *   email: '',
 *   role: ''
 * });
 *
 * <BaseForm onSubmit={handleSubmit} processing={processing}>
 *   <FormField
 *     label="Name"
 *     name="name"
 *     value={data.name}
 *     onChange={(value) => setData('name', value)}
 *     error={errors.name}
 *     required
 *   />
 *   <FormField
 *     label="Email"
 *     name="email"
 *     type="email"
 *     value={data.email}
 *     onChange={(value) => setData('email', value)}
 *     error={errors.email}
 *     required
 *   />
 *   <FormSelect
 *     label="Role"
 *     name="role"
 *     value={data.role}
 *     onChange={(value) => setData('role', value)}
 *     error={errors.role}
 *     options={[
 *       { label: 'Admin', value: 'admin' },
 *       { label: 'User', value: 'user' }
 *     ]}
 *   />
 *   <FormActions>
 *     <Button type="submit">Save</Button>
 *   </FormActions>
 * </BaseForm>
 */

// Validation function type
export type ValidationRule = (value: any) => string | undefined

// Common validation rules
export const validationRules = {
  required: (message = "This field is required"): ValidationRule =>
    (value) => (!value || value.toString().trim() === "") ? message : undefined,

  email: (message = "Please enter a valid email address"): ValidationRule =>
    (value) => {
      if (!value) return undefined
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return !emailRegex.test(value) ? message : undefined
    },

  minLength: (min: number, message?: string): ValidationRule =>
    (value) => {
      if (!value) return undefined
      const msg = message || `Must be at least ${min} characters`
      return value.toString().length < min ? msg : undefined
    },

  maxLength: (max: number, message?: string): ValidationRule =>
    (value) => {
      if (!value) return undefined
      const msg = message || `Must be no more than ${max} characters`
      return value.toString().length > max ? msg : undefined
    },

  pattern: (regex: RegExp, message = "Invalid format"): ValidationRule =>
    (value) => {
      if (!value) return undefined
      return !regex.test(value) ? message : undefined
    }
}

// Base Form Container
interface BaseFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
  processing?: boolean
  className?: string
}

export function BaseForm({
  children,
  processing = false,
  className,
  onSubmit,
  ...props
}: BaseFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!processing && onSubmit) {
      onSubmit(e)
    }
  }

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

// Form Field Container
interface FormFieldProps {
  label: string
  name: string
  value: string | number
  onChange: (value: string) => void
  error?: string
  type?: "text" | "email" | "password" | "number" | "tel" | "url"
  placeholder?: string
  required?: boolean
  disabled?: boolean
  autoComplete?: string
  autoFocus?: boolean
  description?: string
  validation?: ValidationRule[]
  className?: string
}

export function FormField({
  label,
  name,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  required = false,
  disabled = false,
  autoComplete,
  autoFocus = false,
  description,
  validation = [],
  className
}: FormFieldProps) {
  const [clientError, setClientError] = React.useState<string>()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    // Run client-side validation
    if (validation.length > 0) {
      const error = validation.find(rule => rule(newValue))
      setClientError(error?.(newValue))
    }
  }

  const displayError = error || clientError

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(displayError && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={!!displayError}
        aria-describedby={description ? `${name}-description` : undefined}
      />

      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <InputError message={displayError} />
    </div>
  )
}

// Form Select Component
interface SelectOption {
  label: string
  value: string | number
}

interface FormSelectProps {
  label: string
  name: string
  value: string | number
  onChange: (value: string) => void
  error?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
  description?: string
  className?: string
}

export function FormSelect({
  label,
  name,
  value,
  onChange,
  error,
  options,
  placeholder = "Select an option...",
  required = false,
  disabled = false,
  description,
  className
}: FormSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} className={cn(error && "text-destructive")}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <Select
        value={value.toString() || 'none'}
        onValueChange={(selectedValue) => onChange(selectedValue === 'none' ? '' : selectedValue)}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger
          id={name}
          aria-invalid={!!error}
          aria-describedby={description ? `${name}-description` : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value.toString() || 'none'}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <InputError message={error} />
    </div>
  )
}

// Form Checkbox Component
interface FormCheckboxProps {
  label: string
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
  disabled?: boolean
  description?: string
  className?: string
}

export function FormCheckbox({
  label,
  name,
  checked,
  onChange,
  error,
  disabled = false,
  description,
  className
}: FormCheckboxProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={name}
          name={name}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={description ? `${name}-description` : undefined}
        />
        <Label htmlFor={name} error={!!error} className="text-sm font-normal">
          {label}
        </Label>
      </div>

      {description && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <InputError message={error} />
    </div>
  )
}

// Form Actions Container
interface FormActionsProps {
  children: React.ReactNode
  processing?: boolean
  className?: string
  align?: "left" | "right" | "center"
}

export function FormActions({
  children,
  processing = false,
  className,
  align = "left"
}: FormActionsProps) {
  return (
    <div className={cn(
      "flex gap-3 pt-4",
      align === "right" && "justify-end",
      align === "center" && "justify-center",
      align === "left" && "justify-start",
      className
    )}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === Button) {
          return React.cloneElement(child, {
            disabled: child.props.disabled || processing,
            children: processing && child.props.type === "submit" ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                {child.props.children}
              </>
            ) : child.props.children
          })
        }
        return child
      })}
    </div>
  )
}

// Form Textarea Component
interface FormTextareaProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  description?: string
  rows?: number
  maxLength?: number
  className?: string
}

export function FormTextarea({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  description,
  rows = 3,
  maxLength,
  className
}: FormTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={name} error={!!error}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={description ? `${name}-description` : undefined}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        )}
      />

      {maxLength && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{description}</span>
          <span>{value.length}/{maxLength}</span>
        </div>
      )}

      {description && !maxLength && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <InputError message={error} />
    </div>
  )
}

// Form Section Component for grouping related fields
interface FormSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function FormSection({
  title,
  description,
  children,
  className
}: FormSectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-medium leading-6">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">
        {children}
      </div>
    </div>
  )
}
