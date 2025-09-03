import { PageHeader } from '@/base-components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Vendor } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Building2, Car, Edit, ExternalLink, Mail, Phone, Trash2, User, Users } from 'lucide-react';

interface ShowVendorProps {
    vendor: Vendor;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Vendors', href: '/vendors' },
    { title: 'Vendor Details', href: '#' },
];

export default function ShowVendor({ vendor }: ShowVendorProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${vendor.name}?`)) {
            router.delete(route('vendors.destroy', vendor.id));
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`${vendor.name} - Vendor Details`} />

            <div className="space-y-6">
                <PageHeader
                    title={vendor.name}
                    description="Vendor details and contact information."
                    actions={[
                        {
                            label: 'Back to Vendors',
                            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                            href: route('vendors.index'),
                            variant: 'outline',
                        },
                        {
                            label: 'Edit Vendor',
                            icon: <Edit className="mr-2 h-4 w-4" />,
                            href: route('vendors.edit', vendor.id),
                        },
                    ]}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Building2 className="h-5 w-5 mr-2" />
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Service Provider Name</label>
                                    <p className="text-sm font-medium">{vendor.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <div>
                                        <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                                            {vendor.status === 'active' ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                    <p className="text-sm font-mono">{vendor.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    <p className="text-sm">{vendor.email || 'N/A'}</p>
                                </div>
                                {vendor.website && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Website</label>
                                        <p className="text-sm">
                                            <a 
                                                href={vendor.website} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline flex items-center"
                                            >
                                                {vendor.website}
                                                <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    <p className="text-sm">{vendor.address || 'N/A'}</p>
                                </div>
                                {vendor.description && (
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                                        <p className="text-sm">{vendor.description}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="h-5 w-5 mr-2" />
                                Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">
                                        {vendor.contact_persons?.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Contact Persons</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">
                                        {vendor.vehicles?.length || 0}
                                    </div>
                                    <div className="text-sm text-muted-foreground">Vehicles</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Vendor ID</label>
                                    <p className="font-mono text-sm">{vendor.id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                    <p className="text-sm">
                                        {new Date(vendor.created_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                    <p className="text-sm">
                                        {new Date(vendor.updated_at).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contact Persons */}
                    {vendor.contact_persons && vendor.contact_persons.length > 0 && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="h-5 w-5 mr-2" />
                                    Contact Persons ({vendor.contact_persons.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {vendor.contact_persons.map((contact) => (
                                        <div key={contact.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="font-medium text-lg">{contact.name}</h4>
                                                {contact.is_primary && (
                                                    <Badge variant="default" className="text-xs">Primary</Badge>
                                                )}
                                            </div>
                                            
                                            {contact.position && (
                                                <p className="text-sm text-muted-foreground mb-2">{contact.position}</p>
                                            )}
                                            
                                            <div className="space-y-2">
                                                {contact.phone && (
                                                    <div className="flex items-center text-sm">
                                                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        <span className="font-mono">{contact.phone}</span>
                                                    </div>
                                                )}
                                                
                                                {contact.email && (
                                                    <div className="flex items-center text-sm">
                                                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                                                        <span>{contact.email}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {contact.notes && (
                                                <div className="mt-3 pt-3 border-t">
                                                    <p className="text-sm text-muted-foreground">{contact.notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Associated Vehicles */}
                    {vendor.vehicles && vendor.vehicles.length > 0 && (
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Car className="h-5 w-5 mr-2" />
                                    Associated Vehicles ({vendor.vehicles.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {vendor.vehicles.map((vehicle) => (
                                        <div key={vehicle.id} className="border rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-medium">{vehicle.brand} {vehicle.model}</h4>
                                                <Badge variant={vehicle.is_active ? 'default' : 'secondary'}>
                                                    {vehicle.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Registration: <span className="font-mono">{vehicle.registration_number}</span>
                                            </p>
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Color: {vehicle.color}
                                            </p>
                                            <Link
                                                href={route('vehicles.show', vehicle.id)}
                                                className="text-sm text-blue-600 hover:underline"
                                            >
                                                View Details →
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-4">
                            <Button
                                onClick={() => router.visit(route('vendors.edit', vendor.id))}
                                className="flex items-center"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Vendor
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="flex items-center"
                                disabled={vendor.vehicles && vendor.vehicles.length > 0}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Vendor
                            </Button>
                        </div>
                        {vendor.vehicles && vendor.vehicles.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Cannot delete vendor with associated vehicles. Remove vehicle associations first.
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
