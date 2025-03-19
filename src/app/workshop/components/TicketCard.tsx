import React from 'react';
import { formatDistance } from 'date-fns';
import type { ServiceTicket } from '@/types';

interface TicketCardProps {
  ticket: ServiceTicket;
  onClick: (ticket: ServiceTicket) => void;
  onGenerateReceipt: (ticketId: string) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ 
  ticket, 
  onClick, 
  onGenerateReceipt 
}) => {
  // Calculate days since arrival and determine color class
  const getDaysInfo = () => {
    const creationDate = new Date(ticket.createdAt);
    const today = new Date();
    
    // Calculate the exact difference in days
    const diffInMs = today.getTime() - creationDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    // Use date-fns to get a human-readable time distance
    const timeDistance = formatDistance(creationDate, today, { addSuffix: false });
    
    // Determine color class based on number of days
    let colorClass = 'bg-yellow-light bg-opacity-20 text-yellow-dark'; // Default (< 4 days)
    
    if (diffInDays >= 7) {
      colorClass = 'bg-pink-light bg-opacity-20 text-pink-dark'; // Red for 7+ days
    } else if (diffInDays >= 4) {
      colorClass = 'bg-yellow bg-opacity-30 text-yellow-dark'; // Orange for 4-6 days
    }
    
    return {
      text: timeDistance,
      colorClass: colorClass
    };
  };

  // Format phone number with spaces
  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
  };

  // Get days info
  const daysInfo = getDaysInfo();

  return (
    <div 
      className="bg-white rounded-lg shadow-sm p-4 mb-3 cursor-pointer hover:shadow-md transition-all border border-blue-100 hover:border-blue-200"
      onClick={() => onClick(ticket)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-bold text-navy">{ticket.equipmentBrand}</h3>
        <span className={`${daysInfo.colorClass} text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap`}>
          {daysInfo.text}
        </span>
      </div>
      
      <div className="mb-2">
        <p className="text-dark">Customer: {ticket.customer.name}</p>
        <p className="text-dark">Tel: {formatPhone(ticket.customer.phone)}</p>
      </div>
      
      <div className="flex justify-between items-center mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onGenerateReceipt(ticket.id);
          }}
          className="bg-green bg-opacity-20 text-green-dark hover:bg-green-light hover:bg-opacity-30 px-3 py-1 rounded-full text-sm font-medium"
        >
          Receipt
        </button>
        
        <div className="flex items-center gap-2">
          {(ticket.comments && ticket.comments.length > 0) && (
            <span className="text-blue text-sm">
              {ticket.comments.length} comment{ticket.comments.length !== 1 ? 's' : ''}
            </span>
          )}
          <span className="text-dark-light text-sm">
            Date: {new Date(ticket.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TicketCard; 