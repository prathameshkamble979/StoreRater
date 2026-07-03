import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { TableSkeleton, Spinner } from '../components/Loaders';
import { DashboardLayout } from '../components/DashboardLayout';

interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  address?: string;
}

interface Store {
  id: string;
  name: string;
  email: string;
  address: string;
  averageRating: string;
  totalRatings: number;
}

interface Rating {
  id: string;
  rating: number;
  createdAt: string;
  user: { name: string; email: string };
  store: { name: string };
}

const createUserSchema = z.object({
  name: z.string().min(20, 'Name must be at least 20 characters').max(60),
  email: z.string().email('Invalid email'),
  password: z.string().min(8).regex(/[A-Z]/, '1 uppercase required').regex(/[!@#$%^&*(),.?":{}|<>]/, '1 special char required'),
  address: z.string().max(400).optional(),
  role: z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER']),
});

const createStoreSchema = z.object({
  name: z.string().min(1, 'Store Name is required').max(255),
  email: z.string().email('Invalid email'),
  address: z.string().min(1, 'Address is required').max(400),
  ownerId: z.string().min(1, 'Owner is required'),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type CreateStoreForm = z.infer<typeof createStoreSchema>;

type Tab = 'forms' | 'users' | 'stores' | 'ratings';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [storeOwners, setStoreOwners] = useState<User[]>([]);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<Tab>('forms');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allStores, setAllStores] = useState<Store[]>([]);
  const [allRatings, setAllRatings] = useState<Rating[]>([]);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  
  const [sortBy, setSortBy] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  const [loadingList, setLoadingList] = useState(false);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const { register: registerUser, handleSubmit: handleUserSubmit, formState: { errors: userErrors, isSubmitting: isSubmittingUser }, reset: resetUser } = useForm<CreateUserForm>({
    resolver: zodResolver(createUserSchema)
  });

  const { register: registerStore, handleSubmit: handleStoreSubmit, formState: { errors: storeErrors, isSubmitting: isSubmittingStore }, reset: resetStore } = useForm<CreateStoreForm>({
    resolver: zodResolver(createStoreSchema)
  });

  const [createMsg, setCreateMsg] = useState('');
  const [storeMsg, setStoreMsg] = useState('');

  useEffect(() => {
    fetchStats();
    fetchStoreOwners();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchAllUsers();
    if (activeTab === 'stores') fetchAllStores();
    if (activeTab === 'ratings') fetchAllRatings();
  }, [activeTab, sortBy, sortOrder, search, roleFilter]);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchStoreOwners = async () => {
    try {
      const res = await api.get('/admin/users?role=STORE_OWNER');
      setStoreOwners(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAllUsers = async () => {
    try {
      setLoadingList(true);
      const sb = sortBy || 'name';
      const res = await api.get(`/admin/users?sortBy=${sb}&sortOrder=${sortOrder}&search=${search}&role=${roleFilter}`);
      setAllUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchAllStores = async () => {
    try {
      setLoadingList(true);
      const sb = sortBy || 'name';
      const res = await api.get(`/stores?sortBy=${sb}&sortOrder=${sortOrder}&search=${search}`);
      setAllStores(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchAllRatings = async () => {
    try {
      setLoadingList(true);
      const sb = sortBy || 'createdAt';
      const res = await api.get(`/admin/ratings?sortBy=${sb}&sortOrder=${sortOrder}`);
      setAllRatings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleViewUser = async (user: User) => {
    try {
      setSelectedUser(user);
      const res = await api.get(`/admin/users/${user.id}`);
      setUserDetails(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const closeUserModal = () => {
    setSelectedUser(null);
    setUserDetails(null);
  };

  const onUserSubmit = async (data: CreateUserForm) => {
    try {
      await api.post('/admin/users', data);
      setCreateMsg('User created successfully!');
      resetUser();
      fetchStats();
      if (data.role === 'STORE_OWNER') fetchStoreOwners();
      setTimeout(() => setCreateMsg(''), 3000);
    } catch (err: any) {
      setCreateMsg(err.response?.data?.message || 'Failed to create user');
    }
  };

  const onStoreSubmit = async (data: CreateStoreForm) => {
    try {
      await api.post('/admin/stores', data);
      setStoreMsg('Store created successfully!');
      resetStore();
      fetchStats();
      setTimeout(() => setStoreMsg(''), 3000);
    } catch (err: any) {
      setStoreMsg(err.response?.data?.message || 'Failed to create store');
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      description="Manage platform users, stores, and oversee activity."
      actions={
        activeTab !== 'forms' && (
          <button 
            onClick={() => setActiveTab('forms')}
            className="px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            Create New
          </button>
        )
      }
    >
      <div className="space-y-8">
        {/* Stats Grid - Clickable to change tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div 
            onClick={() => setActiveTab('users')}
            className={`bg-white rounded-lg border shadow-sm p-6 cursor-pointer transition-all ${activeTab === 'users' ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
          >
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Users</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalUsers || 0}</p>
          </div>
          <div 
            onClick={() => setActiveTab('stores')}
            className={`bg-white rounded-lg border shadow-sm p-6 cursor-pointer transition-all ${activeTab === 'stores' ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
          >
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Stores</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalStores || 0}</p>
          </div>
          <div 
            onClick={() => setActiveTab('ratings')}
            className={`bg-white rounded-lg border shadow-sm p-6 cursor-pointer transition-all ${activeTab === 'ratings' ? 'border-gray-900 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
          >
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Ratings</h3>
            <p className="text-3xl font-bold text-gray-900 tracking-tight">{stats?.totalRatings || 0}</p>
          </div>
        </div>

        {activeTab === 'forms' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Create User Form */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New User</h2>
              {createMsg && <div className={`mb-4 p-3 rounded-md text-sm font-medium ${createMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{createMsg}</div>}
              
              <form onSubmit={handleUserSubmit(onUserSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" {...registerUser('name')} className="mt-1 block w-full rounded border p-2" />
                  {userErrors.name && <p className="text-red-500 text-xs mt-1">{userErrors.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" {...registerUser('email')} className="mt-1 block w-full rounded border p-2" />
                  {userErrors.email && <p className="text-red-500 text-xs mt-1">{userErrors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" {...registerUser('password')} className="mt-1 block w-full rounded border p-2" />
                  {userErrors.password && <p className="text-red-500 text-xs mt-1">{userErrors.password.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select {...registerUser('role')} className="mt-1 block w-full rounded border p-2 bg-white">
                    <option value="NORMAL">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address (Optional)</label>
                  <textarea {...registerUser('address')} className="mt-1 block w-full rounded border p-2" rows={2} />
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingUser}
                  className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 mt-4 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  {isSubmittingUser ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </div>

            {/* Create Store Form */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Store</h2>
              {storeMsg && <div className={`mb-4 p-3 rounded-md text-sm font-medium ${storeMsg.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{storeMsg}</div>}
              
              <form onSubmit={handleStoreSubmit(onStoreSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Name</label>
                  <input type="text" {...registerStore('name')} className="mt-1 block w-full rounded border p-2" />
                  {storeErrors.name && <p className="text-red-500 text-xs mt-1">{storeErrors.name.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Email</label>
                  <input type="email" {...registerStore('email')} className="mt-1 block w-full rounded border p-2" />
                  {storeErrors.email && <p className="text-red-500 text-xs mt-1">{storeErrors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Store Address</label>
                  <textarea {...registerStore('address')} className="mt-1 block w-full rounded border p-2" rows={2} />
                  {storeErrors.address && <p className="text-red-500 text-xs mt-1">{storeErrors.address.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Assign Store Owner</label>
                  {storeOwners.length === 0 ? (
                    <div className="mt-1 p-3 bg-yellow-50 text-yellow-800 rounded border border-yellow-200 text-sm">
                      No Store Owners found. Please create a user with the "Store Owner" role first.
                    </div>
                  ) : (
                    <select {...registerStore('ownerId')} className="mt-1 block w-full rounded border p-2 bg-white">
                      <option value="">-- Select an Owner --</option>
                      {storeOwners.map(owner => (
                        <option key={owner.id} value={owner.id}>{owner.name} ({owner.email})</option>
                      ))}
                    </select>
                  )}
                  {storeErrors.ownerId && <p className="text-red-500 text-xs mt-1">{storeErrors.ownerId.message}</p>}
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingStore || storeOwners.length === 0}
                  className="w-full bg-gray-900 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-800 disabled:opacity-50 mt-4 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                >
                  {isSubmittingStore ? 'Creating...' : 'Create Store'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* List Views */}
        {activeTab !== 'forms' && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col lg:flex-row items-center justify-between p-5 border-b border-gray-200 gap-4">
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <button 
                  onClick={() => {
                    setActiveTab('forms');
                    setSearch('');
                    setRoleFilter('');
                  }}
                  className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md shadow-sm hover:bg-gray-50 text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <span>&larr;</span> Back
                </button>
                <h2 className="text-lg font-semibold text-gray-900 capitalize m-0 whitespace-nowrap">
                  {activeTab} Directory
                </h2>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-end">
                {(activeTab === 'users' || activeTab === 'stores') && (
                  <input
                    type="text"
                    placeholder="Search name, email, address..."
                    className="p-2 border border-gray-300 rounded-lg text-sm w-full md:w-64"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                )}
                
                {activeTab === 'users' && (
                  <select
                    className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                  >
                    <option value="">All Roles</option>
                    <option value="NORMAL">Normal User</option>
                    <option value="STORE_OWNER">Store Owner</option>
                    <option value="ADMIN">System Admin</option>
                  </select>
                )}

                <select 
                  className="p-2 border border-gray-300 rounded-lg text-sm bg-white"
                  value={`${sortBy || (activeTab === 'ratings' ? 'createdAt' : 'name')}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split('-');
                    setSortBy(by);
                    setSortOrder(order);
                  }}
                >
                  {activeTab === 'users' && (
                  <>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                  </>
                )}
                {activeTab === 'stores' && (
                  <>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                    <option value="averageRating-desc">Highest Rated</option>
                    <option value="averageRating-asc">Lowest Rated</option>
                  </>
                )}
                {activeTab === 'ratings' && (
                  <>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="rating-desc">Highest Rated</option>
                    <option value="rating-asc">Lowest Rated</option>
                  </>
                )}
              </select>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              {loadingList ? (
                <TableSkeleton cols={activeTab === 'stores' || activeTab === 'ratings' ? 4 : 5} rows={5} />
              ) : (
                <>
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {activeTab === 'users' && (
                          <>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                          </>
                        )}
                    {activeTab === 'stores' && (
                      <>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Store Name</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Rating</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Ratings</th>
                      </>
                    )}
                    {activeTab === 'ratings' && (
                      <>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Store</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {activeTab === 'users' && allUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === 'ADMIN' ? 'bg-red-50 text-red-700' : 
                          u.role === 'STORE_OWNER' ? 'bg-purple-50 text-purple-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{u.address || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                        <button 
                          onClick={() => handleViewUser(u)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {activeTab === 'stores' && allStores.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-xs">{s.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <span className="text-yellow-400 mr-1 text-lg">★</span>
                        {Number(s.averageRating).toFixed(1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.totalRatings}</td>
                    </tr>
                  ))}
                  
                  {activeTab === 'ratings' && allRatings.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.store.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{r.user.name}</div>
                        <div className="text-xs text-gray-500">{r.user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-yellow-500 text-lg tracking-widest">
                        {'★'.repeat(r.rating)}<span className="text-gray-200">{'★'.repeat(5 - r.rating)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                        {new Date(r.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Empty states */}
              {activeTab === 'users' && allUsers.length === 0 && <div className="py-12 text-center text-gray-500 bg-white text-sm">No users found.</div>}
              {activeTab === 'stores' && allStores.length === 0 && <div className="py-12 text-center text-gray-500 bg-white text-sm">No stores found.</div>}
              {activeTab === 'ratings' && allRatings.length === 0 && <div className="py-12 text-center text-gray-500 bg-white text-sm">No ratings found.</div>}
              </>
              )}
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full border border-gray-100 transform transition-all">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <h3 className="text-xl font-bold text-gray-900">User Details</h3>
                <button onClick={closeUserModal} className="text-gray-400 hover:text-gray-900 transition-colors focus:outline-none">
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!userDetails ? (
                <div className="py-12 flex justify-center"><Spinner /></div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</div>
                    <div className="text-gray-900 font-medium">{userDetails.name}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</div>
                    <div className="text-gray-900">{userDetails.email}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Role</div>
                    <div className="mt-1">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        userDetails.role === 'ADMIN' ? 'bg-red-50 text-red-700' : 
                        userDetails.role === 'STORE_OWNER' ? 'bg-purple-50 text-purple-700' : 
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {userDetails.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Address</div>
                    <div className="text-gray-900">{userDetails.address || 'No address provided'}</div>
                  </div>
                  
                  {userDetails.role === 'STORE_OWNER' && userDetails.store && (
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Store Ownership</div>
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="font-bold text-gray-900 text-lg mb-1">{userDetails.store.name}</div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <span className="text-yellow-400 text-lg leading-none">★</span>
                          <span className="text-gray-900">{Number(userDetails.store.averageRating).toFixed(1)}</span>
                          <span className="text-gray-400 font-normal">Average Rating</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {userDetails.role === 'STORE_OWNER' && (!userDetails.store) && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500 uppercase font-medium mb-2">Store Ownership</div>
                      <div className="text-gray-500 text-sm italic">This owner has not been assigned a store yet.</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
