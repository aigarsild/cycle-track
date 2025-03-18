'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ServiceTicket, ServiceStatus } from '@/types';
import dynamic from 'next/dynamic';
import type { DropResult } from '@hello-pangea/dnd';
import { isSupabaseConfigured } from '@/lib/supabase';

// Add module declarations
// @ts-ignore - react-dnd is dynamically imported
import { DndProvider } from 'react-dnd';
// @ts-ignore - react-dnd-html5-backend is dynamically imported 
import { HTML5Backend } from 'react-dnd-html5-backend';
// @ts-ignore - component is imported without type checking
import TicketColumn from './components/TicketColumn';
import CommentSection from './components/CommentSection';

// Dynamically import dnd components with SSR disabled
const DragDropContext = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.DragDropContext),
  { ssr: false }
);
const Droppable = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.Droppable),
  { ssr: false }
);
const Draggable = dynamic(
  () => import('@hello-pangea/dnd').then(mod => mod.Draggable),
  { ssr: false }
);

type ColumnData = {
  id: ServiceStatus;
  title: string;
  tickets: ServiceTicket[];
};

type WorkshopStatus = 'todo' | 'in-progress' | 'waiting-for-parts' | 'done';
type ColumnId = WorkshopStatus;

type ColumnsState = {
  [key in ColumnId]: ColumnData;
};

