import { BaseForm, FormField, FormSelect } from '@/base-components/base-form';
import { PageHeader } from '@/base-components/page-header';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Truck } from 'lucide-react';

interface EditDriverProps {
    driver: User;
    bloodGroups: string[];
    statuses: Array<{ label: string; value: string }>;
}

type DriverForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    phone: string;
    blood_group: string;
    image: string;
    status: string;
    address: string;
    whatsapp_id: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Drivers', href: '/drivers' },
    { title: 'Edit Driver', href: '#' },
];

export default function EditDriver({ driver, bloodGroups, statuses }: EditDriverProps) {
    const { data, setData, put, processing, errors } = useForm<DriverForm>({
        name: driver.name,
        email: driver.email,
        password: '',
        password_confirmation: '',
        phone: driver.phone || '',
        blood_group: driver.blood_group || '',
        image: driver.image || '',
        status: driver.status,
        address: driver.address || '',
        whatsapp_id: driver.whatsapp_id || '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('drivers.update', driver.id));
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Driver - ${driver.name}`} />

            <div className="space-y-6">
                <PageHeader
                    title={`Edit Driver - ${driver.name}`}
                    description="Update driver information and settings."
                    actions={[
                        {
                            label: 'Back to Drivers',
                            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                            href: route('drivers.index'),
                            variant: 'outline',
                        },
                    ]}
                />

                <div className="max-w-4xl">
                    <BaseForm onSubmit={submit}>
                        {/* Driver Badge */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <Truck className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-900">Driver Profile</span>
                            </div>
                            <p className="text-sm text-blue-700 mt-1">
                                This user is registered as a driver and has access to driver-specific features.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                label="Full Name"
                                name="name"
                                value={data.name}
                                onChange={(value) => setData('name', value)}
                                error={errors.name}
                                required
                                placeholder="e.g., John Doe"
                            />

                            <FormField
                                label="Email Address"
                                name="email"
                                type="email"
                                value={data.email}
                                onChange={(value) => setData('email', value)}
                                error={errors.email}
                                required
                                placeholder="e.g., john@example.com"
                            />

                            <FormField
                                label="New Password"
                                name="password"
                                type="password"
                                value={data.password}
                                onChange={(value) => setData('password', value)}
                                error={errors.password}
                                placeholder="Leave blank to keep current password"
                            />

                            <FormField
                                label="Confirm New Password"
                                name="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(value) => setData('password_confirmation', value)}
                                error={errors.password_confirmation}
                                placeholder="Confirm new password"
                            />

                            <FormField
                                label="Phone Number"
                                name="phone"
                                value={data.phone}
                                onChange={(value) => setData('phone', value)}
                                error={errors.phone}
                                placeholder="e.g., +1234567890"
                            />

                            <FormField
                                label="WhatsApp ID"
                                name="whatsapp_id"
                                value={data.whatsapp_id}
                                onChange={(value) => setData('whatsapp_id', value)}
                                error={errors.whatsapp_id}
                                placeholder="e.g., +1234567890"
                            />

                            <FormSelect
                                label="Blood Group"
                                name="blood_group"
                                value={data.blood_group}
                                onChange={(value) => setData('blood_group', value)}
                                options={bloodGroups.map(group => ({
                                    label: group,
                                    value: group
                                }))}
                                error={errors.blood_group}
                                placeholder="Select blood group"
                            />

                            <FormSelect
                                label="Status"
                                name="status"
                                value={data.status}
                                onChange={(value) => setData('status', value)}
                                options={statuses}
                                error={errors.status}
                                required
                            />

                            <FormField
                                label="Profile Image URL"
                                name="image"
                                value={data.image}
                                onChange={(value) => setData('image', value)}
                                error={errors.image}
                                placeholder="https://example.com/image.jpg"
                            />

                            <div className="sm:col-span-2">
                                <FormField
                                    label="Address"
                                    name="address"
                                    value={data.address}
                                    onChange={(value) => setData('address', value)}
                                    error={errors.address}
                                    placeholder="Full address for delivery routes"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-6">
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
                                <Save className="h-4 w-4" />
                                Update Driver
                            </Button>
                        </div>
                    </BaseForm>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
