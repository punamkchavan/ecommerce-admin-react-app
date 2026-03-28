import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAdminName, fetchAdminProfile, clearError } from '../features/auth/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { User, Save, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user, profile, isLoading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.uid && !profile) {
      dispatch(fetchAdminProfile(user.uid));
    }
  }, [user, profile, dispatch]);

  useEffect(() => {
    if (profile?.name) {
      setName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    if (!name.trim()) return;
    
    const result = await dispatch(updateAdminName({ uid: user.uid, name: name.trim() }));
    if (updateAdminName.fulfilled.match(result)) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-primary-100 p-2 rounded-lg">
          <User className="h-6 w-6 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Profile</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
          <p className="text-sm text-gray-500">Update your administrative details</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Profile updated successfully!
            </div>
          )}

          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Email Address"
              value={user?.email || ''}
              disabled
              className="bg-gray-50"
            />
            
            <Input
              id="name"
              label="Display Name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
