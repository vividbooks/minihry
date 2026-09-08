import React from 'react';

export function SimpleLoader({ message = "Načítám..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-lg text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}

export function ErrorFallback({ message = "Něco se pokazilo", onRetry }: { 
  message?: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center p-8">
        <div className="text-6xl mb-4">😅</div>
        <h2 className="text-xl font-medium text-gray-800 mb-4">{message}</h2>
        <p className="text-gray-600 mb-6">
          Zkuste obnovit stránku nebo se vraťte zpět.
        </p>
        <div className="flex gap-4 justify-center">
          {onRetry && (
            <button 
              onClick={onRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Zkusit znovu
            </button>
          )}
          <button 
            onClick={() => window.location.reload()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Obnovit stránku
          </button>
        </div>
      </div>
    </div>
  );
}