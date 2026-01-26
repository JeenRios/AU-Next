'use client';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = 'Something went wrong', onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center" role="alert">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Data</h3>
      <p className="text-red-600 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
      {icon && <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-[#1a1a1d] mb-2">{title}</h3>
      {description && <p className="text-gray-600 mb-6 max-w-sm mx-auto">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-gradient-to-r from-[#c9a227] to-[#f0d78c] hover:shadow-lg text-[#1a1a1d] font-semibold rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a227]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
