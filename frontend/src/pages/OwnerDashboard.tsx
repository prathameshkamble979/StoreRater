import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton } from '../components/Loaders';
import { DashboardLayout } from '../components/DashboardLayout';

interface Rating {
  rating: number;
  userName: string;
  userEmail: string;
  date: string;
}

interface OwnerDashboardData {
  storeName: string;
  averageRating: string;
  totalRatings: number;
  ratings: Rating[];
}

export const OwnerDashboard = () => {
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchDashboard();
  }, [sortBy, sortOrder]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get(`/owner/dashboard?sortBy=${sortBy}&sortOrder=${sortOrder}`);
      setData(res.data);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8"><TableSkeleton cols={3} rows={5} /></div>;

  if (error || !data) return (
    <DashboardLayout title="Owner Dashboard" description="Manage your store ratings">
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">{error || 'Data unavailable'}</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout
      title="Owner Dashboard"
      description={`Manage and view ratings for ${data.storeName}`}
    >
      <div className="space-y-6">
        {/* Metric Card */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Average Rating</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                {Number(data.averageRating).toFixed(1)}
              </span>
              <span className="text-sm font-medium text-gray-500">out of 5</span>
            </div>
          </div>
          <div className="flex flex-col md:items-end">
            <span className="text-sm font-medium text-gray-500">Total Ratings</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{data.totalRatings}</span>
          </div>
        </div>

        {/* Ratings List */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-b border-gray-200 gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Ratings</h2>
            <select 
              className="w-full sm:w-auto p-2 text-sm border border-gray-300 rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="rating-desc">Highest Rated</option>
              <option value="rating-asc">Lowest Rated</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {data.ratings.map((r, i) => (
                  <tr key={`${r.userName}-${i}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{r.userName}</div>
                      <div className="text-sm text-gray-500">{r.userEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-yellow-500 text-lg tracking-widest">
                      {'★'.repeat(r.rating)}<span className="text-gray-200">{'★'.repeat(5 - r.rating)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {new Date(r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!loading && data.ratings.length === 0 && (
              <div className="py-12 text-center text-gray-500 bg-white">
                <p className="font-medium text-gray-900 mb-1">No ratings yet</p>
                <p className="text-sm">When users rate your store, they will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
