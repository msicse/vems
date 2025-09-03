import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Users, CheckCircle, Clock, XCircle, User, Car, Shield, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/base-components/page-header';
import {
  BaseForm,
  FormField,
  FormSelect,
  FormTextarea,
  FormFileUpload,
  FormDatePicker
} from '@/base-components/base-form';
import {
  useFormValidation,
  commonValidationRules,
  ValidationRules
} from '@/hooks/use-form-validation';

/**
 * Create User Page
 *
 * Features:
 * - Comprehensive form validation
 * - User type specific fields
 * - Driver license validation
 * - File upload for images and documents
 * - Progress tracking
 * - Responsive design
 */

type UserForm = {
  name: string;
  username: string;
  employee_id: string;
  email: string;
  user_type: string;
  department_id: string;
  official_phone: string;
  personal_phone: string;
  emergency_phone: string;
  emergency_contact_name: string;
  emergency_contact_relation: string;
  present_address: string;
  permanent_address: string;
  blood_group: string;
  driving_license_no: string;
  license_class: string;
  license_issue_date: string;
  license_expiry_date: string;
  joining_date: string;
  status: string;
  driver_status: string;
  password: string;
  password_confirmation: string;
  image: File | null;
  photo: File | null;
};

interface CreateUserProps {
  departments: Array<{ id: number; name: string }>;
  userTypes: Array<{ value: string; label: string }>;
  licenseClasses: Array<{ value: string; label: string }>;
  bloodGroups: Array<{ value: string; label: string }>;
}

// Enhanced user type options with icons and descriptions
const enhancedUserTypeOptions = [
  {
    label: "Employee",
    value: "employee",
    icon: <User className="h-4 w-4 text-blue-600" />,
    description: "Regular organization staff who can request vehicles"
  },
  {
    label: "Driver",
    value: "driver",
    icon: <Car className="h-4 w-4 text-green-600" />,
    description: "Can drive vehicles and handle trip operations"
  },
  {
    label: "Transport Manager",
    value: "transport_manager",
    icon: <Settings className="h-4 w-4 text-purple-600" />,
    description: "Manages transport operations and approves trips"
  },
  {
    label: "Administrator",
    value: "admin",
    icon: <Shield className="h-4 w-4 text-red-600" />,
    description: "Full system access and user management"
  }
];

// Enhanced status options
const enhancedStatusOptions = [
  {
    label: "Active",
    value: "active",
    icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    description: "User is active and can access the system"
  },
  {
    label: "Inactive",
    value: "inactive",
    icon: <Clock className="h-4 w-4 text-amber-600" />,
    description: "User account is temporarily disabled"
  },
  {
    label: "Suspended",
    value: "suspended",
    icon: <XCircle className="h-4 w-4 text-red-600" />,
    description: "User account is suspended due to violations"
  }
];

