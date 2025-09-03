import { PageHeader } from "@/base-components/page-header"
import { Plus, Settings, Download, Users } from "lucide-react"

// Example 1: Simple header with title and description only
export function SimplePageExample() {
  return (
    <PageHeader
      title="Dashboard"
      description="Welcome to your dashboard overview"
    />
  )
}

// Example 2: Header with single action button
export function HeaderWithActionExample() {
  return (
    <PageHeader
      title="Users"
      description="Manage system users and permissions"
      actions={[
        {
          label: "Add User",
          icon: <Plus className="mr-2 h-4 w-4" />,
          href: "/users/create",
        }
      ]}
    />
  )
}

// Example 3: Header with multiple action buttons
export function HeaderWithMultipleActionsExample() {
  return (
    <PageHeader
      title="Settings"
      description="Configure your application settings"
      actions={[
        {
          label: "Export",
          icon: <Download className="mr-2 h-4 w-4" />,
          variant: "outline",
          onClick: () => console.log("Export clicked"),
        },
        {
          label: "Settings",
          icon: <Settings className="mr-2 h-4 w-4" />,
          href: "/settings/general",
        }
      ]}
    />
  )
}

// Example 4: Header with stats cards
export function HeaderWithStatsExample() {
  return (
    <PageHeader
      title="Analytics"
      description="View your application analytics and metrics"
      stats={[
        {
          label: "Total Users",
          value: "1,234",
        },
        {
          label: "Active Sessions",
          value: 89,
        },
        {
          label: "Revenue",
          value: "$12,345",
          description: "This month",
        }
      ]}
    />
  )
}

// Example 5: Complete header with everything
export function CompleteHeaderExample() {
  return (
    <PageHeader
      title="Products"
      description="Manage your product inventory with advanced filtering and search"
      actions={[
        {
          label: "Export",
          icon: <Download className="mr-2 h-4 w-4" />,
          variant: "outline",
          onClick: () => console.log("Export products"),
        },
        {
          label: "Add Product",
          icon: <Plus className="mr-2 h-4 w-4" />,
          href: "/products/create",
        }
      ]}
      stats={[
        {
          label: "Total Products",
          value: 150,
        },
        {
          label: "Active Products",
          value: 120,
        },
        {
          label: "Categories",
          value: 8,
        },
        {
          label: "Total Value",
          value: "$45,678.90",
        }
      ]}
    />
  )
}

// Example 6: Header with custom content
export function HeaderWithCustomContentExample() {
  return (
    <PageHeader
      title="Reports"
      description="Generate and view system reports"
      actions={[
        {
          label: "Generate Report",
          icon: <Plus className="mr-2 h-4 w-4" />,
          onClick: () => console.log("Generate report"),
        }
      ]}
    >
      {/* Custom content can be added here */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          📊 New reporting features are now available! 
          <a href="#" className="underline ml-1">Learn more</a>
        </p>
      </div>
    </PageHeader>
  )
}
