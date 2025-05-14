import React from 'react';

interface CompletionMessageProps {
  show: boolean;
}

export const CompletionMessage: React.FC<CompletionMessageProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-500 text-white p-4 text-center shadow-lg">
      All tasks have been completed! 🎉
    </div>
  );
};
