<?php

namespace App\Exports;

use App\Models\Trip;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class TripsReportExport implements FromQuery, WithHeadings, WithMapping, ShouldAutoSize
{
    public function __construct(private $query)
    {
    }

    public function query()
    {
        return $this->query;
    }

    public function headings(): array
    {
        return [
            'Trip Number',
            'Date',
            'Status',
            'Schedule Type',
            'Route',
            'Vehicle',
            'Driver',
            'Department',
            'Passengers',
        ];
    }

    public function map($trip): array
    {
        /** @var Trip $trip */
        return [
            $trip->trip_number,
            (string) $trip->scheduled_date,
            $trip->status,
            $trip->schedule_type,
            $trip->vehicleRoute?->name,
            $trip->vehicle?->registration_number,
            $trip->driver?->name,
            $trip->department?->name,
            $trip->passengers_count,
        ];
    }
}
