'use client';

import { useState } from 'react';
import type { ServiceType } from '@/types';

interface FormData {
  name: string;
  email: string;
  phone: string;
  equipmentBrand: string;
  serviceType: ServiceType;
  recipient: string;
  additionalDetails: string;
  marketingConsent: boolean;
}

export default function ServiceInquiry() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    equipmentBrand: '',
    serviceType: 'Simple Service',
    recipient: '',
    additionalDetails: '',
    marketingConsent: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/service-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            marketingConsent: formData.marketingConsent
          },
          serviceRequest: {
            equipmentBrand: formData.equipmentBrand,
            serviceType: formData.serviceType,
            recipient: formData.recipient,
            additionalDetails: formData.additionalDetails
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred while submitting the service request');
      }
      
      const data = await response.json();
      setTicketId(data.ticket.id);
      
      // Open the receipt PDF in a new tab
      const receiptUrl = `/api/receipt/generate?ticketId=${data.ticket.id}`;
      window.open(receiptUrl, '_blank');
      
      // Reset form and show success message
      setFormData({
        name: '',
        email: '',
        phone: '',
        equipmentBrand: '',
        serviceType: 'Simple Service',
        recipient: '',
        additionalDetails: '',
        marketingConsent: false
      });
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error submitting service inquiry:', err);
      setError(err.message || 'An error occurred while submitting your service inquiry.');
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = () => {
    setSuccess(false);
    setTicketId(null);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Service Inquiry</h1>
      
      {success ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Success!</p>
            <p>Your service request has been submitted successfully.</p>
          </div>
          
          <div className="mt-8 text-center">
            <div className="mb-6">
              <div className="inline-block p-4 bg-blue-50 rounded-full mb-2">
                <svg className="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Service Request Confirmation</h2>
              <p className="text-gray-600 mt-1">Ticket ID: {ticketId}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded mb-6 text-left">
              <h3 className="font-medium mb-2">What happens next?</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-2">
                <li>Our service team will review your request</li>
                <li>You'll receive a confirmation email with your service details</li>
                <li>We'll contact you if we need additional information</li>
                <li>Your bike service will be scheduled</li>
              </ol>
            </div>
            
            <button
              onClick={handleNewRequest}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Customer Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Bike Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="equipmentBrand" className="block text-sm font-medium text-gray-700 mb-1">
                      Equipment Brand *
                    </label>
                    <input
                      type="text"
                      id="equipmentBrand"
                      name="equipmentBrand"
                      required
                      value={formData.equipmentBrand}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Trek, Specialized, Giant"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type *
                    </label>
                    <select
                      id="serviceType"
                      name="serviceType"
                      required
                      value={formData.serviceType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Simple Service">Simple Service</option>
                      <option value="Full Service">Full Service</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                      Recipient *
                    </label>
                    <input
                      type="text"
                      id="recipient"
                      name="recipient"
                      required
                      value={formData.recipient}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Myself, Gift for John"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label htmlFor="additionalDetails" className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Details
                  </label>
                  <textarea
                    id="additionalDetails"
                    name="additionalDetails"
                    rows={4}
                    value={formData.additionalDetails}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Please describe any specific issues or requests"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="marketingConsent" className="ml-2 block text-sm text-gray-700">
                    I agree to receive marketing emails about promotions and news
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Submitting...' : 'Submit Service Request'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
} 