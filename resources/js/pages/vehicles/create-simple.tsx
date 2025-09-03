import { BaseForm, FormField, FormSelect } from '@/base-components/base-form';
import { PageHeader } from '@/base-components/page-header';
import { Button } from '@/components/ui/button';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Vendor } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';

interface CreateVehicleProps {
    vendors?: Vendor[];
}

type VehicleForm = {
    brand: string;
    model: string;
    color: string;
    registration_number: string;
    vendor_id: string;
    is_active: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vehicles', href: '/vehicles' },
    { title: 'Create Vehicle', href: '#' },
];

export default function CreateVehicle({ vendors = [] }: CreateVehicleProps) {
    const { data, setData, post, processing, errors } = useForm<VehicleForm>({
        brand: '',
        model: '',
        color: '',
        registration_number: '',
        vendor_id: 'none',
        is_active: true,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare data for submission
        const submitData = {
            ...data,
            vendor_id: data.vendor_id === 'none' ? '' : data.vendor_id
        };

        post(route('vehicles.store'), submitData);
    };

    const statusOptions = [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
    ];

    const vendorOptions = [
        { label: 'Select Vendor', value: 'none' },
        ...vendors.map(vendor => ({
            label: vendor.name,
            value: vendor.id.toString()
        }))
    ];

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Vehicle" />

            <div className="space-y-6">
                <PageHeader
                    title="Create Vehicle"
                    description="Add a new vehicle to your fleet."
                    actions={[
                        {
                            label: 'Back to Vehicles',
                            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                            href: route('vehicles.index'),
                            variant: 'outline',
                        },
                    ]}
                />

                <div className="max-w-2xl">
                    <BaseForm onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <FormField
                                label="Brand"
                                name="brand"
                                value={data.brand}
                                onChange={(value) => setData('brand', value)}
                                error={errors.brand || undefined}
                                required
                                placeholder="e.g., Toyota, Honda, Ford"
                            />

                            <FormField
                                label="Model"
                                name="model"
                                value={data.model}
                                onChange={(value) => setData('model', value)}
                                error={errors.model || undefined}
                                required
                                placeholder="e.g., Camry, Civic, F-150"
                            />

                            <FormField
                                label="Color"
                                name="color"
                                value={data.color}
                                onChange={(value) => setData('color', value)}
                                error={errors.color || undefined}
                                required
                                placeholder="e.g., Red, Blue, White"
                            />

                            <FormField
                                label="Registration Number"
                                name="registration_number"
                                value={data.registration_number}
                                onChange={(value) => setData('registration_number', value)}
                                error={errors.registration_number || undefined}
                                required
                                placeholder="e.g., ABC-123"
                            />

                            <FormSelect
                                label="Vendor / Service Provider"
                                name="vendor_id"
                                value={data.vendor_id}
                                onChange={(value) => setData('vendor_id', value === 'none' ? null : value)}
                                options={vendorOptions}
                                error={errors.vendor_id || undefined}
                            />

                            <FormSelect
                                label="Status"
                                name="is_active"
                                value={data.is_active.toString()}
                                onChange={(value) => setData('is_active', value === 'true')}
                                options={statusOptions}
                                error={errors.is_active || undefined}
                                required
                            />
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
                                <Plus className="h-4 w-4 mr-2" />
                                Create Vehicle
                            </Button>
                        </div>
                    </BaseForm>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
