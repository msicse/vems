import { PageHeader } from '@/base-components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash2, Truck, UserCheck, UserX } from 'lucide-react';

interface ShowDriverProps {
    driver: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Drivers', href: '/drivers' },
    { title: 'Driver Details', href: '#' },
];

export default function ShowDriver({ driver }: ShowDriverProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete driver ${driver.name}?`)) {
            router.delete(route('drivers.destroy', driver.id));
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <UserCheck className="h-4 w-4" />;
            case 'inactive':
                return <UserX className="h-4 w-4" />;
            case 'suspended':
                return <UserX className="h-4 w-4" />;
            default:
                return <Truck className="h-4 w-4" />;
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active':
                return 'default';
            case 'inactive':
                return 'secondary';
            case 'suspended':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title={`${driver.name} - Driver Details`} />

            <div className="space-y-6">
                <PageHeader
                    title={driver.name}
                    description="Driver profile and information."
                    actions={[
                        {
                            label: 'Back to Drivers',
                            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                            href: route('drivers.index'),
                            variant: 'outline',
                        },
                        {
                            label: 'Edit Driver',
                            icon: <Edit className="mr-2 h-4 w-4" />,
                            href: route('drivers.edit', driver.id),
                        },
                    ]}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Driver Profile */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Truck className="h-5 w-5" />
                                <span>Driver Information</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {driver.image ? (
                                        <img className="h-20 w-20 rounded-full" src={driver.image} alt={driver.name} />
                                    ) : (
                                        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                                            <span className="text-2xl font-medium text-blue-700">
                                                {driver.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-medium">{driver.name}</h3>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <Badge variant={getStatusVariant(driver.status)} className="gap-1">
                                            {getStatusIcon(driver.status)}
                                            {driver.status}
                                        </Badge>
                                        <Badge variant="outline" className="gap-1">
                                            <Truck className="h-3 w-3" />
                                            Driver
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Contact Details</h4>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-center space-x-3">
                                            <Mail className="h-4 w-4 text-gray-400" />
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                                                <p className="text-sm">{driver.email}</p>
                                            </div>
                                        </div>

                                        {driver.phone && (
                                            <div className="flex items-center space-x-3">
                                                <Phone className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</label>
                                                    <p className="text-sm">{driver.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {driver.whatsapp_id && (
                                            <div className="flex items-center space-x-3">
                                                <Phone className="h-4 w-4 text-green-500" />
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp</label>
                                                    <p className="text-sm">{driver.whatsapp_id}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Personal Information</h4>
                                    
                                    <div className="space-y-3">
                                        {driver.blood_group && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Blood Group</label>
                                                <p className="font-mono text-sm bg-red-50 text-red-700 px-2 py-1 rounded inline-block">
                                                    {driver.blood_group}
                                                </p>
                                            </div>
                                        )}

                                        {driver.address && (
                                            <div className="flex items-start space-x-3">
                                                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                                                <div>
                                                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
                                                    <p className="text-sm">{driver.address}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Driver ID</label>
                                <p className="font-mono text-sm">{driver.id}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                                <p className="text-sm">
                                    {driver.email_verified_at ? (
                                        <Badge variant="default" className="gap-1">
                                            <UserCheck className="h-3 w-3" />
                                            Verified
                                        </Badge>
                                    ) : (
                                        <Badge variant="destructive" className="gap-1">
                                            <UserX className="h-3 w-3" />
                                            Not Verified
                                        </Badge>
                                    )}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Joined</label>
                                <p className="text-sm">
                                    {new Date(driver.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                                <p className="text-sm">
                                    {new Date(driver.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>

                            {driver.last_login_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                                    <p className="text-sm">{driver.last_login_at}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => router.visit(route('drivers.edit', driver.id))}
                                className="flex items-center"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Driver
                            </Button>
                            
                            {driver.phone && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`tel:${driver.phone}`)}
                                    className="flex items-center"
                                >
                                    <Phone className="mr-2 h-4 w-4" />
                                    Call Driver
                                </Button>
                            )}
                            
                            {driver.whatsapp_id && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(`https://wa.me/${driver.whatsapp_id.replace(/[^0-9]/g, '')}`)}
                                    className="flex items-center"
                                >
                                    <Phone className="mr-2 h-4 w-4" />
                                    WhatsApp
                                </Button>
                            )}
                            
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="flex items-center"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Driver
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
