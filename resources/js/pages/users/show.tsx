import { PageHeader } from '@/base-components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, User } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Mail, MapPin, Phone, Trash2, User as UserIcon, UserCheck, UserX } from 'lucide-react';

interface ShowUserProps {
    user: User;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Users', href: '/users' },
    { title: 'User Details', href: '#' },
];

export default function ShowUser({ user }: ShowUserProps) {
    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${user.name}?`)) {
            router.delete(route('users.destroy', user.id));
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
                return <UserIcon className="h-4 w-4" />;
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
            <Head title={`${user.name} - User Details`} />

            <div className="space-y-6">
                <PageHeader
                    title={user.name}
                    description="User profile and information."
                    actions={[
                        {
                            label: 'Back to Users',
                            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                            href: route('users.index'),
                            variant: 'outline',
                        },
                        {
                            label: 'Edit User',
                            icon: <Edit className="mr-2 h-4 w-4" />,
                            href: route('users.edit', user.id),
                        },
                    ]}
                />

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* User Profile */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>User Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Profile Header */}
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    {user.image ? (
                                        <img className="h-16 w-16 rounded-full" src={user.image} alt={user.name} />
                                    ) : (
                                        <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                                            <span className="text-xl font-medium text-gray-700">
                                                {user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium">{user.name}</h3>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Badge variant={getStatusVariant(user.status)} className="gap-1">
                                            {getStatusIcon(user.status)}
                                            {user.status}
                                        </Badge>
                                        {user.user_type && (
                                            <Badge variant="outline" className="capitalize">
                                                {user.user_type}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                                    </div>
                                    <p className="text-sm">{user.email}</p>
                                </div>

                                {user.phone && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <label className="text-sm font-medium text-muted-foreground">Phone</label>
                                        </div>
                                        <p className="text-sm">{user.phone}</p>
                                    </div>
                                )}

                                {user.whatsapp_id && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <label className="text-sm font-medium text-muted-foreground">WhatsApp</label>
                                        </div>
                                        <p className="text-sm">{user.whatsapp_id}</p>
                                    </div>
                                )}

                                {user.blood_group && (
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                            <label className="text-sm font-medium text-muted-foreground">Blood Group</label>
                                        </div>
                                        <p className="font-mono text-sm">{user.blood_group}</p>
                                    </div>
                                )}
                            </div>

                            {/* Address */}
                            {user.address && (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    </div>
                                    <p className="text-sm">{user.address}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* System Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>System Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                <p className="font-mono text-sm">{user.id}</p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email Verified</label>
                                <p className="text-sm">
                                    {user.email_verified_at ? (
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
                                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                                <p className="text-sm">
                                    {new Date(user.created_at).toLocaleDateString('en-US', {
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
                                    {new Date(user.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>

                            {user.last_login_at && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Last Login</label>
                                    <p className="text-sm">{user.last_login_at}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex space-x-4">
                            <Button
                                onClick={() => router.visit(route('users.edit', user.id))}
                                className="flex items-center"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                className="flex items-center"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete User
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppSidebarLayout>
    );
}
