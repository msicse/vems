import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Route, Navigation } from 'lucide-react';

interface DistanceDisplayProps {
    distances: {
        fromPrevious: number | null;
        cumulative: number | null;
        total?: number | null;
    };
    stopIndex: number;
    className?: string;
}

export function DistanceDisplay({ distances, stopIndex, className }: DistanceDisplayProps) {
    const formatDistance = (distance: number | null): string => {
        if (distance === null || distance === 0) return '0 km';
        return `${distance.toFixed(2)} km`;
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {stopIndex > 0 && (
                    <div className="flex items-center gap-1">
                        <Navigation className="h-3 w-3" />
                        <span>+{formatDistance(distances.fromPrevious)}</span>
                    </div>
                )}
                <div className="flex items-center gap-1">
                    <Route className="h-3 w-3" />
                    <span>{formatDistance(distances.cumulative)} total</span>
                </div>
            </div>
        </div>
    );
}

interface RouteDistanceSummaryProps {
    totalDistance: number | null;
    stopCount: number;
    className?: string;
}

export function RouteDistanceSummary({ totalDistance, stopCount, className }: RouteDistanceSummaryProps) {
    return (
        <Card className={className}>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    Route Summary
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Stops:</span>
                    <Badge variant="secondary">{stopCount}</Badge>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Distance:</span>
                    <Badge variant="outline" className="font-mono">
                        {totalDistance ? `${totalDistance.toFixed(2)} km` : '0 km'}
                    </Badge>
                </div>
                {totalDistance && totalDistance > 0 && (
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Avg. Distance:</span>
                        <Badge variant="outline" className="font-mono">
                            {stopCount > 1 ? `${(totalDistance / (stopCount - 1)).toFixed(2)} km` : '0 km'}
                        </Badge>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
