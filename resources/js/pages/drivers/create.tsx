import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Users, CheckCircle, User, Car, Shield, Settings } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { PageHeader } from '@/base-components/page-header';
import {
  BaseForm,
  FormField,
  FormSelect,
  FormTextarea,
  FormFileUpload,
  FormDatePicker,
  FormMultiSelect
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
  roles: string[];
  official_phone: string;
  personal_phone: string;
  whatsapp_id: string;
  emergency_phone: string;
  emergency_contact_name: string;
  emergency_contact_relation: string;
  present_address: string;
  permanent_address: string;
  area: string;
  blood_group: string;
  nid_number: string;
  passport_number: string;
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
  roles: Array<{ id: number; name: string }>;
  userTypes: Array<{ value: string; label: string }>;
  licenseClasses: Array<{ value: string; label: string }>;
  bloodGroups: Array<{ value: string; label: string }>;
  defaults: {
    user_type: string;
    department_id?: number;
    role_id?: number;
    driver_status: string;
  };
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

export default function CreateUser({ departments, roles, userTypes, licenseClasses, bloodGroups, defaults }: CreateUserProps) {
  const { data, setData, post, processing, errors: serverErrors, reset } = useForm<UserForm>({
    name: '',
    username: '',
    employee_id: '',
    email: '',
    user_type: defaults.user_type || 'driver',
    department_id: defaults.department_id?.toString() || '',
    roles: defaults.role_id ? [defaults.role_id.toString()] : [],
    official_phone: '',
    personal_phone: '',
    whatsapp_id: '',
    emergency_phone: '',
    emergency_contact_name: '',
    emergency_contact_relation: '',
    present_address: '',
    permanent_address: '',
    area: '',
    blood_group: '',
    nid_number: '',
    passport_number: '',
    driving_license_no: '',
    license_class: '',
    license_issue_date: '',
    license_expiry_date: '',
    joining_date: '',
    status: 'active',
    driver_status: defaults.driver_status || 'available',
    password: '',
    password_confirmation: '',
    image: null,
    photo: null,
  });

  const [showDriverFields, setShowDriverFields] = useState(true); // Always show for drivers

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
    personal_phone: [
      commonValidationRules.required('Personal phone is required'),
      commonValidationRules.pattern(/^\+?[0-9\s-()]+$/, 'Please enter a valid phone number')
    ],
    whatsapp_id: [
      commonValidationRules.required('WhatsApp number is required'),
      commonValidationRules.pattern(/^\+?[0-9\s-()]+$/, 'Please enter a valid WhatsApp number')
    ],
    nid_number: [
      commonValidationRules.pattern(/^[0-9]{10,17}$/, 'NID number must be 10-17 digits'),
      (value) => {
        if (value && value.length !== 10 && value.length !== 13 && value.length !== 17) {
          return 'NID number must be 10, 13, or 17 digits';
        }
        return undefined;
      }
    ],
    passport_number: [
      commonValidationRules.pattern(/^[A-Z0-9]{6,9}$/, 'Passport number must be 6-9 alphanumeric characters'),
      commonValidationRules.maxLength(9, 'Passport number must be less than 9 characters')
    ],
    driving_license_no: [
      commonValidationRules.required('Driving license number is required for drivers')
    ],
    license_class: [
      commonValidationRules.required('License class is required for drivers')
    ],
    license_expiry_date: [
      commonValidationRules.required('License expiry date is required for drivers')
    ]
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
    post(route('drivers.store'), {
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
    if (field === 'image' || field === 'photo') {
      setData(field, value as File | null);
    } else {
      setData(field, value as string);
    }
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
    const requiredFields = ['name', 'username', 'personal_phone', 'whatsapp_id'];

    // Add driver-specific required fields
    requiredFields.push('driving_license_no', 'license_class', 'license_expiry_date');

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
      <Head title="Create Driver" />

      <div className="space-y-8">
        <PageHeader
          title="Create Driver"
          description="Add a new driver to the vehicle management system"
          actions={[
            {
              label: "Back to Users",
              icon: <ArrowLeft className="h-4 w-4" />,
              href: route('drivers.index'),
              variant: "outline"
            }
          ]}
        />

        <div className="max-w-4xl xl:max-w-5xl">
          <BaseForm onSubmit={submit} processing={processing}>
            {/* Compact Main Form Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Create User</CardTitle>
                      <CardDescription className="text-sm">Complete form progress: {formCompletion}%</CardDescription>
                    </div>
                  </div>
                  {/* Compact Progress */}
                  <div className="flex items-center gap-2">
                    {formCompletion === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
                    <div className="w-12 bg-muted rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          formCompletion === 100 ? 'bg-green-500' : 'bg-primary'
                        }`}
                        style={{ width: `${formCompletion}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-5 px-4 sm:px-6">
                {/* Compact 3-Column Grid */}
                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  {/* Basic Information */}
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
                </div>

                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                  <FormField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={data.email}
                    onChange={(value) => handleFieldChange('email', value)}
                    error={getFieldError('email')}
                    placeholder="Enter email address"
                  />

                  {/* User Type, Department, and Role are auto-selected - Hidden */}
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>
                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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
                      required
                    />

                    <FormField
                      label="WhatsApp Number"
                      name="whatsapp_id"
                      value={data.whatsapp_id}
                      onChange={(value) => handleFieldChange('whatsapp_id', value)}
                      error={getFieldError('whatsapp_id')}
                      placeholder="+880 1711 000000"
                      required
                    />
                  </div>
                </div>

                {/* Identity Documents */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Identity Documents</h4>
                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
                    <FormField
                      label="National ID Number"
                      name="nid_number"
                      value={data.nid_number}
                      onChange={(value) => handleFieldChange('nid_number', value)}
                      error={getFieldError('nid_number')}
                      placeholder="Enter National ID number"
                    />

                    <FormField
                      label="Passport Number"
                      name="passport_number"
                      value={data.passport_number}
                      onChange={(value) => handleFieldChange('passport_number', value)}
                      error={getFieldError('passport_number')}
                      placeholder="Enter passport number"
                    />
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Personal Information</h4>
                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <FormSelect
                      label="Blood Group"
                      name="blood_group"
                      value={data.blood_group}
                      onChange={(value) => handleFieldChange('blood_group', value)}
                      error={getFieldError('blood_group')}
                      options={bloodGroups}
                      placeholder="Select blood group..."
                    />

                    <FormDatePicker
                      label="Joining Date"
                      name="joining_date"
                      value={data.joining_date}
                      onChange={(value) => handleFieldChange('joining_date', value)}
                      error={getFieldError('joining_date')}
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

                {/* Emergency Contact */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Emergency Contact</h4>
                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                    <FormField
                      label="Contact Name"
                      name="emergency_contact_name"
                      value={data.emergency_contact_name}
                      onChange={(value) => handleFieldChange('emergency_contact_name', value)}
                      error={getFieldError('emergency_contact_name')}
                      placeholder="Enter emergency contact name"
                    />

                    <FormField
                      label="Relation"
                      name="emergency_contact_relation"
                      value={data.emergency_contact_relation}
                      onChange={(value) => handleFieldChange('emergency_contact_relation', value)}
                      error={getFieldError('emergency_contact_relation')}
                      placeholder="e.g., Spouse, Parent"
                    />

                    <FormField
                      label="Phone Number"
                      name="emergency_phone"
                      value={data.emergency_phone}
                      onChange={(value) => handleFieldChange('emergency_phone', value)}
                      error={getFieldError('emergency_phone')}
                      placeholder="+880 1711 000000"
                    />
                  </div>
                </div>

                {/* Addresses - Compact Layout */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Address Information</h4>
                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    <FormField
                      label="Area/Location"
                      name="area"
                      value={data.area}
                      onChange={(value) => handleFieldChange('area', value)}
                      error={getFieldError('area')}
                      placeholder="e.g., Gulshan, Mohakhali, Banani"
                    />

                    <div className="md:col-span-2 grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                      <FormTextarea
                        label="Present Address"
                        name="present_address"
                        value={data.present_address}
                        onChange={(value) => handleFieldChange('present_address', value)}
                        error={getFieldError('present_address')}
                        placeholder="Enter current address"
                        rows={2}
                      />

                      <FormTextarea
                        label="Permanent Address"
                        name="permanent_address"
                        value={data.permanent_address}
                        onChange={(value) => handleFieldChange('permanent_address', value)}
                        error={getFieldError('permanent_address')}
                        placeholder="Enter permanent address"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* User Type Preview - Compact */}
                {data.user_type && (
                  <div className="p-3 rounded-md bg-muted/30 border-l-2 border-primary">
                    <div className="flex items-center gap-2 text-sm">
                      {enhancedUserTypeOptions.find(opt => opt.value === data.user_type)?.icon}
                      <span className="font-medium">
                        {enhancedUserTypeOptions.find(opt => opt.value === data.user_type)?.label}
                      </span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-muted-foreground text-xs">
                        {enhancedUserTypeOptions.find(opt => opt.value === data.user_type)?.description}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driver Information Card (conditional) - Compact */}
            {showDriverFields && (
              <Card className="shadow-sm">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-green-100 rounded-md">
                      <Car className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Driver Information</CardTitle>
                      <CardDescription className="text-sm">License details and driver-specific information</CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
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
                  </div>

                  <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
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

                    <FormSelect
                      label="Driver Status"
                      name="driver_status"
                      value={data.driver_status}
                      onChange={(value) => handleFieldChange('driver_status', value)}
                      error={getFieldError('driver_status')}
                      options={driverStatusOptions}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* File Uploads & Security - Compact */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 px-4 sm:px-6">
                <CardTitle className="text-lg">Files & Security</CardTitle>
                <CardDescription className="text-sm">Upload images and set account password</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 px-4 sm:px-6">
                {/* File Uploads - Compact */}
                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
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

                {/* Password Auto-Generated - Not shown in form */}
                <div className="border-t pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> A secure password will be auto-generated for this driver and displayed after creation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compact Form Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => reset()}
                disabled={processing}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.history.back()}
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
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
