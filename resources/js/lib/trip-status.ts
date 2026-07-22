import { Trip } from '@/types';

/**
 * Statuses from which a trip can be started (see TripStateController::start()
 * and Trip::canTransitionTo() on the backend — this must stay in sync with those).
 */
export const STARTABLE_TRIP_STATUSES: Trip['status'][] = ['approved', 'assigned'];

export function canStartTrip(status: Trip['status']): boolean {
    return STARTABLE_TRIP_STATUSES.includes(status);
}
