<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Trip;
use App\Models\TripPassenger;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleRoute;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TripSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $routeIds = VehicleRoute::query()->pluck('id')->all();
        $vehicleIds = Vehicle::query()->where('is_active', true)->pluck('id')->all();
        $departmentIds = Department::query()->pluck('id')->all();

        $driverIds = User::query()
            ->where('status', 'active')
            ->where('user_type', 'driver')
            ->pluck('id')
            ->all();

        $requesterIds = User::query()
            ->where('status', 'active')
            ->pluck('id')
            ->all();

        $passengerIds = User::query()
            ->where('status', 'active')
            ->where('user_type', '!=', 'driver')
            ->pluck('id')
            ->all();

        $stopIds = DB::table('stops')->pluck('id')->all();

        if (empty($routeIds) || empty($vehicleIds) || empty($departmentIds) || empty($requesterIds) || empty($stopIds)) {
            $this->command?->warn('TripSeeder skipped: missing prerequisite records (routes, vehicles, departments, users, or stops).');

            return;
        }

        $existingTrips = Trip::query()->count();
        if ($existingTrips >= 50) {
            $this->command?->info("TripSeeder skipped: {$existingTrips} trips already exist.");

            return;
        }

        $scheduleTypes = ['pick-and-drop', 'engineer', 'training', 'adhoc', 'reposition'];
        $tripTypes = ['inspection', 'pick-up', 'drop-off', 'training', 'complaints', 'officials', 'Assigned'];
        $statuses = ['pending', 'approved', 'assigned', 'in_progress', 'completed', 'cancelled'];
        $statusWeights = [10, 15, 10, 15, 40, 10];

        $tripCount = 120;
        $today = Carbon::today();

        DB::transaction(function () use (
            $tripCount,
            $today,
            $scheduleTypes,
            $tripTypes,
            $statuses,
            $statusWeights,
            $routeIds,
            $vehicleIds,
            $driverIds,
            $departmentIds,
            $requesterIds,
            $passengerIds,
            $stopIds
        ) {
            for ($i = 1; $i <= $tripCount; $i++) {
                $scheduledDate = (clone $today)->subDays(random_int(0, 59));
                $startHour = random_int(6, 20);
                $startMinute = random_int(0, 3) * 15;
                $startTime = Carbon::createFromTime($startHour, $startMinute, 0);
                $durationMinutes = random_int(35, 140);
                $endTime = (clone $startTime)->addMinutes($durationMinutes);

                $status = $this->weightedChoice($statuses, $statusWeights);
                $isCompleted = $status === 'completed';

                $requestedBy = $requesterIds[array_rand($requesterIds)];
                $approvedBy = in_array($status, ['approved', 'assigned', 'in_progress', 'completed', 'cancelled'], true)
                    ? $requesterIds[array_rand($requesterIds)]
                    : null;

                $driverId = !empty($driverIds) ? $driverIds[array_rand($driverIds)] : null;

                $trip = Trip::create([
                    'trip_number' => sprintf('TRP-REP-%05d', $i),
                    'vehicle_route_id' => $routeIds[array_rand($routeIds)],
                    'vehicle_id' => $vehicleIds[array_rand($vehicleIds)],
                    'driver_id' => $driverId,
                    'department_id' => $departmentIds[array_rand($departmentIds)],
                    'requested_by' => $requestedBy,
                    'approved_by' => $approvedBy,
                    'trip_type' => $tripTypes[array_rand($tripTypes)],
                    'team_number' => 'TEAM-' . random_int(1, 12),
                    'description' => 'Auto-generated trip for report analytics sample data.',
                    'schedule_type' => $scheduleTypes[array_rand($scheduleTypes)],
                    'priority' => ['low', 'medium', 'high', 'urgent'][array_rand(['low', 'medium', 'high', 'urgent'])],
                    'scheduled_date' => $scheduledDate->toDateString(),
                    'scheduled_start_time' => $startTime->format('H:i:s'),
                    'scheduled_end_time' => $endTime->format('H:i:s'),
                    'actual_start_time' => in_array($status, ['in_progress', 'completed'], true)
                        ? $scheduledDate->copy()->setTimeFromTimeString($startTime->format('H:i:s'))->addMinutes(random_int(0, 12))
                        : null,
                    'actual_end_time' => $status === 'completed'
                        ? $scheduledDate->copy()->setTimeFromTimeString($endTime->format('H:i:s'))->addMinutes(random_int(0, 20))
                        : null,
                    'start_time' => in_array($status, ['in_progress', 'completed'], true)
                        ? $scheduledDate->copy()->setTimeFromTimeString($startTime->format('H:i:s'))
                        : null,
                    'end_time' => $status === 'completed'
                        ? $scheduledDate->copy()->setTimeFromTimeString($endTime->format('H:i:s'))
                        : null,
                    'start_location' => 'Pickup Zone ' . random_int(1, 20),
                    'end_location' => 'Drop Zone ' . random_int(1, 20),
                    'odometer_start' => random_int(10000, 90000),
                    'odometer_end' => random_int(90001, 120000),
                    'actual_duration' => $status === 'completed' ? $durationMinutes + random_int(-5, 20) : null,
                    'fuel_consumed' => $status === 'completed' ? round(random_int(5, 30) + random_int(0, 99) / 100, 2) : null,
                    'fuel_cost' => $status === 'completed' ? round(random_int(600, 3800) + random_int(0, 99) / 100, 2) : null,
                    'other_costs' => $status === 'completed' ? round(random_int(0, 1200) + random_int(0, 99) / 100, 2) : 0,
                    'total_cost' => in_array($status, ['completed', 'in_progress'], true)
                        ? round(random_int(1200, 6800) + random_int(0, 99) / 100, 2)
                        : 0,
                    'status' => $status,
                    'cancellation_reason' => $status === 'cancelled'
                        ? ['passenger_no_show', 'vehicle_breakdown', 'driver_unavailable', 'route_blocked', 'weather_conditions', 'emergency', 'other'][array_rand(['passenger_no_show', 'vehicle_breakdown', 'driver_unavailable', 'route_blocked', 'weather_conditions', 'emergency', 'other'])]
                        : null,
                    'cancellation_notes' => $status === 'cancelled' ? 'Auto-generated cancellation sample.' : null,
                    'cancelled_by' => $status === 'cancelled' ? $requesterIds[array_rand($requesterIds)] : null,
                    'cancelled_at' => $status === 'cancelled' ? now()->subDays(random_int(0, 30)) : null,
                    'is_return' => random_int(0, 100) <= 30,
                    'is_completed' => $isCompleted,
                    'comments' => Str::limit('Seeded trip for reports module visualization.', 120),
                ]);

                if (empty($passengerIds)) {
                    continue;
                }

                $sampleCount = min(random_int(2, 8), count($passengerIds));
                $samplePassengerIds = collect($passengerIds)->shuffle()->take($sampleCount)->values();

                foreach ($samplePassengerIds as $passengerId) {
                    $passengerStatus = $this->passengerStatusByTripStatus($status);

                    $boardedAt = null;
                    $droppedAt = null;
                    if (in_array($passengerStatus, ['boarded', 'completed'], true)) {
                        $boardedAt = $scheduledDate->copy()
                            ->setTimeFromTimeString($startTime->format('H:i:s'))
                            ->addMinutes(random_int(0, 20));
                    }

                    if ($passengerStatus === 'completed') {
                        $droppedAt = $scheduledDate->copy()
                            ->setTimeFromTimeString($endTime->format('H:i:s'))
                            ->addMinutes(random_int(0, 15));
                    }

                    TripPassenger::create([
                        'trip_id' => $trip->id,
                        'user_id' => $passengerId,
                        'pickup_stop_id' => $stopIds[array_rand($stopIds)],
                        'dropoff_stop_id' => $stopIds[array_rand($stopIds)],
                        'status' => $passengerStatus,
                        'boarded_at' => $boardedAt,
                        'dropped_at' => $droppedAt,
                        'notes' => 'Generated passenger attendance sample.',
                    ]);
                }
            }
        });

        $this->command?->info('TripSeeder completed: generated sample trips and passengers for reports.');
    }

    private function weightedChoice(array $values, array $weights): string
    {
        $total = array_sum($weights);
        $rand = random_int(1, $total);
        $running = 0;

        foreach ($values as $index => $value) {
            $running += $weights[$index];
            if ($rand <= $running) {
                return $value;
            }
        }

        return $values[array_key_last($values)];
    }

    private function passengerStatusByTripStatus(string $tripStatus): string
    {
        return match ($tripStatus) {
            'completed' => $this->weightedChoice(['completed', 'no_show'], [85, 15]),
            'in_progress' => $this->weightedChoice(['boarded', 'pending'], [70, 30]),
            'assigned', 'approved' => $this->weightedChoice(['confirmed', 'pending'], [70, 30]),
            'cancelled' => $this->weightedChoice(['cancelled', 'no_show', 'pending'], [50, 20, 30]),
            default => 'pending',
        };
    }
}
