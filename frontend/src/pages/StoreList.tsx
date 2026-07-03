import React, { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton } from '../components/Loaders';
import { DashboardLayout } from '../components/DashboardLayout';
import { useDebounce } from '../hooks/useDebounce';

interface Store {
  id: string;
  name: string;
  address: string;
  averageRating: string;
  totalRatings: number;
  userRating?: number | null;
}

export const StoreList = () => {
  const { user, logout } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  
  // Debounce the search input to avoid spamming the API
  const debouncedSearch = useDebounce(search, 500);

  // Rating Modal State
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [ratingMsg, setRatingMsg] = useState('');

  useEffect(() => {
    fetchStores();
  }, [debouncedSearch, sortBy, sortOrder]);

  const fetchStores = async () => {
    try {
      const res = await api.get(`/stores?search=${debouncedSearch}&sortBy=${sortBy}&sortOrder=${sortOrder}`);
      setStores(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!selectedStore || rating === 0) return;
    try {
      await api.post(`/stores/${selectedStore.id}/ratings`, { rating });
      setRatingMsg('Rating submitted successfully!');
      fetchStores(); // Refresh store list ratings
      setTimeout(() => {
        setSelectedStore(null);
        setRatingMsg('');
        setRating(0);
      }, 2000);
    } catch (e: any) {
      setRatingMsg(e.response?.data?.message || 'Failed to submit rating');
    }
  };

  return (
    <DashboardLayout
      title="Store Directory"
      description="Browse and rate your favorite stores."
      actions={
        <input 
          type="text" 
          placeholder="Search stores by name or address..." 
          className="w-full sm:w-80 p-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      }
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500">
            {stores.length} store{stores.length !== 1 ? 's' : ''} found
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 font-medium">Sort by:</span>
            <select 
              className="text-sm border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 border bg-white p-1.5"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order);
              }}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="averageRating-desc">Highest Rated</option>
              <option value="averageRating-asc">Lowest Rated</option>
            </select>
          </div>
        </div>

        {/* Store Grid */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map(store => (
              <div key={store.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col group">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{store.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{store.address}</p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-400 text-lg leading-none">★</span>
                    <span className="font-bold text-gray-900 leading-none">{Number(store.averageRating).toFixed(1)}</span>
                    <span className="text-gray-400 text-xs font-medium ml-1">({store.totalRatings})</span>
                  </div>
                  
                  {user?.role === 'NORMAL' && (
                    <div className="flex items-center gap-3">
                      {store.userRating && (
                        <div className="text-xs font-medium text-gray-500 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                          <span>You:</span>
                          <span className="text-gray-900 font-bold">★ {store.userRating}</span>
                        </div>
                      )}
                      <button 
                        onClick={() => setSelectedStore(store)}
                        className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 text-sm font-medium transition-colors shadow-sm"
                      >
                        {store.userRating ? 'Update' : 'Rate'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {!loading && stores.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-lg border-dashed">
                <p className="font-medium text-gray-900 mb-1">No stores found</p>
                <p className="text-sm">Try adjusting your search filters.</p>
              </div>
            )}
          </div>
        )}

        {/* Rating Modal */}
        {selectedStore && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full border border-gray-100 transform transition-all">
              <h2 className="text-xl font-bold text-gray-900 mb-2">Rate {selectedStore.name}</h2>
              <p className="text-sm text-gray-500 mb-6">Select a rating from 1 to 5 stars.</p>
              
              {ratingMsg && (
                <div className={`mb-6 p-3 rounded-md text-sm font-medium ${typeof ratingMsg === 'string' && ratingMsg.includes('successfully') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {typeof ratingMsg === 'string' ? ratingMsg : 'An error occurred'}
                </div>
              )}

              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map(num => (
                  <button
                    key={num}
                    onClick={() => setRating(num)}
                    className={`text-3xl transition-transform hover:scale-110 ${
                      rating >= num ? 'text-yellow-400' : 'text-gray-200 hover:text-yellow-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setSelectedStore(null);
                    setRating(0);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  Cancel
                </button>
                <button 
                  onClick={submitRating}
                  disabled={rating === 0}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
