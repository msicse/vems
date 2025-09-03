import { BaseForm, FormField, FormSelect } from '@/base-components/base-form';
import { PageHeader } from '@/base-components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFlashMessage } from '@/components/flash-messages';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Vendor } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Trash2, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditVendorProps {
    vendor: Vendor;
}

type ContactPerson = {
    id?: number;
    name: string;
    position: string;
    phone: string;
    email: string;
    is_primary: boolean;
    notes: string;
};

type VendorForm = {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    status: string;
    contact_persons: ContactPerson[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vendors', href: '/vendors' },
    { title: 'Edit Vendor', href: '#' },
];

export default function EditVendor({ vendor }: EditVendorProps) {
    const { showSuccess, showError } = useFlashMessage();

    // Debug: Log the vendor data to see what we're receiving
    console.log('Vendor data received:', vendor);
    console.log('Contact persons:', vendor.contact_persons);

    const { data, setData, put, processing, errors } = useForm<VendorForm>({
        name: vendor.name,
        address: vendor.address || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        website: vendor.website || '',
        description: vendor.description || '',
        status: vendor.status,
        contact_persons: vendor.contact_persons && vendor.contact_persons.length > 0
            ? vendor.contact_persons.map(contact => ({
                id: contact.id,
                name: contact.name,
                position: contact.position || '',
                phone: contact.phone || '',
                email: contact.email || '',
                is_primary: contact.is_primary,
                notes: contact.notes || '',
            }))
            : [
                {
                    name: '',
                    position: '',
                    phone: '',
                    email: '',
                    is_primary: true,
                    notes: '',
                },
                {
                    name: '',
                    position: '',
                    phone: '',
                    email: '',
                    is_primary: false,
                    notes: '',
                },
            ],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Filter out empty contact persons
        const validContactPersons = data.contact_persons.filter(contact =>
            contact.name && contact.name.trim() !== ''
        );

        // Check if we have existing contacts (with IDs) or enough new contacts
        const existingContacts = validContactPersons.filter(contact => contact.id);
        const newContacts = validContactPersons.filter(contact => !contact.id);
        const totalValidContacts = existingContacts.length + newContacts.length;

        if (totalValidContacts < 2) {
            showError('Please provide at least 2 contact persons with names.');
            return;
        }

        const submitData = {
            ...data,
            contact_persons: validContactPersons
        };

        // Submit form - Laravel flash messages will handle success notifications
        put(route('vendors.update', vendor.id), submitData, {
            onError: (errors) => {
                // Only show programmatic error if no validation errors (server error)
                if (Object.keys(errors).length === 0) {
                    showError('Failed to update vendor. Please try again.');
                }
            }
        });
    };

    const statusOptions = [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
    ];

    const addContactPerson = () => {
        setData('contact_persons', [
            ...data.contact_persons,
            {
                name: `Contact Person ${data.contact_persons.length + 1}`,
                position: '',
                phone: '',
                email: '',
                is_primary: false,
                notes: '',
            },
        ]);
    };

    const removeContactPerson = (index: number) => {
        if (data.contact_persons.length > 2) {
            const newContacts = data.contact_persons.filter((_, i) => i !== index);
            setData('contact_persons', newContacts);
        }
    };

    const updateContactPerson = (index: number, field: keyof ContactPerson, value: any) => {
        const newContacts = [...data.contact_persons];
        newContacts[index] = { ...newContacts[index], [field]: value };

        // If setting as primary, unset others
        if (field === 'is_primary' && value === true) {
            newContacts.forEach((contact, i) => {
                if (i !== index) {
                    contact.is_primary = false;
                }
            });
        }

        setData('contact_persons', newContacts);
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Vendor - ${vendor.name}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Edit ${vendor.name}`}
                    description="Update vendor information and contact details."
                    actions={[
                        {
                            label: 'Back to Vendors',
                            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                            href: route('vendors.index'),
                            variant: 'outline',
                        },
                    ]}
                />

                <div className="max-w-4xl">
                    <BaseForm onSubmit={submit}>
                        <div className="space-y-6">
                            {/* Basic Information */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <FormField
                                            label="Service Provider Name"
                                            name="name"
                                            value={data.name}
                                            onChange={(value) => setData('name', value)}
                                            error={errors.name}
                                            required
                                            placeholder="e.g., AutoCare Services Ltd."
                                        />

                                        <FormSelect
                                            label="Status"
                                            name="status"
                                            value={data.status}
                                            onChange={(value) => setData('status', value)}
                                            options={statusOptions}
                                            error={errors.status}
                                            required
                                        />

                                        <FormField
                                            label="Phone"
                                            name="phone"
                                            value={data.phone}
                                            onChange={(value) => setData('phone', value)}
                                            error={errors.phone}
                                            placeholder="e.g., +880-2-9876543"
                                        />

                                        <FormField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(value) => setData('email', value)}
                                            error={errors.email}
                                            placeholder="e.g., info@autocare.com.bd"
                                        />

                                        <FormField
                                            label="Website"
                                            name="website"
                                            type="url"
                                            value={data.website}
                                            onChange={(value) => setData('website', value)}
                                            error={errors.website}
                                            placeholder="e.g., https://www.autocare.com.bd"
                                        />

                                        <div className="sm:col-span-2">
                                            <FormField
                                                label="Address"
                                                name="address"
                                                value={data.address}
                                                onChange={(value) => setData('address', value)}
                                                error={errors.address}
                                                placeholder="Complete address"
                                                multiline
                                                rows={3}
                                            />
                                        </div>

                                        <div className="sm:col-span-2">
                                            <FormField
                                                label="Description"
                                                name="description"
                                                value={data.description}
                                                onChange={(value) => setData('description', value)}
                                                error={errors.description}
                                                placeholder="Brief description of services provided"
                                                multiline
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Persons */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Contact Persons (Minimum 2 Required)</CardTitle>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addContactPerson}
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Add Contact
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {data.contact_persons.map((contact, index) => (
                                            <div key={contact.id || index} className="border rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="font-medium">
                                                        Contact Person {index + 1}
                                                        {contact.is_primary && (
                                                            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                Primary
                                                            </span>
                                                        )}
                                                    </h4>
                                                    {data.contact_persons.length > 2 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeContactPerson(index)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                                    <FormField
                                                        label="Name"
                                                        name={`contact_persons.${index}.name`}
                                                        value={contact.name}
                                                        onChange={(value) => updateContactPerson(index, 'name', value)}
                                                        error={errors[`contact_persons.${index}.name` as keyof typeof errors]}
                                                        required
                                                        placeholder="Contact person name"
                                                    />

                                                    <FormField
                                                        label="Position"
                                                        name={`contact_persons.${index}.position`}
                                                        value={contact.position}
                                                        onChange={(value) => updateContactPerson(index, 'position', value)}
                                                        error={errors[`contact_persons.${index}.position` as keyof typeof errors]}
                                                        placeholder="Job title/position"
                                                    />

                                                    <FormField
                                                        label="Phone"
                                                        name={`contact_persons.${index}.phone`}
                                                        value={contact.phone}
                                                        onChange={(value) => updateContactPerson(index, 'phone', value)}
                                                        error={errors[`contact_persons.${index}.phone` as keyof typeof errors]}
                                                        placeholder="Phone number"
                                                    />

                                                    <FormField
                                                        label="Email"
                                                        name={`contact_persons.${index}.email`}
                                                        type="email"
                                                        value={contact.email}
                                                        onChange={(value) => updateContactPerson(index, 'email', value)}
                                                        error={errors[`contact_persons.${index}.email` as keyof typeof errors]}
                                                        placeholder="Email address"
                                                    />

                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`primary_${index}`}
                                                            checked={contact.is_primary}
                                                            onChange={(e) => updateContactPerson(index, 'is_primary', e.target.checked)}
                                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                        />
                                                        <label htmlFor={`primary_${index}`} className="text-sm font-medium text-gray-700">
                                                            Primary Contact
                                                        </label>
                                                    </div>

                                                    <div className="sm:col-span-2">
                                                        <FormField
                                                            label="Notes"
                                                            name={`contact_persons.${index}.notes`}
                                                            value={contact.notes}
                                                            onChange={(value) => updateContactPerson(index, 'notes', value)}
                                                            error={errors[`contact_persons.${index}.notes` as keyof typeof errors]}
                                                            placeholder="Additional notes about this contact"
                                                            multiline
                                                            rows={2}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex gap-3 pt-4">
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
                                disabled={processing}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Update Vendor
                            </Button>
                        </div>
                    </BaseForm>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
