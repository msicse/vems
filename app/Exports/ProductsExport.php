<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;

class ProductsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $query;
    protected $template;

    public function __construct($query, $template = null)
    {
        $this->query = $query;
        $this->template = $template;
    }

    /**
     * @return \Illuminate\Database\Query\Builder
     */
    public function query()
    {
        return $this->query;
    }

    /**
     * @return array
     */
    public function headings(): array
    {
        if ($this->template) {
            $enabledColumns = $this->template->getEnabledColumns();
            $availableColumns = \App\Models\ExportTemplate::getAvailableColumns('Product');

            return array_map(function($columnKey) use ($availableColumns) {
                return $availableColumns[$columnKey]['label'] ?? $columnKey;
            }, $enabledColumns);
        }

        return [
            'ID',
            'Product Name',
            'Description',
            'Price ($)',
            'Category',
            'Status',
            'Created Date',
            'Updated Date',
        ];
    }

    /**
     * @param Product $product
     * @return array
     */
    public function map($product): array
    {
        if ($this->template) {
            $enabledColumns = $this->template->getEnabledColumns();
            $data = [];

            foreach ($enabledColumns as $columnKey) {
                switch ($columnKey) {
                    case 'id':
                        $data[] = $product->id;
                        break;
                    case 'name':
                        $data[] = $product->name;
                        break;
                    case 'description':
                        $data[] = $product->description;
                        break;
                    case 'price':
                        $data[] = number_format($product->price, 2);
                        break;
                    case 'category':
                        $data[] = $product->category;
                        break;
                    case 'status':
                        $data[] = ucfirst($product->status);
                        break;
                    case 'created_at':
                        $data[] = $product->created_at->format('Y-m-d H:i:s');
                        break;
                    case 'updated_at':
                        $data[] = $product->updated_at->format('Y-m-d H:i:s');
                        break;
                    default:
                        $data[] = $product->{$columnKey} ?? '';
                        break;
                }
            }

            return $data;
        }

        return [
            $product->id,
            $product->name,
            $product->description,
            number_format($product->price, 2),
            $product->category,
            ucfirst($product->status),
            $product->created_at->format('Y-m-d H:i:s'),
            $product->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * @param Worksheet $sheet
     * @return array
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as header
            1 => [
                'font' => [
                    'bold' => true,
                    'color' => ['rgb' => 'FFFFFF'],
                ],
                'fill' => [
                    'fillType' => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => '4F46E5'],
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
            // Style price column
            'D:D' => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                ],
            ],
            // Style status column
            'F:F' => [
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
            ],
        ];
    }
}
