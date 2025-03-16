'use client';

import { useState } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  bikeModel: string;
  serviceDue: string;
  lastVisit: string;
  value: number;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([
    { id: '1', name: 'John Smith', email: 'john@example.com', phone: '555-123-4567', bikeModel: 'Trek Domane SL 6', serviceDue: '2025-05-15', lastVisit: '2024-11-15', value: 1250 },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '555-234-5678', bikeModel: 'Specialized Tarmac', serviceDue: '2025-04-10', lastVisit: '2024-10-10', value: 890 },
    { id: '3', name: 'Michael Brown', email: 'michael@example.com', phone: '555-345-6789', bikeModel: 'Canyon Ultimate', serviceDue: '2025-06-20', lastVisit: '2024-12-20', value: 1560 },
    { id: '4', name: 'Emma Wilson', email: 'emma@example.com', phone: '555-456-7890', bikeModel: 'Giant TCR Advanced', serviceDue: '2025-03-05', lastVisit: '2024-09-05', value: 720 },
    { id: '5', name: 'David Lee', email: 'david@example.com', phone: '555-567-8901', bikeModel: 'Cannondale SuperSix', serviceDue: '2025-04-30', lastVisit: '2024-10-30', value: 950 },
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  
  // Get current date for service due comparison
  const today = new Date();
  
  // Filter customers based on search term and filter
  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const matchesSearch = 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    // Status filter
    const serviceDueDate = new Date(customer.serviceDue);
    const diffTime = serviceDueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let matchesFilter = true;
    if (filter === 'service-due') {
      matchesFilter = diffDays <= 30 && diffDays > 0;
    } else if (filter === 'service-overdue') {
      matchesFilter = diffDays <= 0;
    } else if (filter === 'high-value') {
      matchesFilter = customer.value > 1000;
    }
    
    return matchesSearch && matchesFilter;
  });
  
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers..."
            className="border border-gray-300 rounded-md px-4 py-2 w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center">
          <select
            className="border border-gray-300 rounded-md px-4 py-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Customers</option>
            <option value="service-due">Service Due Soon</option>
            <option value="service-overdue">Service Overdue</option>
            <option value="high-value">High Value Customers</option>
          </select>
        </div>
        
        <div className="ml-auto">
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md">
            Add Customer
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bike Model</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Due</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCustomers.map((customer) => {
              // Calculate days until service is due
              const serviceDueDate = new Date(customer.serviceDue);
              const diffTime = serviceDueDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              
              // Determine service status styling
              let statusClass = 'bg-green-100 text-green-800';
              if (diffDays <= 0) {
                statusClass = 'bg-red-100 text-red-800';
              } else if (diffDays <= 30) {
                statusClass = 'bg-yellow-100 text-yellow-800';
              }
              
              return (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium">{customer.name}</td>
                  <td className="px-6 py-4">
                    <div>{customer.email}</div>
                    <div className="text-gray-500">{customer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.bikeModel}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
                      {customer.serviceDue}
                      {diffDays <= 0 && ' (Overdue)'}
                      {diffDays > 0 && diffDays <= 30 && ` (${diffDays} days)`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{customer.lastVisit}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${customer.value.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                    <button className="text-blue-600 hover:text-blue-900">Message</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Customer Insights</h2>
          <p className="text-gray-600">Total customers: {customers.length}</p>
          <p className="text-gray-600">Due for service: {customers.filter(c => {
            const serviceDueDate = new Date(c.serviceDue);
            const diffTime = serviceDueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 30 && diffDays > 0;
          }).length}</p>
          <p className="text-gray-600">Service overdue: {customers.filter(c => {
            const serviceDueDate = new Date(c.serviceDue);
            const diffTime = serviceDueDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays <= 0;
          }).length}</p>
        </div>
      </div>
    </div>
  );
} 