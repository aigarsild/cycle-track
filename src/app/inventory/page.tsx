'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  supplier: string;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Chain Lube', category: 'Maintenance', price: 12.99, stock: 25, supplier: 'BikeSupplies Co.' },
    { id: '2', name: 'Brake Pads', category: 'Parts', price: 24.99, stock: 15, supplier: 'BrakeMaster Inc.' },
    { id: '3', name: 'Road Tires', category: 'Tires', price: 49.99, stock: 8, supplier: 'TireWorld' },
    { id: '4', name: 'Mountain Bike Tires', category: 'Tires', price: 59.99, stock: 6, supplier: 'TireWorld' },
    { id: '5', name: 'Bike Computer', category: 'Accessories', price: 129.99, stock: 4, supplier: 'TechCycle Inc.' },
    { id: '6', name: 'Multi-Tool', category: 'Tools', price: 34.99, stock: 12, supplier: 'BikeSupplies Co.' },
    { id: '7', name: 'Front Light', category: 'Accessories', price: 39.99, stock: 9, supplier: 'LumiCycle' },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  
  // Filter products based on search term and low stock filter
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLowStock = showLowStock ? product.stock < 10 : true;
    return matchesSearch && matchesLowStock;
  });
  
  // Calculate total inventory value
  const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Inventory Management</h1>
      
      <div className="flex flex-col md:flex-row justify-between mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 md:mb-0">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="lowStockFilter"
              className="mr-2"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
            />
            <label htmlFor="lowStockFilter">Show Low Stock Items</label>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-sm text-gray-600 mb-1">Total Inventory Value</h2>
          <p className="text-xl font-bold text-green-600">${totalValue.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supplier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    product.stock < 5 ? 'bg-red-100 text-red-800' : 
                    product.stock < 10 ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{product.supplier}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                  <button className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
        <p className="text-gray-500">This functionality would allow adding new products to inventory.</p>
        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
          Add Product
        </button>
      </div>
    </div>
  );
} 