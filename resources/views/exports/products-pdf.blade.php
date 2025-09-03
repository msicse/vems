<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Products Export</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #4F46E5;
            padding-bottom: 15px;
        }

        .header h1 {
            color: #4F46E5;
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }

        .header .meta {
            margin-top: 10px;
            color: #666;
            font-size: 11px;
        }

        .summary {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border-left: 4px solid #4F46E5;
        }

        .summary h3 {
            margin: 0 0 10px 0;
            color: #4F46E5;
            font-size: 14px;
        }

        .summary-grid {
            display: table;
            width: 100%;
            table-layout: fixed;
        }

        .summary-item {
            display: table-cell;
            width: 25%;
            text-align: center;
            vertical-align: top;
            padding: 5px;
        }



        .summary-item .value {
            font-size: 18px;
            font-weight: bold;
            color: #4F46E5;
        }

        .summary-item .label {
            font-size: 10px;
            color: #666;
            text-transform: uppercase;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 10px;
        }

        th {
            background-color: #4F46E5;
            color: white;
            padding: 8px 6px;
            text-align: left;
            font-weight: bold;
            font-size: 10px;
        }

        td {
            padding: 6px;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: top;
        }

        tr:nth-child(even) {
            background-color: #f9fafb;
        }

        .status {
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
        }

        .status.active {
            background-color: #dcfce7;
            color: #166534;
        }

        .status.inactive {
            background-color: #f3f4f6;
            color: #374151;
        }

        .status.pending {
            background-color: #fef3c7;
            color: #92400e;
        }

        .price {
            text-align: right;
            font-weight: bold;
            color: #059669;
        }

        .description {
            max-width: 200px;
            word-wrap: break-word;
            font-size: 9px;
            color: #666;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Products Export Report</h1>
        <div class="meta">
            Generated on {{ $exportDate }} | Total Records: {{ $totalRecords }}
        </div>
    </div>

    <div class="summary">
        <h3>Export Summary</h3>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="value">{{ $products->count() }}</div>
                <div class="label">Total Products</div>
            </div>
            <div class="summary-item">
                <div class="value">{{ $products->where('status', 'active')->count() }}</div>
                <div class="label">Active Products</div>
            </div>
            <div class="summary-item">
                <div class="value">{{ $products->unique('category')->count() }}</div>
                <div class="label">Categories</div>
            </div>
            <div class="summary-item">
                <div class="value">${{ number_format($products->sum('price'), 2) }}</div>
                <div class="label">Total Value</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 5%">ID</th>
                <th style="width: 20%">Product Name</th>
                <th style="width: 30%">Description</th>
                <th style="width: 10%">Price</th>
                <th style="width: 15%">Category</th>
                <th style="width: 10%">Status</th>
                <th style="width: 10%">Created</th>
            </tr>
        </thead>
        <tbody>
            @foreach($products as $index => $product)
                <tr>
                    <td>{{ $product->id }}</td>
                    <td><strong>{{ $product->name }}</strong></td>
                    <td class="description">{{ $product->description }}</td>
                    <td class="price">${{ number_format($product->price, 2) }}</td>
                    <td>{{ $product->category }}</td>
                    <td>
                        <span class="status {{ $product->status }}">
                            {{ ucfirst($product->status) }}
                        </span>
                    </td>
                    <td>{{ $product->created_at->format('M j, Y') }}</td>
                </tr>

                @if(($index + 1) % 25 == 0 && $index + 1 < $products->count())
                    </tbody>
                    </table>
                    <div class="page-break"></div>
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 5%">ID</th>
                                <th style="width: 20%">Product Name</th>
                                <th style="width: 30%">Description</th>
                                <th style="width: 10%">Price</th>
                                <th style="width: 15%">Category</th>
                                <th style="width: 10%">Status</th>
                                <th style="width: 10%">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                @endif
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>This report was generated automatically from the Products Management System.</p>
        <p>© {{ date('Y') }} Your Company Name. All rights reserved.</p>
    </div>
</body>
</html>
