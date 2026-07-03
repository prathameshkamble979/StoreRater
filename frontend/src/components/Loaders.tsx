export const Spinner = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="animate-pulse bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <div className="h-3 bg-gray-200 rounded w-24"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {Array.from({ length: rows }).map((_, rIndex) => (
            <tr key={rIndex}>
              {Array.from({ length: cols }).map((_, cIndex) => (
                <td key={cIndex} className="px-6 py-4">
                  <div className="h-3 bg-gray-200 rounded w-full max-w-[150px]"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export const CardSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 animate-pulse flex flex-col h-48">
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6 mb-auto"></div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
