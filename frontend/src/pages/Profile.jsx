import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import Toast from '../components/Toast';
import Logo from '../components/Logo';

const homePath = (role) => (role === 'DRIVER' ? '/driver-home' : role === 'ADMIN' ? '/admin' : '/rider-home');

const Profile = () => {
    const { user, updateUser, logout } = useAuth();
    const navigate = useNavigate();
    const [notice, setNotice] = useState(null);

    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');
    const [savingProfile, setSavingProfile] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const initial = (user?.name || 'U').charAt(0).toUpperCase();

    const saveProfile = async (e) => {
        e.preventDefault();
        if (!name.trim()) { setNotice({ type: 'error', message: 'Please enter your name.' }); return; }
        setSavingProfile(true);
        try {
            const updated = await authService.updateProfile({ name: name.trim(), phoneNumber: phone.trim() });
            updateUser({ name: updated.name, phoneNumber: updated.phoneNumber });
            setNotice({ type: 'success', message: 'Profile updated.' });
        } catch (err) {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Could not update your profile. Please try again.' });
        } finally {
            setSavingProfile(false);
        }
    };

    const savePassword = async (e) => {
        e.preventDefault();
        if (newPassword.length < 6) { setNotice({ type: 'error', message: 'New password must be at least 6 characters.' }); return; }
        if (newPassword !== confirmPassword) { setNotice({ type: 'error', message: 'New password and confirmation do not match.' }); return; }
        setSavingPassword(true);
        try {
            await authService.changePassword(currentPassword, newPassword);
            setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
            setNotice({ type: 'success', message: 'Password changed successfully.' });
        } catch (err) {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Could not change your password. Please try again.' });
        } finally {
            setSavingPassword(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Toast notice={notice} onClose={() => setNotice(null)} />

            <header className="bg-white shadow-sm">
                <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(homePath(user?.role))} className="flex items-center gap-2 text-gray-600 hover:text-primary transition font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                        Back
                    </button>
                    <div className="flex items-center gap-2">
                        <Logo className="w-7 h-7" />
                        <span className="font-bold text-primary">HerWayCabs</span>
                    </div>
                    <button onClick={logout} className="text-accent font-semibold text-sm hover:underline">Logout</button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-5 py-8 space-y-6">
                {/* Identity banner */}
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-primary text-white flex items-center justify-center text-2xl font-extrabold shrink-0">{initial}</div>
                    <div className="min-w-0">
                        <h1 className="text-2xl font-bold text-gray-900 truncate">{user?.name}</h1>
                        <p className="text-gray-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-pink-100 text-primary">{user?.role}</span>
                    </div>
                </div>

                {/* Edit profile */}
                <form onSubmit={saveProfile} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Profile details</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Full name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Phone number</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 99999 99999"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" value={user?.email || ''} disabled className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                            <input type="text" value={user?.gender || '—'} disabled className="w-full px-4 py-2.5 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={savingProfile}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-accent transition disabled:opacity-60">
                            {savingProfile ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>

                {/* Change password */}
                <form onSubmit={savePassword} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Change password</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Current password</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">New password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm new password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={savingPassword}
                            className="px-6 py-2.5 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-700 transition disabled:opacity-60">
                            {savingPassword ? 'Updating…' : 'Update password'}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default Profile;
