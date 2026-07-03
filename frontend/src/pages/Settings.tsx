import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/DashboardLayout';

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

export const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [msg, setMsg] = useState({ text: '', type: '' });

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<UpdatePasswordForm>({
    resolver: zodResolver(updatePasswordSchema)
  });

  const onSubmit = async (data: UpdatePasswordForm) => {
    try {
      await api.patch('/auth/password', {
        oldPassword: data.oldPassword,
        newPassword: data.newPassword
      });
      setMsg({ text: 'Password updated successfully! Please log in again.', type: 'success' });
      reset();
      setTimeout(() => logout(), 2000);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.message || 'Failed to update password', type: 'error' });
    }
  };

  const goBack = () => {
    if (user?.role === 'ADMIN') navigate('/admin');
    else if (user?.role === 'STORE_OWNER') navigate('/owner');
    else navigate('/');
  };

  return (
    <DashboardLayout
      title="Account Settings"
      description="Manage your profile and security preferences."
    >
      <div className="max-w-2xl bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <div className="mb-8 pb-8 border-b border-gray-100">
          <h3 className="text-gray-900 text-lg font-semibold mb-4">Profile Information</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Name</p>
              <p className="text-gray-900 font-medium">{user?.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email</p>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div className="sm:col-span-2 mt-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                user?.role === 'ADMIN' ? 'bg-red-50 text-red-700' : 
                user?.role === 'STORE_OWNER' ? 'bg-purple-50 text-purple-700' : 
                'bg-gray-100 text-gray-700'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-gray-900 text-lg font-semibold mb-4">Change Password</h3>
          
          {msg.text && (
            <div className={`mb-6 p-3 rounded-md text-sm font-medium ${msg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input type="password" {...register('oldPassword')} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow" />
              {errors.oldPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.oldPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input type="password" {...register('newPassword')} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow" />
              {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input type="password" {...register('confirmPassword')} className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow" />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-gray-900 text-white font-medium py-2 px-6 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};
