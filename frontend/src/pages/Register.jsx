import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { driverService } from '../services/api';

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
    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // register returns user data including id
            const data = await register(formData);

            if (formData.role === 'DRIVER' && file && data?.id) {
                try {
                    await driverService.uploadDocument(data.id, file);
                } catch (upErr) {
                    console.error('Document upload failed', upErr);
                    alert('Registration successful, but document upload failed.');
                }
            }

            navigate('/login');
        } catch (err) {
            console.error(err);
            setError('Registration failed. Email might be in use.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background border-t-4 border-primary">
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
                                value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" name="email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.email} onChange={handleChange} required placeholder="name@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
                            <input type="text" name="phoneNumber"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.phoneNumber} onChange={handleChange} required placeholder="+91 99999 99999" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                            <input type="password" name="password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                value={formData.password} onChange={handleChange} required placeholder="••••••••" />
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

                        <button className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-accent transition duration-300 transform hover:scale-[1.02]">
                            Register
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
