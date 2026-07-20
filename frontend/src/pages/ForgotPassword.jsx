import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import Logo from '../components/Logo';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const data = await authService.forgotPassword(email);
            // Demo: no email service, so we chain straight to the reset step with
            // the freshly-issued token (in production this arrives via email).
            navigate('/reset-password', { state: { token: data.resetToken, email, demo: true } });
        } catch (err) {
            if (!err.response) setError('Cannot reach the server right now — please try again in a moment.');
            else setError(err.response.data?.message || 'Could not start a password reset. Please check the email and try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background border-t-4 border-primary px-4">
            <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8 md:p-10">
                <div className="flex flex-col items-center text-center mb-6">
                    <Logo className="w-14 h-14 mb-3" />
                    <h1 className="text-2xl font-bold text-gray-900">Forgot your password?</h1>
                    <p className="text-gray-500 text-sm mt-1">Enter your account email and we'll help you reset it.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Email address</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                    <button type="submit" disabled={submitting}
                        className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-accent transition disabled:opacity-60">
                        {submitting ? 'Please wait…' : 'Continue'}
                    </button>
                </form>

                <div className="text-center mt-6 text-sm">
                    <Link to="/login" className="text-accent font-semibold hover:underline">Back to sign in</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
