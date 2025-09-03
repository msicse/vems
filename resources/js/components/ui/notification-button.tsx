import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell } from 'lucide-react';

interface NotificationButtonProps {
    count?: number;
}

export function NotificationButton({ count = 0 }: NotificationButtonProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-md relative">
                    <Bell className="h-4 w-4" />
                    {count > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                            {count > 99 ? '99+' : count}
                        </span>
                    )}
                    <span className="sr-only">Notifications ({count})</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {count === 0 ? (
                    <DropdownMenuItem disabled>
                        <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2" />
                            <p className="text-sm">No new notifications</p>
                        </div>
                    </DropdownMenuItem>
                ) : (
                    <>
                        <DropdownMenuItem>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium">Sample Notification</p>
                                <p className="text-xs text-muted-foreground">This is a sample notification message</p>
                                <p className="text-xs text-muted-foreground">2 minutes ago</p>
                            </div>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-center">
                            <span className="text-sm text-muted-foreground">View all notifications</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
