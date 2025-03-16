export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import ReceiptBuilderContent from './ReceiptBuilderContent';

// Loading fallback component
function ReceiptBuilderLoading() {
  return <div className="p-4">Loading receipt builder...</div>;
}

// Main page component with Suspense boundary
export default function ReceiptBuilder() {
  return (
    <Suspense fallback={<ReceiptBuilderLoading />}>
      <ReceiptBuilderContent />
    </Suspense>
  );
} 