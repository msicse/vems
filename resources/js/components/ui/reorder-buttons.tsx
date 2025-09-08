import React from 'react';
import { Button } from '@/components/ui/button';
import {
    ArrowUp,
    ArrowDown,
    ChevronsUp,
    ChevronsDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReorderButtonsProps {
    index: number;
    totalItems: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    onMoveToTop: () => void;
    onMoveToBottom: () => void;
    className?: string;
    size?: 'sm' | 'default';
    orientation?: 'vertical' | 'horizontal';
}

export function ReorderButtons({
    index,
    totalItems,
    onMoveUp,
    onMoveDown,
    onMoveToTop,
    onMoveToBottom,
    className,
    size = 'sm',
    orientation = 'horizontal'
}: ReorderButtonsProps) {
    const isFirst = index === 0;
    const isLast = index === totalItems - 1;
    const canMoveUp = !isFirst;
    const canMoveDown = !isLast;
    const canMoveToTop = index > 0;
    const canMoveToBottom = index < totalItems - 1;

    const buttonClass = cn(
        "transition-colors",
        size === 'sm' ? "h-8 w-8 p-0" : "h-9 w-9 p-0"
    );

    const containerClass = cn(
        "flex gap-1",
        orientation === 'vertical' ? "flex-col" : "flex-row",
        className
    );

    return (
        <div className={containerClass}>
            <Button
                variant="outline"
                size={size}
                onClick={onMoveToTop}
                disabled={!canMoveToTop}
                title="Move to top"
                className={buttonClass}
            >
                <ChevronsUp className="h-3 w-3" />
            </Button>

            <Button
                variant="outline"
                size={size}
                onClick={onMoveUp}
                disabled={!canMoveUp}
                title="Move up"
                className={buttonClass}
            >
                <ArrowUp className="h-3 w-3" />
            </Button>

            <Button
                variant="outline"
                size={size}
                onClick={onMoveDown}
                disabled={!canMoveDown}
                title="Move down"
                className={buttonClass}
            >
                <ArrowDown className="h-3 w-3" />
            </Button>

            <Button
                variant="outline"
                size={size}
                onClick={onMoveToBottom}
                disabled={!canMoveToBottom}
                title="Move to bottom"
                className={buttonClass}
            >
                <ChevronsDown className="h-3 w-3" />
            </Button>
        </div>
    );
}
