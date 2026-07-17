import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { driverService } from '../services/api';

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

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phoneNumber: '',
        gender: 'Female',
        role: 'RIDER'
    });
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [file, setFile] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validation
        if (formData.gender !== 'Female') {
            setError('HerWayCabs is exclusive to women — please select "Female" to continue.');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }
        if (formData.role === 'DRIVER' && !file) {
            setError('Drivers must upload a license / ID document to register.');
            return;
        }

        setSubmitting(true);
        try {
            // register returns user data including id
            const data = await register(formData);

            if (formData.role === 'DRIVER' && file && data?.id) {
                try {
                    await driverService.uploadDocument(data.id, file);
                } catch (upErr) {
                    console.error('Document upload failed', upErr);
                    setSuccess('Account created, but the document upload failed — you can re-upload it later from your driver profile.');
                }
            }

            setSuccess('Account created successfully! Redirecting to sign in…');
            setTimeout(() => navigate('/login'), 1200);
        } catch (err) {
            console.error(err);
            if (!err.response) {
                setError('Cannot reach the server right now. It may be waking up — please try again in a moment.');
            } else if (err.response.status === 409) {
                setError('This email is already registered. Try signing in instead.');
            } else if (err.response.status >= 500) {
                setError('Registration failed. This email may already be registered, or the server had an issue — please try again.');
            } else {
                setError('Registration failed. Please check your details and try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background border-t-4 border-primary py-8">
            <div className="flex w-full max-w-4xl bg-white shadow-2xl rounded-2xl overflow-hidden">
                {/* Left Side - Image/Branding */}
                <div className="hidden md:flex flex-col justify-center items-center w-1/2 bg-primary text-white p-12">
                    <h1 className="text-4xl font-extrabold mb-2 tracking-tight">HerWayCabs</h1>
                    <p className="text-lg text-white/90 text-center">Start your journey with the most premium cab service.</p>
                </div>

                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                            <input type="text" name="name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.name} onChange={handleChange} required placeholder="Jane Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" name="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.email} onChange={handleChange} required placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                            <input type="tel" name="phoneNumber"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.phoneNumber} onChange={handleChange} required placeholder="+91 99999 99999" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} name="password"
                                    className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={formData.password} onChange={handleChange} required minLength={6} placeholder="At least 6 characters" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-primary transition">
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">I am a...</label>
                            <select name="role" value={formData.role} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                                <option value="RIDER">Rider (Passenger)</option>
                                <option value="DRIVER">Driver (Partner)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                                <option value="Other">Other</option>
                            </select>
                            <p className="text-xs text-pink-500 mt-1">* This platform is exclusive to women.</p>
                        </div>

                        {formData.role === 'DRIVER' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Driver License / ID</label>
                                <input type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white" />
                            </div>
                        )}

                        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
                        {success && <div className="p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>}

                        <button type="submit" disabled={submitting}
                            className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-accent transition duration-300 transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none">
                            {submitting ? 'Creating account…' : 'Register'}
                        </button>

                        <div className="text-center mt-4 text-sm">
                            <span className="text-gray-500">Already have an account? </span>
                            <Link to="/login" className="text-accent font-semibold hover:underline">Sign In</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
