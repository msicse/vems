<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Electronics', 'Clothing', 'Books', 'Home & Garden',
            'Sports', 'Toys', 'Beauty', 'Automotive', 'Food', 'Health'
        ];

        $productNames = [
            'Wireless Headphones', 'Smart Watch', 'Laptop Stand', 'Coffee Mug',
            'Desk Lamp', 'Phone Case', 'Bluetooth Speaker', 'Notebook',
            'Water Bottle', 'Backpack', 'Keyboard', 'Mouse Pad',
            'Tablet', 'Camera', 'Sunglasses', 'Wallet', 'Shoes',
            'T-Shirt', 'Jeans', 'Jacket', 'Book', 'Pen', 'Pencil'
        ];

        return [
            'name' => fake()->randomElement($productNames) . ' ' . fake()->word(),
            'description' => fake()->sentence(rand(8, 15)),
            'price' => fake()->randomFloat(2, 9.99, 999.99),
            'category' => fake()->randomElement($categories),
            'status' => fake()->randomElement(['active', 'inactive', 'pending']),
        ];
    }
}
