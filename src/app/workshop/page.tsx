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

type ColumnId = ServiceStatus;

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
    },
    'archived': {
      id: 'archived',
      title: 'Archived',
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
      
      // Group tickets by status
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
        },
        'archived': {
          id: 'archived',
          title: 'Archived',
          tickets: tickets.filter(ticket => ticket.status === 'archived')
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
  }, [isClient, isSupabaseConfigured]);

  useEffect(() => {
    setIsClient(true);
    fetchServiceTickets();
  }, [fetchServiceTickets]);

  const handleMoveTicket = async (ticketId: string, sourceStatus: ServiceStatus, destinationStatus: ServiceStatus) => {
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
      
      // Return success to indicate the backend operation succeeded
      return true;
      
    } catch (err: any) {
      console.error('Error updating ticket status:', err);
      setError(err.message || 'Failed to update ticket status');
      return false;
    }
  };

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
      
      // Add the comment to the ticket
      const updatedComments = selectedTicket.comments ? 
        [...selectedTicket.comments, comment] : 
        [comment];
      
      // Update in the backend
      const response = await fetch('/api/service-tickets', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedTicket.id,
          comments: updatedComments
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add comment');
      }
      
      // Update locally
      const updatedTicket = {
        ...selectedTicket,
        comments: updatedComments
      };
      setSelectedTicket(updatedTicket);
      
      // Update in the column state
      const columnId = selectedTicket.status as ColumnId;
      const newColumns = { ...columns };
      const ticketIndex = newColumns[columnId].tickets.findIndex(t => t.id === selectedTicket.id);
      
      if (ticketIndex !== -1) {
        newColumns[columnId].tickets[ticketIndex] = updatedTicket;
        setColumns(newColumns);
      }
      
      // Clear the comment field
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
    setComment('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPhone = (phone: string) => {
    // Simple format for display
    return phone;
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

  const handleGenerateReceipt = () => {
    if (!selectedTicket) return;
    
    // Generate and open a simple receipt
    const receiptUrl = `/api/receipt/generate?ticketId=${selectedTicket.id}`;
    window.open(receiptUrl, '_blank');
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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Workshop</h1>
        <div className="flex items-center gap-2">
          {!isSupabaseConfigured() && (
            <div className="text-amber-600 text-sm mr-2">
              <span className="font-medium">Using demo data</span>
            </div>
          )}
          <button 
            onClick={fetchServiceTickets}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          {error}
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.values(columns).map(column => (
              <div key={column.id} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="font-semibold text-lg">
                    {column.title}
                  </h2>
                  <span className="bg-gray-200 text-gray-800 text-xs font-medium rounded-full px-2.5 py-0.5">
                    {column.tickets.length}
                  </span>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                    >
                      {column.tickets.length === 0 ? (
                        <div className="flex items-center justify-center h-24 border border-dashed border-gray-300 rounded-md">
                          <p className="text-gray-400 text-sm">No tickets</p>
                        </div>
                      ) : (
                        column.tickets.map((ticket, index) => (
                          <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                            {(provided, snapshot) => (
                              <div 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-gray-50 p-3 rounded mb-2 border ${
                                  snapshot.isDragging 
                                    ? 'border-blue-400 shadow-lg' 
                                    : 'border-gray-200'
                                } hover:bg-gray-100 cursor-grab active:cursor-grabbing`}
                                onClick={() => handleTicketClick(ticket)}
                              >
                                <div className="text-sm font-medium mb-1">
                                  {ticket.serviceType} - {ticket.equipmentBrand}
                                </div>
                                <div className="text-xs text-gray-500 mb-1">
                                  <div className="flex justify-between">
                                    <div>Customer: {ticket.customer?.name || 'Unknown'}</div>
                                    <div>{ticket.customer?.phone || 'No phone'}</div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mb-1">
                                  Date: {formatDate(ticket.createdAt)}
                                </div>
                                {ticket.comments && ticket.comments.length > 0 && (
                                  <div className="text-xs text-blue-600 mt-1">
                                    {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}
                                  </div>
                                )}
                                <div className="flex flex-wrap mt-2 gap-1">
                                  {/* Receipt button for all tickets */}
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const receiptUrl = `/api/receipt/generate?ticketId=${ticket.id}`;
                                      window.open(receiptUrl, '_blank');
                                    }}
                                    className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded flex items-center"
                                    title="Generate Receipt"
                                  >
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    Receipt
                                  </button>
                                  
                                  {column.id !== 'todo' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveTicket(ticket.id, column.id, 'todo');
                                      }}
                                      className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded"
                                    >
                                      ← To Do
                                    </button>
                                  )}
                                  {column.id !== 'in-progress' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveTicket(ticket.id, column.id, 'in-progress');
                                      }}
                                      className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                                    >
                                      In Progress
                                    </button>
                                  )}
                                  {column.id !== 'waiting-for-parts' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveTicket(ticket.id, column.id, 'waiting-for-parts');
                                      }}
                                      className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-2 py-1 rounded"
                                    >
                                      Waiting
                                    </button>
                                  )}
                                  {column.id !== 'done' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMoveTicket(ticket.id, column.id, 'done');
                                      }}
                                      className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded"
                                    >
                                      Done
                                    </button>
                                  )}
                                  {column.id === 'done' && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Archive this ticket? Archived tickets will be stored for record keeping.')) {
                                          handleMoveTicket(ticket.id, column.id, 'archived');
                                        }
                                      }}
                                      className="text-xs bg-purple-100 hover:bg-purple-200 text-purple-700 px-2 py-1 rounded"
                                    >
                                      Archive
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
      
      {/* Ticket Details Modal */}
      {showDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">Ticket #{selectedTicket.id}</h2>
                <button
                  onClick={() => {
                    // Debug log receipt information
                    console.log('Receipt data:', selectedTicket.receipt);
                    setShowDetails(false);
                  }}
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
                  <p><span className="font-medium">Status:</span> {selectedTicket.status}</p>
                  <p><span className="font-medium">Created:</span> {new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                  {selectedTicket.completionDate && (
                    <p><span className="font-medium">Completed:</span> {new Date(selectedTicket.completionDate).toLocaleDateString()}</p>
                  )}
                  {!selectedTicket.completionDate && selectedTicket.status === 'done' && (
                    <p><span className="font-medium">Completed:</span> {new Date(selectedTicket.updatedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
              
              {selectedTicket.additionalDetails && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Additional Details</h3>
                  <p className="whitespace-pre-wrap">{selectedTicket.additionalDetails}</p>
                </div>
              )}
              
              <CommentSection 
                ticketId={selectedTicket.id} 
                initialComments={selectedTicket.comments || []} 
              />

              {/* Receipt information section - only show if receipt exists */}
              {selectedTicket.receipt && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">Receipt Information</h3>
                  
                  {selectedTicket.receipt && selectedTicket.receipt.items && selectedTicket.receipt.items.length > 0 ? (
                    <>
                      <p><span className="font-medium">Total Amount:</span> ${selectedTicket.receipt.totalAmount?.toFixed(2)}</p>
                      <p><span className="font-medium">Generated:</span> {selectedTicket.receipt.generatedAt && new Date(selectedTicket.receipt.generatedAt).toLocaleString()}</p>
                      
                      <div className="flex gap-2 mt-3">
                        {selectedTicket.receipt.pdfUrl && (
                          <a 
                            href={selectedTicket.receipt.pdfUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-md hover:bg-blue-200"
                          >
                            View Receipt PDF
                          </a>
                        )}
                        
                        <button
                          onClick={() => {
                            // Build URL with all the ticket information for regenerating the receipt
                            const url = `/receipt-builder?ticketId=${selectedTicket.id}&customerName=${encodeURIComponent(selectedTicket.customer.name)}&customerEmail=${encodeURIComponent(selectedTicket.customer.email)}&customerPhone=${encodeURIComponent(selectedTicket.customer.phone)}&equipmentBrand=${encodeURIComponent(selectedTicket.equipmentBrand)}&serviceType=${encodeURIComponent(selectedTicket.serviceType)}`;
                            window.location.href = url;
                          }}
                          className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md hover:bg-indigo-200"
                        >
                          Regenerate Receipt
                        </button>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Items:</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="py-2 text-left">Item</th>
                                <th className="py-2 text-right">Qty</th>
                                <th className="py-2 text-right">Price</th>
                                <th className="py-2 text-right">Fee</th>
                                <th className="py-2 text-right">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTicket.receipt.items.map((item, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{item.name}</td>
                                  <td className="py-2 text-right">{item.quantity}</td>
                                  <td className="py-2 text-right">${item.price.toFixed(2)}</td>
                                  <td className="py-2 text-right">${item.serviceFee.toFixed(2)}</td>
                                  <td className="py-2 text-right">${((item.price * item.quantity) + (item.serviceFee * item.quantity)).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                        <p className="text-yellow-700">
                          Receipt data exists but is incomplete or in an unexpected format. See details below.
                        </p>
                      </div>
                      <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-48">
                        <pre className="text-xs">
                          {JSON.stringify(selectedTicket.receipt, null, 2)}
                        </pre>
                      </div>
                      <div className="mt-4">
                        <button
                          onClick={() => {
                            // Build URL with all the ticket information for regenerating the receipt
                            const url = `/receipt-builder?ticketId=${selectedTicket.id}&customerName=${encodeURIComponent(selectedTicket.customer.name)}&customerEmail=${encodeURIComponent(selectedTicket.customer.email)}&customerPhone=${encodeURIComponent(selectedTicket.customer.phone)}&equipmentBrand=${encodeURIComponent(selectedTicket.equipmentBrand)}&serviceType=${encodeURIComponent(selectedTicket.serviceType)}`;
                            window.location.href = url;
                          }}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                        >
                          Create New Receipt
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex flex-wrap gap-2">
                {/* Status update button */}
                <button
                  onClick={() => {
                    // Show a dialog to update the ticket status
                    const newStatus = window.prompt('Update status to:', selectedTicket.status);
                    if (newStatus && ['todo', 'in-progress', 'waiting-for-parts', 'done'].includes(newStatus)) {
                      handleMoveTicket(selectedTicket.id, selectedTicket.status, newStatus as ServiceStatus);
                      setShowDetails(false);
                    }
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Update Status
                </button>
                
                {/* Archive button - only show for completed tickets */}
                {selectedTicket.status === 'done' && (
                  <button
                    onClick={() => {
                      if (window.confirm('Archive this ticket? Archived tickets will be stored for record keeping.')) {
                        handleMoveTicket(selectedTicket.id, selectedTicket.status, 'archived');
                        setShowDetails(false);
                      }
                    }}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  >
                    Archive Ticket
                  </button>
                )}
                
                {/* Generate receipt button - available for all tickets */}
                <button
                  onClick={() => {
                    // Generate and open a simple receipt
                    const receiptUrl = `/api/receipt/generate?ticketId=${selectedTicket.id}`;
                    window.open(receiptUrl, '_blank');
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Generate Receipt
                </button>
                
                <button
                  onClick={() => {
                    // Build URL with all the ticket information
                    const url = `/receipt-builder?ticketId=${selectedTicket.id}&customerName=${encodeURIComponent(selectedTicket.customer.name)}&customerEmail=${encodeURIComponent(selectedTicket.customer.email)}&customerPhone=${encodeURIComponent(selectedTicket.customer.phone)}&equipmentBrand=${encodeURIComponent(selectedTicket.equipmentBrand)}&serviceType=${encodeURIComponent(selectedTicket.serviceType)}`;
                    
                    // Open in the same window
                    window.location.href = url;
                  }}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
                  Build Custom Receipt
                </button>
                
                {/* Complete service button - only enabled for non-completed tickets */}
                <button
                  onClick={() => {
                    if (selectedTicket.status !== 'done') {
                      // Update the ticket status to done
                      handleMoveTicket(selectedTicket.id, selectedTicket.status, 'done');
                      setShowDetails(false);
                    }
                  }}
                  className={`px-4 py-2 rounded-md ${
                    selectedTicket.status === 'done'
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-yellow-600 text-white hover:bg-yellow-700'
                  }`}
                  disabled={selectedTicket.status === 'done'}
                >
                  Complete Service
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-medium">Ticket Details</h3>
                <div className="mt-2 space-y-2">
                  <p><span className="font-medium">Customer:</span> {selectedTicket.customer.name}</p>
                  <p><span className="font-medium">Phone:</span> {selectedTicket.customer.phone}</p>
                  <p><span className="font-medium">Equipment:</span> {selectedTicket.equipmentBrand}</p>
                  <p><span className="font-medium">Service Type:</span> {selectedTicket.serviceType}</p>
                  <p><span className="font-medium">Status:</span> {selectedTicket.status}</p>
                  <p><span className="font-medium">Created:</span> {formatDate(selectedTicket.createdAt)}</p>
                  {selectedTicket.completionDate && (
                    <p><span className="font-medium">Completed:</span> {new Date(selectedTicket.completionDate).toLocaleDateString()}</p>
                  )}
                  {!selectedTicket.completionDate && selectedTicket.status === 'done' && (
                    <p><span className="font-medium">Completed:</span> {new Date(selectedTicket.updatedAt).toLocaleDateString()}</p>
                  )}
                  
                  {/* Mechanic assignment section */}
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-2">Assigned Mechanic</h4>
                    <div className="flex items-end gap-2">
                      <div className="flex-grow">
                        <select
                          className="w-full px-3 py-2 border rounded-md"
                          value={selectedMechanic || selectedTicket.mechanic_id || ''}
                          onChange={(e) => setSelectedMechanic(e.target.value)}
                          disabled={loadingMechanics}
                        >
                          <option value="">-- Unassigned --</option>
                          {mechanics.map(mech => (
                            <option key={mech.id} value={mech.id}>
                              {mech.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={handleAssignMechanic}
                        disabled={!selectedMechanic || selectedMechanic === selectedTicket.mechanic_id}
                        className={`px-4 py-2 rounded-md ${
                          !selectedMechanic || selectedMechanic === selectedTicket.mechanic_id
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        Assign
                      </button>
                    </div>
                    {selectedTicket.mechanic_id && (
                      <p className="text-sm text-gray-700 mt-1">
                        Current mechanic: {mechanics.find(m => m.id === selectedTicket.mechanic_id)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 