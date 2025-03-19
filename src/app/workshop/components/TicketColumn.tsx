import React from 'react';
import type { ServiceTicket } from '@/types';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';

interface TicketColumnProps {
  id: string;
  title: string;
  tickets: ServiceTicket[];
  onTicketClick: (ticket: ServiceTicket) => void;
  onGenerateReceipt: (ticketId: string) => void;
}

const TicketColumn: React.FC<TicketColumnProps> = ({
  id,
  title,
  tickets,
  onTicketClick,
  onGenerateReceipt
}) => {
  return (
    <div className="flex flex-col bg-white rounded-md p-3 flex-1 min-w-[280px] max-h-[calc(100vh-180px)] shadow-sm">
      <h2 className="text-base font-medium mb-3 px-1 text-blue-light tracking-wide">{title}</h2>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto min-h-[150px] ${
              snapshot.isDraggingOver ? 'bg-green-light bg-opacity-20' : ''
            }`}
          >
            {tickets.length === 0 ? (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-blue border-opacity-30 rounded-lg p-4">
                <p className="text-blue-dark text-center">Drop a ticket here</p>
              </div>
            ) : (
              tickets.map((ticket, index) => (
                <Draggable
                  key={ticket.id}
                  draggableId={ticket.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TicketCard
                        ticket={ticket}
                        onClick={onTicketClick}
                        onGenerateReceipt={onGenerateReceipt}
                      />
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
  );
};

export default TicketColumn; 