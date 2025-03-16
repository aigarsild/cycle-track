'use client';

import { useState } from 'react';

interface CommentSectionProps {
  ticketId: string;
  initialComments: string[];
}

export default function CommentSection({ ticketId, initialComments = [] }: CommentSectionProps) {
  const [comments, setComments] = useState<string[]>(initialComments);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    
    try {
      const response = await fetch('/api/service-tickets/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketId,
          comment: comment.trim(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      // Update local comments state
      setComments([...comments, comment.trim()]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Comments</h3>
      
      <div className="max-h-40 overflow-y-auto mb-3">
        {comments.length > 0 ? (
          <div className="space-y-2">
            {comments.map((commentText, idx) => (
              <div key={idx} className="bg-gray-50 p-2 rounded border border-gray-200">
                <p className="text-sm">{commentText}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">No comments yet</p>
        )}
      </div>
      
      <div className="flex items-start space-x-2">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 min-h-[60px] p-2 border border-gray-300 rounded text-sm resize-none focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleAddComment}
          disabled={!comment.trim() || submittingComment}
          className={`px-3 py-2 bg-blue-500 text-white rounded-md ${
            !comment.trim() || submittingComment ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          {submittingComment ? 'Adding...' : 'Add'}
        </button>
      </div>
    </div>
  );
} 