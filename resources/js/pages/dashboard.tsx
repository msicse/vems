import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import {
    Car,
    Users,
    MapPin,
    Calendar,
    AlertTriangle,
    Bell,
    BarChart3,
    Clock,
    CheckCircle,
    TrendingUp,
    Activity,
    Route,
    Truck,
    UserCheck,
    Settings,
    Package,
    MessageSquare,
    Shield
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type BreadcrumbItem } from '@/types';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface DashboardProps {
    stats: {
        total_users: number;
        total_vehicles: number;
        active_vehicles: number;
        total_vendors: number;
    };
    moduleStats: {
        vehicles: {
            total: number;
            active: number;
            maintenance: number;
            available: number;
            regular: number;
            adhoc: number;
        };
        drivers: {
            total: number;
            active: number;
            on_trip: number;
            available: number;
            temporary: number;
        };
        routes: {
            total: number;
            active: number;
            scheduled_today: number;
            pickup_points: number;
            factories: number;
        };
        trips: {
            today: number;
            completed: number;
            ongoing: number;
            total_distance: number;
            avg_duration: number;
        };
        schedules: {
            this_week: number;
            pick_drop: number;
            engineer: number;
            training: number;
            adhoc: number;
        };
        issues: {
            open: number;
            in_progress: number;
            resolved_today: number;
            total_this_month: number;
        };
        notifications: {
            pending: number;
            sent_today: number;
            reminders: number;
        };
    };
    recentActivities: Array<{
        id: number;
        type: string;
        message: string;
        user: string;
        time: string;
        icon: string;
        color: string;
    }>;
    upcomingSchedules: Array<{
        id: number;
        route: string;
        driver: string;
        vehicle: string;
        time: string;
        type: string;
        passengers: number;
        status: string;
    }>;
    activeIssues: Array<{
        id: number;
        title: string;
        category: string;
        priority: string;
        status: string;
        reported_by: string;
        assigned_to: string;
        created_at: string;
    }>;
    performanceMetrics: {
        on_time_percentage: number;
        fuel_efficiency: number;
        customer_satisfaction: number;
        vehicle_utilization: number;
        driver_performance: number;
        maintenance_compliance: number;
    };
    chartData: {
        weeklyTrips: Array<{
            day: string;
            trips: number;
            completed: number;
            cancelled: number;
        }>;
        vehicleStatus: Array<{
            name: string;
            value: number;
            color: string;
        }>;
        monthlyPerformance: Array<{
            month: string;
            onTime: number;
            satisfaction: number;
            utilization: number;
        }>;
        routePerformance: Array<{
            route: string;
            trips: number;
            onTime: number;
            rating: number;
        }>;
        issueCategories: Array<{
            category: string;
            count: number;
            color: string;
        }>;
        driverPerformance: Array<{
            range: string;
            count: number;
            color: string;
        }>;
    };
}

