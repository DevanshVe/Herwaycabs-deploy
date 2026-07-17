import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

// Inline eye icons (no external icon lib needed)
const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);
const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L9.88 9.88" />
    </svg>
);

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const data = await login(email, password);
            if (data.role === 'DRIVER') {
                navigate('/driver-home');
            } else if (data.role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/rider-home');
            }
        } catch (err) {
            if (!err.response) {
                setError('Cannot reach the server right now. It may be waking up — please try again in a moment.');
            } else if (err.response.status === 401 || err.response.status === 403) {
                setError('Invalid email or password.');
            } else {
                setError('Something went wrong while signing in. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background border-t-4 border-primary">
            <div className="flex w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">
                {/* Left Side - Image/Branding */}
                <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-12">
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight">HerWayCabs</h1>
                    <p className="text-lg text-white/90 text-center">Your premium ride awaits. Reliable, fast, and secure.</p>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="email">Email Address</label>
                            <input type="email" id="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1" htmlFor="password">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} id="password"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                    value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary transition">
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                        <button type="submit" disabled={submitting}
                            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-accent transition duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                            {submitting ? 'Signing In…' : 'Sign In'}
                        </button>

                        <div className="text-center mt-4 text-sm">
                            <span className="text-gray-500">New here? </span>
                            <Link to="/register" className="text-accent font-semibold hover:underline">Create an account</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
