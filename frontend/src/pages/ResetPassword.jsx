import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/api';
import Logo from '../components/Logo';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const passedToken = location.state?.token || '';
    const isDemo = location.state?.demo;

    const [token, setToken] = useState(passedToken);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!token.trim()) { setError('A reset token is required.'); return; }
        if (newPassword.length < 6) { setError('New password must be at least 6 characters.'); return; }
        if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
        setSubmitting(true);
        try {
            await authService.resetPassword(token.trim(), newPassword);
            setDone(true);
            setTimeout(() => navigate('/login'), 1600);
        } catch (err) {
            if (!err.response) setError('Cannot reach the server right now — please try again in a moment.');
            else setError(err.response.data?.message || 'Could not reset the password. The link may have expired.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background border-t-4 border-primary px-4">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 md:p-10">
                <div className="flex flex-col items-center text-center mb-6">
                    <Logo className="w-14 h-14 mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
                    <p className="text-gray-500 text-sm mt-1">Choose a strong password you'll remember.</p>
                </div>

                {isDemo && (
                    <div className="mb-5 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs">
                        <strong>Demo:</strong> this platform has no email service, so your reset link was generated instantly and pre-filled below.
                    </div>
                )}

                {done ? (
                    <div className="text-center py-6">
                        <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <p className="font-bold text-gray-900">Password reset! Redirecting to sign in…</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!passedToken && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Reset token</label>
                                <input type="text" value={token} onChange={(e) => setToken(e.target.value)} required placeholder="Paste your reset token"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs" />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">New password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} placeholder="At least 6 characters"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm new password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                        <button type="submit" disabled={submitting}
                            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-accent transition disabled:opacity-60">
                            {submitting ? 'Resetting…' : 'Reset password'}
                        </button>
                    </form>
                )}

                <div className="text-center mt-6 text-sm">
                    <Link to="/login" className="text-accent font-semibold hover:underline">Back to sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
