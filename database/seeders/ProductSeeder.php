<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create some sample products with realistic data
        $products = [
            [
                'name' => 'MacBook Pro 16"',
                'description' => 'Apple MacBook Pro 16-inch with M2 Pro chip, 16GB RAM, and 512GB SSD. Perfect for professional work and creative tasks.',
                'price' => 2499.00,
                'category' => 'Electronics',
                'status' => 'active'
            ],
            [
                'name' => 'Wireless Noise-Cancelling Headphones',
                'description' => 'Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.',
                'price' => 299.99,
                'category' => 'Electronics',
                'status' => 'active'
            ],
            [
                'name' => 'Ergonomic Office Chair',
                'description' => 'High-quality ergonomic office chair with lumbar support, adjustable height, and breathable mesh back.',
                'price' => 449.00,
                'category' => 'Furniture',
                'status' => 'active'
            ],
            [
                'name' => 'Organic Cotton T-Shirt',
                'description' => 'Comfortable organic cotton t-shirt available in multiple colors. Sustainably sourced and ethically made.',
                'price' => 29.99,
                'category' => 'Clothing',
                'status' => 'active'
            ],
            [
                'name' => 'Smart Fitness Watch',
                'description' => 'Advanced fitness tracking watch with heart rate monitoring, GPS, and 7-day battery life.',
                'price' => 199.99,
                'category' => 'Electronics',
                'status' => 'pending'
            ],
            [
                'name' => 'Stainless Steel Water Bottle',
                'description' => 'Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
                'price' => 34.95,
                'category' => 'Home & Garden',
                'status' => 'active'
            ],
            [
                'name' => 'Yoga Mat Premium',
                'description' => 'Non-slip yoga mat made from eco-friendly materials. Perfect for yoga, pilates, and general fitness.',
                'price' => 79.99,
                'category' => 'Sports',
                'status' => 'active'
            ],
            [
                'name' => 'Bluetooth Portable Speaker',
                'description' => 'Compact waterproof Bluetooth speaker with 360-degree sound and 12-hour battery life.',
                'price' => 89.99,
                'category' => 'Electronics',
                'status' => 'inactive'
            ],
            [
                'name' => 'Ceramic Coffee Mug Set',
                'description' => 'Set of 4 handcrafted ceramic coffee mugs with unique glazed finish. Microwave and dishwasher safe.',
                'price' => 49.99,
                'category' => 'Home & Garden',
                'status' => 'active'
            ],
            [
                'name' => 'LED Desk Lamp',
                'description' => 'Adjustable LED desk lamp with touch controls, multiple brightness levels, and USB charging port.',
                'price' => 69.99,
                'category' => 'Electronics',
                'status' => 'active'
            ],
            [
                'name' => 'Running Shoes',
                'description' => 'Lightweight running shoes with responsive cushioning and breathable mesh upper. Available in multiple sizes.',
                'price' => 129.99,
                'category' => 'Sports',
                'status' => 'active'
            ],
            [
                'name' => 'Wireless Charging Pad',
                'description' => 'Fast wireless charging pad compatible with all Qi-enabled devices. Includes LED indicator and non-slip base.',
                'price' => 39.99,
                'category' => 'Electronics',
                'status' => 'pending'
            ],
            [
                'name' => 'Bamboo Cutting Board',
                'description' => 'Sustainable bamboo cutting board with juice groove and non-slip feet. Easy to clean and maintain.',
                'price' => 24.99,
                'category' => 'Home & Garden',
                'status' => 'active'
            ],
            [
                'name' => 'Leather Wallet',
                'description' => 'Genuine leather bifold wallet with RFID blocking technology. Multiple card slots and bill compartment.',
                'price' => 59.99,
                'category' => 'Accessories',
                'status' => 'active'
            ],
            [
                'name' => 'Plant-Based Protein Powder',
                'description' => 'Organic plant-based protein powder with 25g protein per serving. Available in vanilla and chocolate flavors.',
                'price' => 44.99,
                'category' => 'Health',
                'status' => 'active'
            ]
        ];

        foreach ($products as $product) {
            Product::create($product);
        }

        // Create additional random products using the factory
        Product::factory(35)->create();
    }
}