export default function Dashboard() {
    const {
        stats,
        moduleStats,
        recentActivities,
        upcomingSchedules,
        activeIssues,
        performanceMetrics,
        chartData
    } = usePage<DashboardProps>().props;

    const getIconComponent = (iconName: string) => {
        const icons: { [key: string]: any } = {
            'check-circle': CheckCircle,
            'truck': Truck,
            'alert-triangle': AlertTriangle,
            'calendar-check': Calendar,
            'user-plus': UserCheck,
        };
        return icons[iconName] || Activity;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'pending_approval': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
            case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
            case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Status At A Glance</h1>
                        {/*<p className="text-gray-600 dark:text-gray-400"></p>*/}
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="text-green-600 border-green-600">
                            <Activity className="w-4 h-4 mr-1" />
                            System Active
                        </Badge>
                    </div>
                </div>

                {/* Module Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Vehicle Management */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🚗 Vehicle Management</CardTitle>
                            <Car className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{moduleStats.vehicles.total}</div>
                            <p className="text-xs text-muted-foreground">Total Vehicles</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Active:</span>
                                    <span className="font-medium text-green-600">{moduleStats.vehicles.active}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Available:</span>
                                    <span className="font-medium">{moduleStats.vehicles.available}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Maintenance:</span>
                                    <span className="font-medium text-orange-600">{moduleStats.vehicles.maintenance}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Driver Management */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">👨‍✈️ Driver Management</CardTitle>
                            <Users className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{moduleStats.drivers.total}</div>
                            <p className="text-xs text-muted-foreground">Total Drivers</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Active:</span>
                                    <span className="font-medium text-green-600">{moduleStats.drivers.active}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>On Trip:</span>
                                    <span className="font-medium text-blue-600">{moduleStats.drivers.on_trip}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Available:</span>
                                    <span className="font-medium">{moduleStats.drivers.available}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Route Management */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🗺️ Route Management</CardTitle>
                            <Route className="h-4 w-4 text-purple-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-purple-600">{moduleStats.routes.total}</div>
                            <p className="text-xs text-muted-foreground">Total Routes</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Active:</span>
                                    <span className="font-medium text-green-600">{moduleStats.routes.active}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Today:</span>
                                    <span className="font-medium text-blue-600">{moduleStats.routes.scheduled_today}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Factories:</span>
                                    <span className="font-medium">{moduleStats.routes.factories}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trip & Attendance */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">📍 Trip & Attendance</CardTitle>
                            <MapPin className="h-4 w-4 text-indigo-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-indigo-600">{moduleStats.trips.today}</div>
                            <p className="text-xs text-muted-foreground">Trips Today</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Completed:</span>
                                    <span className="font-medium text-green-600">{moduleStats.trips.completed}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Ongoing:</span>
                                    <span className="font-medium text-blue-600">{moduleStats.trips.ongoing}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Distance:</span>
                                    <span className="font-medium">{moduleStats.trips.total_distance} km</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Secondary Module Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Scheduling */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🗓️ Scheduling</CardTitle>
                            <Calendar className="h-4 w-4 text-teal-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-teal-600">{moduleStats.schedules.this_week}</div>
                            <p className="text-xs text-muted-foreground">This Week</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Pick & Drop:</span>
                                    <span className="font-medium">{moduleStats.schedules.pick_drop}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Engineer:</span>
                                    <span className="font-medium">{moduleStats.schedules.engineer}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Training:</span>
                                    <span className="font-medium">{moduleStats.schedules.training}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Issues & Complaints */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🛠️ Issues & Complaints</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{moduleStats.issues.open}</div>
                            <p className="text-xs text-muted-foreground">Open Issues</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>In Progress:</span>
                                    <span className="font-medium text-yellow-600">{moduleStats.issues.in_progress}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Resolved Today:</span>
                                    <span className="font-medium text-green-600">{moduleStats.issues.resolved_today}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>This Month:</span>
                                    <span className="font-medium">{moduleStats.issues.total_this_month}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notifications */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🔔 Notifications</CardTitle>
                            <Bell className="h-4 w-4 text-orange-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-orange-600">{moduleStats.notifications.pending}</div>
                            <p className="text-xs text-muted-foreground">Pending</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Sent Today:</span>
                                    <span className="font-medium text-green-600">{moduleStats.notifications.sent_today}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Reminders:</span>
                                    <span className="font-medium text-blue-600">{moduleStats.notifications.reminders}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Analytics & Reports */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">📊 Analytics & Reports</CardTitle>
                            <BarChart3 className="h-4 w-4 text-cyan-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-cyan-600">{performanceMetrics.on_time_percentage}%</div>
                            <p className="text-xs text-muted-foreground">On-Time Performance</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Satisfaction:</span>
                                    <span className="font-medium text-green-600">{performanceMetrics.customer_satisfaction}/5</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Utilization:</span>
                                    <span className="font-medium">{performanceMetrics.vehicle_utilization}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Additional Module Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Destination & Factory Management */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🧩 Destination & Factory</CardTitle>
                            <Package className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-600">{moduleStats.routes.factories}</div>
                            <p className="text-xs text-muted-foreground">Active Factories</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Pickup Points:</span>
                                    <span className="font-medium">{moduleStats.routes.pickup_points}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Routes:</span>
                                    <span className="font-medium text-blue-600">{moduleStats.routes.total}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Logistics Module */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">📦 Logistics</CardTitle>
                            <Truck className="h-4 w-4 text-amber-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{moduleStats.trips.total_distance}</div>
                            <p className="text-xs text-muted-foreground">Total KM Today</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Avg Duration:</span>
                                    <span className="font-medium">{moduleStats.trips.avg_duration} min</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Efficiency:</span>
                                    <span className="font-medium text-green-600">{performanceMetrics.fuel_efficiency} km/l</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Roles & Permissions */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">🧑‍💼 Roles & Permissions</CardTitle>
                            <Shield className="h-4 w-4 text-violet-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-violet-600">4</div>
                            <p className="text-xs text-muted-foreground">Active Roles</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Admin:</span>
                                    <span className="font-medium text-red-600">2</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Coordinators:</span>
                                    <span className="font-medium text-blue-600">8</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>Employees:</span>
                                    <span className="font-medium">156</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Summary */}
                    <Card className="hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">📈 Performance Summary</CardTitle>
                            <TrendingUp className="h-4 w-4 text-pink-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-pink-600">{performanceMetrics.driver_performance}%</div>
                            <p className="text-xs text-muted-foreground">Driver Performance</p>
                            <div className="mt-2 space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span>Maintenance:</span>
                                    <span className="font-medium text-green-600">{performanceMetrics.maintenance_compliance}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span>On-Time:</span>
                                    <span className="font-medium text-blue-600">{performanceMetrics.on_time_percentage}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Weekly Trip Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <BarChart3 className="w-5 h-5 mr-2" />
                                Weekly Trip Statistics
                            </CardTitle>
                            <CardDescription>Trip completion trends over the week</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.weeklyTrips}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                                    <Bar dataKey="cancelled" fill="#ef4444" name="Cancelled" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Vehicle Status Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Car className="w-5 h-5 mr-2" />
                                Vehicle Status Distribution
                            </CardTitle>
                            <CardDescription>Current status of all vehicles</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={chartData.vehicleStatus}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {chartData.vehicleStatus.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Performance Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-2" />
                                Monthly Performance Trends
                            </CardTitle>
                            <CardDescription>Performance metrics over the last 6 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData.monthlyPerformance}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line type="monotone" dataKey="onTime" stroke="#3b82f6" name="On-Time %" strokeWidth={2} />
                                    <Line type="monotone" dataKey="utilization" stroke="#10b981" name="Utilization %" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Issue Categories */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <AlertTriangle className="w-5 h-5 mr-2" />
                                Issue Categories (This Month)
                            </CardTitle>
                            <CardDescription>Breakdown of issues by category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={chartData.issueCategories} layout="horizontal">
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis dataKey="category" type="category" width={80} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#ef4444" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Route Performance Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Route className="w-5 h-5 mr-2" />
                            Route Performance Analysis
                        </CardTitle>
                        <CardDescription>Performance metrics for top 5 routes</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={chartData.routePerformance}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="route" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="onTime" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="On-Time %" />
                                <Area type="monotone" dataKey="rating" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Rating (x20)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activities */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="w-5 h-5 mr-2" />
                                Recent Activities
                            </CardTitle>
                            <CardDescription>Latest system activities and updates</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivities.map((activity) => {
                                    const IconComponent = getIconComponent(activity.icon);
                                    return (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            <div className={`p-2 rounded-full ${
                                                activity.color === 'green' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400' :
                                                activity.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' :
                                                activity.color === 'orange' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400' :
                                                activity.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400' :
                                                'bg-gray-100 text-gray-600 dark:bg-gray-900 dark:text-gray-400'
                                            }`}>
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {activity.message}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    by {activity.user} • {activity.time}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Driver Performance Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Driver Performance Distribution
                            </CardTitle>
                            <CardDescription>Performance rating distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={chartData.driverPerformance}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="count"
                                        label={({ range, count }) => `${range}: ${count}`}
                                    >
                                        {chartData.driverPerformance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Upcoming Schedules & Active Issues */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Upcoming Schedules */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Clock className="w-5 h-5 mr-2" />
                                Upcoming Schedules
                            </CardTitle>
                            <CardDescription>Next scheduled trips</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {upcomingSchedules.map((schedule) => (
                                    <div key={schedule.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center justify-between mb-2">
                                            <Badge className={getStatusColor(schedule.status)}>
                                                {schedule.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-sm font-medium text-blue-600">{schedule.time}</span>
                                        </div>
                                        <h4 className="font-medium text-sm text-gray-900 dark:text-white mb-1">
                                            {schedule.route}
                                        </h4>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Driver:</span>
                                                <span>{schedule.driver}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Vehicle:</span>
                                                <span>{schedule.vehicle}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Passengers:</span>
                                                <span>{schedule.passengers}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Active Issues */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Active Issues & Complaints
                            </CardTitle>
                            <CardDescription>Issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activeIssues.map((issue) => (
                                    <div key={issue.id} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center space-x-2">
                                                <Badge className={getPriorityColor(issue.priority)}>
                                                    {issue.priority}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {issue.category}
                                                </Badge>
                                            </div>
                                            <Badge className={getStatusColor(issue.status)}>
                                                {issue.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                            {issue.title}
                                        </h4>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                                            <div className="flex justify-between">
                                                <span>Reported by:</span>
                                                <span>{issue.reported_by}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Assigned to:</span>
                                                <span>{issue.assigned_to}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Created:</span>
                                                <span>{issue.created_at}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>


            </div>
        </AppLayout>
    );
}
