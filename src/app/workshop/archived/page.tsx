'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ServiceTicket } from '@/types';
import TicketCard from '../components/TicketCard';
import Link from 'next/link';

export default function ArchivedTickets() {
  const [archivedTickets, setArchivedTickets] = useState<ServiceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Load archived tickets on page mount
  const fetchArchivedTickets = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/service-tickets?status=archived');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch archived tickets');
      }
      
      const data = await response.json();
      
      if (!data || !data.tickets || !Array.isArray(data.tickets)) {
        throw new Error('Invalid data format received from API');
      }
      
      setArchivedTickets(data.tickets);
    } catch (error) {
      console.error('Error fetching archived tickets:', error);
      setError(error instanceof Error ? error.message : 'Failed to load archived tickets');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    setIsClient(true);
    fetchArchivedTickets();
  }, [fetchArchivedTickets]);
  
  const handleTicketClick = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };
  
  const handleGenerateReceipt = (ticketId: string) => {
    const ticket = archivedTickets.find(t => t.id === ticketId);
    
    if (ticket) {
      window.open(`/receipt-builder?ticketId=${ticket.id}`, '_blank');
    }
  };
  
  if (!isClient) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Archived Tickets</h1>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Archived Tickets</h1>
        <Link 
          href="/workshop" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span>Back to Workshop</span>
        </Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      ) : archivedTickets.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <p className="text-gray-600 mb-4">No archived tickets found.</p>
          <Link 
            href="/workshop" 
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Return to Workshop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {archivedTickets.map(ticket => (
            <div key={ticket.id}>
              <TicketCard
                ticket={ticket}
                onClick={handleTicketClick}
                onGenerateReceipt={handleGenerateReceipt}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Ticket Details Modal - similar to the one in workshop page */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Archived Ticket #{selectedTicket.id}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Customer Details</h3>
                  <p><span className="font-medium">Name:</span> {selectedTicket.customer.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedTicket.customer.email}</p>
                  <p><span className="font-medium">Phone:</span> {selectedTicket.customer.phone}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Service Details</h3>
                  <p><span className="font-medium">Equipment:</span> {selectedTicket.equipmentBrand}</p>
                  <p><span className="font-medium">Service Type:</span> {selectedTicket.serviceType}</p>
                  <p><span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                  {selectedTicket.completionDate && (
                    <p><span className="font-medium">Completed:</span> {new Date(selectedTicket.completionDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              {selectedTicket.additionalDetails && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                  <p className="whitespace-pre-wrap">{selectedTicket.additionalDetails}</p>
                </div>
              )}
              
              {selectedTicket.comments && selectedTicket.comments.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Comments</h3>
                  <div className="space-y-2">
                    {selectedTicket.comments.map((comment, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-md">
                        {comment}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => {
                    // Generate and open a receipt
                    window.open(`/receipt-builder?ticketId=${selectedTicket.id}`, '_blank');
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Generate Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 