export default function CreateUser({ departments, userTypes, licenseClasses, bloodGroups }: CreateUserProps) {
  const { data, setData, post, processing, errors: serverErrors, reset } = useForm<UserForm>({
    name: '',
    username: '',
    employee_id: '',
    email: '',
    user_type: 'employee',
    department_id: '',
    official_phone: '',
    personal_phone: '',
    emergency_phone: '',
    emergency_contact_name: '',
    emergency_contact_relation: '',
    present_address: '',
    permanent_address: '',
    blood_group: '',
    driving_license_no: '',
    license_class: '',
    license_issue_date: '',
    license_expiry_date: '',
    joining_date: '',
    status: 'active',
    driver_status: 'available',
    password: '',
    password_confirmation: '',
    image: null,
    photo: null,
  });

  const [showDriverFields, setShowDriverFields] = useState(false);

  // Define validation rules
  const validationRules: ValidationRules<UserForm> = {
    name: [
      commonValidationRules.required('Full name is required'),
      commonValidationRules.minLength(2, 'Name must be at least 2 characters'),
      commonValidationRules.maxLength(255, 'Name must be less than 255 characters')
    ],
    username: [
      commonValidationRules.required('Username is required'),
      commonValidationRules.minLength(3, 'Username must be at least 3 characters'),
      commonValidationRules.maxLength(50, 'Username must be less than 50 characters')
    ],
    email: [
      commonValidationRules.email('Please enter a valid email address')
    ],
    user_type: [
      commonValidationRules.required('User type is required'),
      commonValidationRules.oneOf(['employee', 'driver', 'transport_manager', 'admin'], 'Invalid user type selected')
    ],
    password: [
      commonValidationRules.required('Password is required'),
      commonValidationRules.minLength(8, 'Password must be at least 8 characters')
    ],
    password_confirmation: [
      commonValidationRules.required('Password confirmation is required'),
      (value) => {
        if (value !== data.password) return 'Passwords do not match';
        return undefined;
      }
    ],
    driving_license_no: showDriverFields ? [
      commonValidationRules.required('Driving license number is required for drivers')
    ] : [],
    license_class: showDriverFields ? [
      commonValidationRules.required('License class is required for drivers')
    ] : [],
    license_expiry_date: showDriverFields ? [
      commonValidationRules.required('License expiry date is required for drivers')
    ] : []
  };

  // Initialize validation hook
  const {
    errors: clientErrors,
    validate,
    clearError,
    hasErrors
  } = useFormValidation(validationRules);

  // Combine server and client errors
  const getFieldError = (field: keyof UserForm): string | undefined => {
    return serverErrors[field] || clientErrors[field];
  };

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    // Run client-side validation
    const validationErrors = validate(data);

    if (hasErrors(validationErrors)) {
      return;
    }

    // Submit the form
    post(route('users.store'), {
      onSuccess: () => {
        // Redirect will be handled by the controller
      },
      onError: (errors) => {
        console.log('Server validation errors:', errors);
      }
    });
  };

  // Clear client error when user starts typing
  const handleFieldChange = (field: keyof UserForm, value: string | File | null) => {
    setData(field, value as any);
    clearError(field);
  };

  // Handle user type change
  const handleUserTypeChange = (value: string) => {
    handleFieldChange('user_type', value);
    setShowDriverFields(['driver', 'transport_manager'].includes(value));

    // Clear driver-specific fields if not a driver
    if (!['driver', 'transport_manager'].includes(value)) {
      setData(prev => ({
        ...prev,
        driving_license_no: '',
        license_class: '',
        license_issue_date: '',
        license_expiry_date: '',
        driver_status: ''
      }));
    } else {
      setData('driver_status', 'available');
    }
  };

  // Calculate form completion percentage
  const getFormCompletion = () => {
    const requiredFields = ['name', 'username', 'user_type', 'password', 'password_confirmation'];

    // Add driver-specific required fields
    if (showDriverFields) {
      requiredFields.push('driving_license_no', 'license_class', 'license_expiry_date');
    }

    const completedFields = requiredFields.filter(field => {
      const value = data[field as keyof UserForm];
      return value && value.toString().trim() !== '';
    });

    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const formCompletion = getFormCompletion();

  // Department options
  const departmentOptions = departments.map(dept => ({
    label: dept.name,
    value: dept.id.toString()
  }));

  // Status options
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Suspended", value: "suspended" }
  ];

  // Driver status options
  const driverStatusOptions = [
    { label: "Available", value: "available" },
    { label: "On Leave", value: "on_leave" },
    { label: "Inactive", value: "inactive" }
  ];

  return (
    <AppLayout>
      <Head title="Create User" />

      <div className="space-y-8">
        <PageHeader
          title="Create User"
          description="Add a new user to the vehicle management system"
          actions={[
            {
              label: "Back to Users",
              icon: <ArrowLeft className="h-4 w-4" />,
              href: route('users.index'),
              variant: "outline"
            }
          ]}
        />

        <div className="max-w-6xl">
          <BaseForm onSubmit={submit} processing={processing}>
            {/* Basic Information Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">User Information</CardTitle>
                      <CardDescription>Basic details and account settings</CardDescription>
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
                      label="Full Name"
                      name="name"
                      value={data.name}
                      onChange={(value) => handleFieldChange('name', value)}
                      error={getFieldError('name')}
                      placeholder="Enter full name"
                      required
                      autoFocus
                    />

                    <FormField
                      label="Username"
                      name="username"
                      value={data.username}
                      onChange={(value) => handleFieldChange('username', value)}
                      error={getFieldError('username')}
                      placeholder="Enter username"
                      required
                    />

                    <FormField
                      label="Employee ID"
                      name="employee_id"
                      value={data.employee_id}
                      onChange={(value) => handleFieldChange('employee_id', value)}
                      error={getFieldError('employee_id')}
                      placeholder="Enter employee ID"
                    />

                    <FormField
                      label="Email Address"
                      name="email"
                      type="email"
                      value={data.email}
                      onChange={(value) => handleFieldChange('email', value)}
                      error={getFieldError('email')}
                      placeholder="Enter email address"
                    />

                    <FormSelect
                      label="User Type"
                      name="user_type"
                      value={data.user_type}
                      onChange={handleUserTypeChange}
                      error={getFieldError('user_type')}
                      options={userTypes}
                      required
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormSelect
                      label="Department"
                      name="department_id"
                      value={data.department_id}
                      onChange={(value) => handleFieldChange('department_id', value)}
                      error={getFieldError('department_id')}
                      options={departmentOptions}
                      placeholder="Select department..."
                    />

                    <FormField
                      label="Official Phone"
                      name="official_phone"
                      value={data.official_phone}
                      onChange={(value) => handleFieldChange('official_phone', value)}
                      error={getFieldError('official_phone')}
                      placeholder="+880 1711 000000"
                    />

                    <FormField
                      label="Personal Phone"
                      name="personal_phone"
                      value={data.personal_phone}
                      onChange={(value) => handleFieldChange('personal_phone', value)}
                      error={getFieldError('personal_phone')}
                      placeholder="+880 1711 000000"
                    />

                    <FormSelect
                      label="Blood Group"
                      name="blood_group"
                      value={data.blood_group}
                      onChange={(value) => handleFieldChange('blood_group', value)}
                      error={getFieldError('blood_group')}
                      options={bloodGroups}
                      placeholder="Select blood group..."
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
                  </div>
                </div>

                {/* User Type Preview */}
                {data.user_type && (
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <div className="flex items-center gap-3">
                      {enhancedUserTypeOptions.find(opt => opt.value === data.user_type)?.icon}
                      <div>
                        <div className="font-medium text-sm">
                          {enhancedUserTypeOptions.find(opt => opt.value === data.user_type)?.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {enhancedUserTypeOptions.find(opt => opt.value === data.user_type)?.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Information Card (conditional) */}
            {showDriverFields && (
              <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Car className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Driver Information</CardTitle>
                      <CardDescription>License details and driver-specific information</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      label="Driving License Number"
                      name="driving_license_no"
                      value={data.driving_license_no}
                      onChange={(value) => handleFieldChange('driving_license_no', value)}
                      error={getFieldError('driving_license_no')}
                      placeholder="Enter license number"
                      required={showDriverFields}
                    />

                    <FormSelect
                      label="License Class"
                      name="license_class"
                      value={data.license_class}
                      onChange={(value) => handleFieldChange('license_class', value)}
                      error={getFieldError('license_class')}
                      options={licenseClasses}
                      placeholder="Select license class..."
                      required={showDriverFields}
                    />

                    <FormDatePicker
                      label="License Issue Date"
                      name="license_issue_date"
                      value={data.license_issue_date}
                      onChange={(value) => handleFieldChange('license_issue_date', value)}
                      error={getFieldError('license_issue_date')}
                    />

                    <FormDatePicker
                      label="License Expiry Date"
                      name="license_expiry_date"
                      value={data.license_expiry_date}
                      onChange={(value) => handleFieldChange('license_expiry_date', value)}
                      error={getFieldError('license_expiry_date')}
                      required={showDriverFields}
                    />
                  </div>

                  <FormSelect
                    label="Driver Status"
                    name="driver_status"
                    value={data.driver_status}
                    onChange={(value) => handleFieldChange('driver_status', value)}
                    error={getFieldError('driver_status')}
                    options={driverStatusOptions}
                  />
                </CardContent>
              </Card>
            )}

            {/* Additional Information Card */}
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
              <CardHeader>
                <CardTitle className="text-xl">Additional Information</CardTitle>
                <CardDescription>Emergency contacts, addresses, and security settings</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <FormField
                      label="Emergency Contact Name"
                      name="emergency_contact_name"
                      value={data.emergency_contact_name}
                      onChange={(value) => handleFieldChange('emergency_contact_name', value)}
                      error={getFieldError('emergency_contact_name')}
                      placeholder="Enter emergency contact name"
                    />

                    <FormField
                      label="Emergency Contact Relation"
                      name="emergency_contact_relation"
                      value={data.emergency_contact_relation}
                      onChange={(value) => handleFieldChange('emergency_contact_relation', value)}
                      error={getFieldError('emergency_contact_relation')}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />

                    <FormField
                      label="Emergency Phone"
                      name="emergency_phone"
                      value={data.emergency_phone}
                      onChange={(value) => handleFieldChange('emergency_phone', value)}
                      error={getFieldError('emergency_phone')}
                      placeholder="+880 1711 000000"
                    />

                    <FormDatePicker
                      label="Joining Date"
                      name="joining_date"
                      value={data.joining_date}
                      onChange={(value) => handleFieldChange('joining_date', value)}
                      error={getFieldError('joining_date')}
                    />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <FormTextarea
                      label="Present Address"
                      name="present_address"
                      value={data.present_address}
                      onChange={(value) => handleFieldChange('present_address', value)}
                      error={getFieldError('present_address')}
                      placeholder="Enter current address"
                      rows={3}
                    />

                    <FormTextarea
                      label="Permanent Address"
                      name="permanent_address"
                      value={data.permanent_address}
                      onChange={(value) => handleFieldChange('permanent_address', value)}
                      error={getFieldError('permanent_address')}
                      placeholder="Enter permanent address"
                      rows={3}
                    />
                  </div>
                </div>

                {/* File Uploads */}
                <div className="grid gap-6 md:grid-cols-2">
                  <FormFileUpload
                    label="Profile Image"
                    name="image"
                    onChange={(file) => handleFieldChange('image', file)}
                    error={getFieldError('image')}
                    accept="image/*"
                    maxSize={2} // 2MB
                  />

                  <FormFileUpload
                    label="ID Photo"
                    name="photo"
                    onChange={(file) => handleFieldChange('photo', file)}
                    error={getFieldError('photo')}
                    accept="image/*"
                    maxSize={2} // 2MB
                  />
                </div>

                {/* Password Section */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-sm mb-4">Account Security</h4>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      label="Password"
                      name="password"
                      type="password"
                      value={data.password}
                      onChange={(value) => handleFieldChange('password', value)}
                      error={getFieldError('password')}
                      placeholder="Enter password"
                      required
                    />

                    <FormField
                      label="Confirm Password"
                      name="password_confirmation"
                      type="password"
                      value={data.password_confirmation}
                      onChange={(value) => handleFieldChange('password_confirmation', value)}
                      error={getFieldError('password_confirmation')}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
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
                Create User
              </Button>
            </div>
          </BaseForm>
        </div>

        {/* Debug information in development */}
        {process.env.NODE_ENV === 'development' && Object.keys(clientErrors).length > 0 && (
          <div className="max-w-6xl">
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
