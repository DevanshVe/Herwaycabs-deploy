import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
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
            setError('Invalid credentials');
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
                            <input type="email"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <input type="password"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                                value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                        </div>
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                        <button className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-accent transition duration-300 transform hover:scale-[1.02]">
                            Sign In
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