export default function Workshop() {
  const [columns, setColumns] = useState<ColumnsState>({
    'todo': {
      id: 'todo',
      title: 'To Do',
      tickets: []
    },
    'in-progress': {
      id: 'in-progress',
      title: 'In Progress',
      tickets: []
    },
    'waiting-for-parts': {
      id: 'waiting-for-parts',
      title: 'Waiting for Parts',
      tickets: []
    },
    'done': {
      id: 'done',
      title: 'Done',
      tickets: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  // Add missing state for complete service form
  const [showCompleteServiceForm, setShowCompleteServiceForm] = useState(false);
  // Add mechanic state
  const [mechanics, setMechanics] = useState<Array<{id: string; name: string}>>([]);
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [loadingMechanics, setLoadingMechanics] = useState(false);
  // Add hydration tracking
  const [isClient, setIsClient] = useState(false);

  const fetchServiceTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/service-tickets');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch service tickets');
      }
      
      const data = await response.json();
      
      if (!data || !data.tickets || !Array.isArray(data.tickets)) {
        throw new Error('Invalid data format received from API');
      }
      
      const tickets = data.tickets as ServiceTicket[];
      
      // Group tickets by status, excluding archived ones
      const newColumns: ColumnsState = {
        'todo': {
          id: 'todo',
          title: columns.todo.title,
          tickets: tickets.filter(ticket => ticket.status === 'todo')
        },
        'in-progress': {
          id: 'in-progress',
          title: columns['in-progress'].title,
          tickets: tickets.filter(ticket => ticket.status === 'in-progress')
        },
        'waiting-for-parts': {
          id: 'waiting-for-parts',
          title: columns['waiting-for-parts'].title,
          tickets: tickets.filter(ticket => ticket.status === 'waiting-for-parts')
        },
        'done': {
          id: 'done',
          title: columns.done.title,
          tickets: tickets.filter(ticket => ticket.status === 'done')
        }
      };
      
      setColumns(newColumns);
    } catch (error) {
      console.error('Error fetching service tickets:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  }, [columns.todo.title, columns['in-progress'].title, columns['waiting-for-parts'].title, columns.done.title]);

  // Fetch mechanics when component mounts
  useEffect(() => {
    const fetchMechanics = async () => {
      if (!isSupabaseConfigured) return;
      
      setLoadingMechanics(true);
      try {
        const response = await fetch('/api/mechanics?active=true');
        const data = await response.json();
        
        if (data.success) {
          setMechanics(data.data || []);
        } else {
          console.error('Failed to fetch mechanics:', data.error);
        }
      } catch (error) {
        console.error('Error fetching mechanics:', error);
      } finally {
        setLoadingMechanics(false);
      }
    };
    
    fetchMechanics();
  }, [isClient]);

  useEffect(() => {
    setIsClient(true);
    fetchServiceTickets();
  }, [fetchServiceTickets]);

  // Extract the column IDs to stable variables for useCallback dependencies
  const todoColumnId = 'todo';
  const inProgressColumnId = 'in-progress';
  const waitingColumnId = 'waiting-for-parts';
  const doneColumnId = 'done';

  const handleMoveTicket = useCallback(async (ticketId: string, sourceStatus: ServiceStatus, destinationStatus: ServiceStatus) => {
    try {
      setError('');
      
      console.log(`Moving ticket ${ticketId} from ${sourceStatus} to ${destinationStatus}`);
      
      // Just update the status without trying to set archivedAt
      const updates: any = {
        status: destinationStatus,
      };
      
      // If moving to done status, set the completionDate timestamp
      if (destinationStatus === 'done') {
        updates.completionDate = new Date().toISOString();
      }

      // Add a status change comment
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} / ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const userName = "Admin"; // Replace with actual user name when available
      const actionMessage = `moved the card ${destinationStatus}`;
      const statusChangeComment = `${userName}|${actionMessage}|${formattedDate}`;
      
      // Add the comment to the updates
      updates.newComment = statusChangeComment;
      
      // If moving to archived, redirect to the archived page after successful update
      const isArchiving = destinationStatus === 'archived';
      
      const response = await fetch('/api/service-tickets/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          updates
        }),
      });
      
      if (!response.ok) {
        let errorMessage = 'Failed to update ticket status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If response isn't valid JSON, use the status text
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          console.error('Failed to parse error response as JSON:', jsonError);
        }
        throw new Error(errorMessage);
      }
      
      // If archiving was successful, redirect to archived page
      if (isArchiving && window.confirm('Ticket has been archived. Would you like to view archived tickets?')) {
        window.location.href = '/workshop/archived';
        return true;
      }
      
      // Return success to indicate the backend operation succeeded
      return true;
      
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      setError(err.message || 'Failed to update ticket status');
      return false;
    }
  }, []);  // No column dependencies needed here

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Get source and destination column IDs
    const sourceColId = source.droppableId as ColumnId;
    const destColId = destination.droppableId as ColumnId;
    
    // If moving within the same column, just reorder the tickets (no backend update needed)
    if (sourceColId === destColId) {
      const column = columns[sourceColId];
      const newTickets = Array.from(column.tickets);
      const movedTicket = newTickets[source.index];
      
      // Ensure ticket exists before moving
      if (!movedTicket) return;
      
      newTickets.splice(source.index, 1);
      newTickets.splice(destination.index, 0, movedTicket);
      
      setColumns({
        ...columns,
        [sourceColId]: {
          ...column,
          tickets: newTickets
        }
      });
      
      return;
    }
    
    // Moving from one column to another - get the ticket to move
    const sourceColumn = columns[sourceColId];
    const sourceTickets = Array.from(sourceColumn.tickets);
    
    // Get the ticket to move and verify it exists
    const ticketToMove = sourceTickets[source.index];
    if (!ticketToMove) {
      console.error('No ticket found at the source index:', source.index);
      return;
    }
    
    // Validate that draggableId matches the ticket ID
    if (draggableId !== ticketToMove.id) {
      console.error('Ticket ID mismatch:', { draggableId, ticketId: ticketToMove.id });
      return;
    }
    
    // Make a temporary optimistic UI update
    const tempTicketId = `temp-${Date.now()}`;
    const optimisticTicket = { 
      ...ticketToMove,
      id: tempTicketId, // Use a temporary ID for the optimistic update
      status: destColId 
    };
    
    // Create a copy of the columns for the optimistic update
    const optimisticColumns = { ...columns };
    
    // Remove the ticket from source column in our optimistic update
    optimisticColumns[sourceColId] = {
      ...sourceColumn,
      tickets: sourceTickets.filter(t => t.id !== ticketToMove.id)
    };
    
    // Add a temporary placeholder to the destination column
    optimisticColumns[destColId] = {
      ...optimisticColumns[destColId],
      tickets: [...optimisticColumns[destColId].tickets, optimisticTicket]
    };
    
    // Update UI with optimistic state
    setColumns(optimisticColumns);
    
    // Now make the actual API call
    const success = await handleMoveTicket(ticketToMove.id, sourceColId, destColId);
    
    if (success) {
      // The backend update succeeded, now update the UI with the real state
      // by doing a proper data fetch to ensure consistency
      fetchServiceTickets();
    } else {
      // The backend update failed, revert to previous state
      setColumns(columns);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !comment.trim()) return;
    
    try {
      setSubmittingComment(true);
      
      // Format the comment with author and timestamp
      const now = new Date();
      const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} / ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const userName = "Admin"; // Replace with actual user name when available
      const formattedComment = `${comment}|${userName}|${formattedDate}`;
      
      const response = await fetch('/api/service-tickets/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          comment: formattedComment
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      // Update local state
      if (selectedTicket.comments) {
        selectedTicket.comments.push(formattedComment);
      } else {
        selectedTicket.comments = [formattedComment];
      }
      
      // Clear comment input
      setComment('');
      
    } catch (error) {
      console.error('Error adding comment:', error);
      alert(error instanceof Error ? error.message : 'An error occurred adding the comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleTicketClick = (ticket: ServiceTicket) => {
    setSelectedTicket(ticket);
    setShowDetails(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format phone number
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  };

  // Don't render the DragDropContext until the component is hydrated on the client
  if (!isClient) {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Workshop</h1>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Loading...
          </button>
        </div>
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const handleUpdateStatus = () => {
    // Show a dialog to update the ticket status
    const newStatus = window.prompt('Update status to:', selectedTicket?.status);
    if (newStatus && ['todo', 'in-progress', 'waiting-for-parts', 'done'].includes(newStatus)) {
      // Fix type issue by ensuring non-empty values
      if (selectedTicket?.id) {
        handleMoveTicket(selectedTicket.id, selectedTicket.status, newStatus as ServiceStatus);
      }
      setSelectedTicket(null);
    }
  };

  const handleGenerateReceipt = (ticketId: string) => {
    // Get the ticket
    const ticket = Object.values(columns)
      .flatMap(column => column.tickets)
      .find(t => t.id === ticketId);
      
    if (ticket) {
      window.open(`/receipt-builder?ticketId=${ticket.id}`, '_blank');
    }
  };

  const handleCompleteService = () => {
    if (!selectedTicket || selectedTicket.status === 'done') return;
    
    // Update the ticket status to done with current timestamp
    const updates = {
      status: 'done' as ServiceStatus,
      completionDate: new Date().toISOString()
    };
    
    handleMoveTicket(selectedTicket.id, selectedTicket.status, 'done');
    
    // Show the receipt options or other UI as needed
    setShowCompleteServiceForm(true);
    setSelectedTicket(null);
  };

  // Add a function to assign a mechanic
  const handleAssignMechanic = async () => {
    if (!selectedTicket?.id || !selectedMechanic) return;
    
    try {
      const response = await fetch('/api/service-tickets/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId: selectedTicket.id,
          updates: {
            mechanic_id: selectedMechanic
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign mechanic');
      }
      
      // Update the selected ticket in state
      setSelectedTicket({
        ...selectedTicket,
        mechanic_id: selectedMechanic
      });
      
      // Refresh all tickets
      fetchServiceTickets();
      
    } catch (err: any) {
      console.error('Error assigning mechanic:', err);
      setError(err.message || 'Failed to assign mechanic');
    }
  };

  return (
    <div className="flex flex-col min-h-screen p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Workshop Management</h1>
        <a 
          href="/workshop/archived" 
          className="bg-pink text-white px-4 py-2 rounded-md hover:bg-pink-dark inline-flex items-center"
        >
          <span>View Archived Tickets</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </a>
      </div>

      <div className="flex-1 w-full">
        {isClient && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {Object.values(columns).map((column) => (
                <div key={column.id} className="col-span-1">
                  <TicketColumn
                    id={column.id}
                    title={column.title}
                    tickets={column.tickets}
                    onTicketClick={handleTicketClick}
                    onGenerateReceipt={handleGenerateReceipt}
                  />
                </div>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>

      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 bg-dark bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-1">
                <h2 className="text-2xl font-bold text-navy">{selectedTicket.equipmentBrand}</h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-dark hover:text-dark-light"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <p className="text-dark-light mb-6">Recipient: {selectedTicket.recipient}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Customer details - First column */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-dark">Customer details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Name:</span> {selectedTicket.customer.name}</p>
                    <p><span className="font-medium">Email:</span> {selectedTicket.customer.email}</p>
                    <p><span className="font-medium">Phone:</span> {formatPhone(selectedTicket.customer.phone)}</p>
                  </div>
                </div>
                
                {/* Service details - Second column */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-dark">Service details</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Equipment:</span> {selectedTicket.equipmentBrand}</p>
                    <p><span className="font-medium">Service type:</span> {selectedTicket.serviceType}</p>
                    <p><span className="font-medium">Created:</span> {formatDate(selectedTicket.createdAt)}</p>
                  </div>
                </div>
                
                {/* Action buttons - Third column */}
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-dark">Actions</h3>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        window.open(`/receipt-builder?ticketId=${selectedTicket.id}`, '_blank');
                      }}
                      className="bg-green text-white px-4 py-2 rounded-full hover:bg-green-dark w-full text-center"
                    >
                      Generate receipt
                    </button>
                    
                    <button
                      onClick={() => {
                        const receiptWindow = window.open(`/receipt-builder?ticketId=${selectedTicket.id}&mode=work`, '_blank');
                        
                        // Listen for messages from the receipt builder
                        window.addEventListener('message', function receiptMessageHandler(event) {
                          // Verify the message is from our domain
                          if (event.origin !== window.location.origin) return;
                          
                          // Check if this is a receipt submission message
                          if (event.data && event.data.type === 'work_receipt_submitted') {
                            const receiptData = event.data.receiptData;
                            
                            // Format the service details as a special comment
                            const now = new Date();
                            const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} / ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                            const userName = "Admin"; // Replace with actual user name when available
                            
                            // Format the data as JSON and add a tag to identify it as service details
                            const serviceDetailsJson = JSON.stringify(receiptData);
                            const formattedComment = `[service_details]${serviceDetailsJson}|${userName}|${formattedDate}`;
                            
                            // Add the comment via API
                            fetch('/api/service-tickets/comment', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                ticketId: selectedTicket.id,
                                comment: formattedComment
                              }),
                            }).then(response => {
                              if (response.ok) {
                                // Update local state with the new comment
                                if (selectedTicket.comments) {
                                  selectedTicket.comments.push(formattedComment);
                                  setSelectedTicket({...selectedTicket});
                                } else {
                                  const updatedTicket = {...selectedTicket, comments: [formattedComment]};
                                  setSelectedTicket(updatedTicket);
                                }
                              } else {
                                console.error('Failed to add service details comment');
                              }
                            }).catch(err => {
                              console.error('Error adding service details comment:', err);
                            });
                            
                            // Remove the event listener after handling the message
                            window.removeEventListener('message', receiptMessageHandler);
                          }
                        });
                      }}
                      className="bg-green text-white px-4 py-2 rounded-full hover:bg-green-dark w-full text-center"
                    >
                      Create a work receipt
                    </button>
                    
                    {selectedTicket.status === 'done' && (
                      <button
                        onClick={() => {
                          if (window.confirm('Archive this ticket? Archived tickets will be stored for record keeping.')) {
                            handleMoveTicket(selectedTicket.id, selectedTicket.status, 'archived');
                            setShowDetails(false);
                          }
                        }}
                        className="bg-yellow text-dark px-4 py-2 rounded-full hover:bg-yellow-dark w-full text-center"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Additional details */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4 text-dark">Additional details</h3>
                {selectedTicket.additionalDetails ? (
                  <p className="whitespace-pre-wrap">{selectedTicket.additionalDetails}</p>
                ) : (
                  <p className="text-dark-light">No additional details provided.</p>
                )}
              </div>
              
              {/* Divider */}
              <hr className="my-6 border-gray-200" />
              
              {/* Comments section */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-dark">Comments</h3>
                
                {/* Comment input */}
                <div className="flex items-center bg-gray-100 rounded-full mb-6 overflow-hidden pr-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="flex-1 py-3 px-4 bg-transparent border-none focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={submittingComment || !comment.trim()}
                    className={`text-dark font-medium px-4 py-1 rounded-full ${
                      submittingComment || !comment.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'
                    }`}
                  >
                    Add
                  </button>
                </div>
                
                {/* Comments list */}
                <div className="space-y-6">
                  {selectedTicket.comments && selectedTicket.comments.length > 0 ? (
                    selectedTicket.comments.map((comment, index) => {
                      // Check if it's a system message for status change
                      if (comment.includes('moved the card')) {
                        const [user, action, timestamp] = comment.split('|');
                        return (
                          <div key={index} className="text-dark-light">
                            <p>{user} {action}</p>
                            <p className="text-sm">{timestamp}</p>
                          </div>
                        );
                      }
                      
                      // Regular comment
                      const parts = comment.split('|');
                      const commentText = parts[0] || '';
                      const author = parts[1] || 'Unknown';
                      const timestamp = parts[2] || '';
                      
                      // Check if this is a service details comment (contains service_details tag)
                      if (commentText.includes('[service_details]')) {
                        try {
                          const serviceData = JSON.parse(commentText.replace('[service_details]', ''));
                          return (
                            <div key={index} className="space-y-4">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-navy">{author}</span>
                                <span className="text-dark-light text-sm">• {timestamp}</span>
                              </div>
                              <p className="text-dark mb-2">{author} finished the service</p>
                              
                              {/* Service details table */}
                              <div className="border-t border-b border-gray-200 py-4">
                                <h4 className="font-semibold mb-2">Service details</h4>
                                <div className="grid grid-cols-3 gap-2 mb-2 text-dark-light text-sm">
                                  <div>Product/service</div>
                                  <div>Service fee</div>
                                  <div>Product price</div>
                                </div>
                                
                                {serviceData.items.map((item: any, i: number) => (
                                  <div key={i} className="grid grid-cols-3 gap-2 py-2 border-t border-gray-100">
                                    <div>{item.name}</div>
                                    <div>{item.serviceFee} €</div>
                                    <div>{item.productPrice} €</div>
                                  </div>
                                ))}
                                
                                {/* Totals */}
                                <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-gray-200">
                                  <div className="text-right">Service all</div>
                                  <div>{serviceData.serviceFeeTotal} €</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div className="text-right">Product all</div>
                                  <div>{serviceData.productPriceTotal} €</div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 font-semibold">
                                  <div className="text-right">All together:</div>
                                  <div>{serviceData.total} €</div>
                                </div>
                              </div>
                              
                              {/* Notes from mechanic */}
                              {serviceData.notes && (
                                <div className="mt-2">
                                  <h4 className="font-semibold mb-1">Notes from mechanic:</h4>
                                  <p className="text-dark">{serviceData.notes}</p>
                                </div>
                              )}
                            </div>
                          );
                        } catch (e) {
                          console.error('Failed to parse service details', e);
                          return (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-navy">{author}</span>
                                <span className="text-dark-light text-sm">• {timestamp}</span>
                              </div>
                              <p className="text-dark">{commentText.replace('[service_details]', '')}</p>
                            </div>
                          );
                        }
                      }
                      
                      return (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-navy">{author}</span>
                            <span className="text-dark-light text-sm">• {timestamp}</span>
                          </div>
                          <p className="text-dark">{commentText}</p>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-dark-light">No comments yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 