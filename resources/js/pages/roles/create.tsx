import { BaseForm, FormField, FormSelect } from '@/base-components/base-form';
import { PageHeader } from '@/base-components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { BreadcrumbItem, Permission } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Plus, Shield } from 'lucide-react';

interface CreateRoleProps {
    permissions: Permission[];
}

type RoleForm = {
    name: string;
    guard_name: string;
    permissions: number[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles', href: '/roles' },
    { title: 'Create Role', href: '#' },
];

export default function CreateRole({ permissions }: CreateRoleProps) {
    const { data, setData, post, processing, errors } = useForm<RoleForm>({
        name: '',
        guard_name: 'web',
        permissions: [],
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData('permissions', data.permissions.filter(id => id !== permissionId));
        }
    };

    const selectAllPermissions = () => {
        setData('permissions', permissions.map(p => p.id));
    };

    const deselectAllPermissions = () => {
        setData('permissions', []);
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce((groups, permission) => {
        const category = permission.name.split(' ').slice(1).join(' ') || 'general';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(permission);
        return groups;
    }, {} as Record<string, Permission[]>);

    return (
        <AppSidebarLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Role" />

            <div className="space-y-6">
                <PageHeader
                    title="Create Role"
                    description="Create a new role and assign permissions."
                    actions={[
                        {
                            label: 'Back to Roles',
                            icon: <ArrowLeft className="mr-2 h-4 w-4" />,
                            href: route('roles.index'),
                            variant: 'outline',
                        },
                    ]}
                />

                <div className="max-w-4xl">
                    <BaseForm onSubmit={submit}>
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                            {/* Role Information */}
                            <Card className="lg:col-span-1">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-2">
                                        <Shield className="h-5 w-5" />
                                        <span>Role Information</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        label="Role Name"
                                        name="name"
                                        value={data.name}
                                        onChange={(value) => setData('name', value)}
                                        error={errors.name}
                                        required
                                        placeholder="e.g., Manager, Editor"
                                    />

                                    <FormSelect
                                        label="Guard Name"
                                        name="guard_name"
                                        value={data.guard_name}
                                        onChange={(value) => setData('guard_name', value)}
                                        options={[
                                            { label: 'Web', value: 'web' },
                                            { label: 'API', value: 'api' },
                                        ]}
                                        error={errors.guard_name}
                                        required
                                    />
                                </CardContent>
                            </Card>

                            {/* Permissions */}
                            <Card className="lg:col-span-2">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Permissions</CardTitle>
                                        <div className="flex space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={selectAllPermissions}
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={deselectAllPermissions}
                                            >
                                                Deselect All
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
                                            <div key={category}>
                                                <h4 className="font-medium text-gray-900 mb-3 capitalize">
                                                    {category} Permissions
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {categoryPermissions.map((permission) => (
                                                        <div key={permission.id} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`permission-${permission.id}`}
                                                                checked={data.permissions.includes(permission.id)}
                                                                onCheckedChange={(checked) => 
                                                                    handlePermissionChange(permission.id, checked as boolean)
                                                                }
                                                            />
                                                            <label
                                                                htmlFor={`permission-${permission.id}`}
                                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                            >
                                                                {permission.name}
                                                            </label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.permissions && (
                                        <p className="text-sm text-red-600 mt-2">{errors.permissions}</p>
                                    )}
                                </CardContent>
                            </Card>
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
                                <Plus className="h-4 w-4" />
                                Create Role
                            </Button>
                        </div>
                    </BaseForm>
                </div>
            </div>
        </AppSidebarLayout>
    );
}
