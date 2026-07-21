import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, kycService, safetyService, driverService } from '../services/api';
import Toast from '../components/Toast';
import Logo from '../components/Logo';

const homePath = (role) => (role === 'DRIVER' ? '/driver-home' : role === 'ADMIN' ? '/admin' : '/rider-home');

const DOC_TYPES = [
    { value: 'DRIVING_LICENSE', label: 'Driving License' },
    { value: 'AADHAAR_CARD', label: 'Aadhaar Card' },
    { value: 'PAN_CARD', label: 'PAN Card' },
    { value: 'VEHICLE_REGISTRATION', label: 'Vehicle Registration' },
];
const DOC_LABEL = Object.fromEntries(DOC_TYPES.map((d) => [d.value, d.label]));
const STATUS_BADGE = {
    APPROVED: 'bg-green-100 text-green-700',
    PENDING: 'bg-amber-100 text-amber-700',
    REJECTED: 'bg-red-100 text-red-700',
};

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

    // KYC documents
    const [docs, setDocs] = useState([]);
    const [docType, setDocType] = useState(DOC_TYPES[0].value);
    const [docFile, setDocFile] = useState(null);
    const [uploadingDoc, setUploadingDoc] = useState(false);

    // Trusted contacts
    const [contacts, setContacts] = useState([]);
    const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', relationship: '' });
    const [savingContact, setSavingContact] = useState(false);

    // Vehicle (drivers)
    const [vehicleModel, setVehicleModel] = useState('');
    const [vehicleNumber, setVehicleNumber] = useState('');
    const [savingVehicle, setSavingVehicle] = useState(false);

    const initial = (user?.name || 'U').charAt(0).toUpperCase();

    const loadDocs = () => {
        if (!user?.id) return;
        kycService.getUserDocuments(user.id).then(setDocs).catch(() => { });
    };
    useEffect(loadDocs, [user?.id]);

    const loadContacts = () => {
        if (!user?.id) return;
        safetyService.getContacts(user.id).then(setContacts).catch(() => { });
    };
    useEffect(loadContacts, [user?.id]);

    useEffect(() => {
        if (user?.role === 'DRIVER' && user?.id) {
            driverService.getDriverById(user.id).then((d) => {
                setVehicleModel(d.vehicleModel || '');
                setVehicleNumber(d.vehicleNumber || '');
            }).catch(() => { });
        }
    }, [user?.id, user?.role]);

    const addContact = async (e) => {
        e.preventDefault();
        if (!contactForm.name.trim() || !contactForm.phone.trim()) {
            setNotice({ type: 'error', message: 'Please enter at least a name and phone number.' }); return;
        }
        setSavingContact(true);
        try {
            await safetyService.addContact(user.id, contactForm);
            setContactForm({ name: '', phone: '', email: '', relationship: '' });
            setNotice({ type: 'success', message: 'Trusted contact added.' });
            loadContacts();
        } catch {
            setNotice({ type: 'error', message: 'Could not add the contact. Please try again.' });
        } finally { setSavingContact(false); }
    };

    const removeContact = async (id) => {
        try { await safetyService.deleteContact(user.id, id); loadContacts(); }
        catch { setNotice({ type: 'error', message: 'Could not remove the contact.' }); }
    };

    const saveVehicle = async (e) => {
        e.preventDefault();
        setSavingVehicle(true);
        try {
            await driverService.updateVehicle(user.id, vehicleModel.trim(), vehicleNumber.trim());
            setNotice({ type: 'success', message: 'Vehicle details saved.' });
        } catch {
            setNotice({ type: 'error', message: 'Could not save vehicle details.' });
        } finally { setSavingVehicle(false); }
    };

    const uploadDoc = async (e) => {
        e.preventDefault();
        if (!docFile) { setNotice({ type: 'error', message: 'Please choose a file to upload.' }); return; }
        setUploadingDoc(true);
        try {
            await kycService.uploadDocument(user.id, docType, docFile);
            setDocFile(null);
            e.target.reset?.();
            setNotice({ type: 'success', message: 'Document uploaded — pending review.' });
            loadDocs();
        } catch (err) {
            setNotice({ type: 'error', message: err.response?.data?.message || 'Could not upload the document. Please try again.' });
        } finally {
            setUploadingDoc(false);
        }
    };

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

                {/* Vehicle details (drivers) */}
                {user?.role === 'DRIVER' && (
                    <form onSubmit={saveVehicle} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Vehicle details</h2>
                            <p className="text-sm text-gray-500">Shown to riders as a trust signal.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Model</label>
                                <input type="text" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)} placeholder="e.g. Maruti Swift"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Number plate</label>
                                <input type="text" value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder="e.g. MH 12 AB 1234"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" disabled={savingVehicle}
                                className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-accent transition disabled:opacity-60">
                                {savingVehicle ? 'Saving…' : 'Save vehicle'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Trusted contacts */}
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Trusted contacts</h2>
                        <p className="text-sm text-gray-500">People to notify if you raise an SOS or share a ride.</p>
                    </div>
                    {contacts.length > 0 && (
                        <ul className="space-y-2">
                            {contacts.map((c) => (
                                <li key={c.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm">{c.name}{c.relationship ? <span className="text-gray-400 font-normal"> · {c.relationship}</span> : null}</p>
                                        <p className="text-xs text-gray-500 truncate">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                                    </div>
                                    <button onClick={() => removeContact(c.id)} className="text-red-500 text-sm font-semibold hover:underline shrink-0">Remove</button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <form onSubmit={addContact} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} placeholder="Name"
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} placeholder="Phone"
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} placeholder="Email (optional)"
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input type="text" value={contactForm.relationship} onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })} placeholder="Relationship (optional)"
                            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <div className="sm:col-span-2 flex justify-end">
                            <button type="submit" disabled={savingContact}
                                className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-accent transition disabled:opacity-60">
                                {savingContact ? 'Adding…' : 'Add contact'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* KYC documents */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Identity documents (KYC)</h2>
                        <p className="text-sm text-gray-500">Upload documents for verification. Drivers must be verified before going online.</p>
                    </div>

                    {docs.length > 0 && (
                        <ul className="space-y-2">
                            {docs.map((d) => (
                                <li key={d.id} className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl p-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-gray-800 text-sm">{DOC_LABEL[d.type] || d.type}</p>
                                        {d.verificationNotes && <p className="text-xs text-gray-400 truncate">{d.verificationNotes}</p>}
                                    </div>
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_BADGE[d.status] || 'bg-gray-100 text-gray-600'}`}>{d.status}</span>
                                </li>
                            ))}
                        </ul>
                    )}

                    <form onSubmit={uploadDoc} className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 mb-1">Document type</label>
                            <select value={docType} onChange={(e) => setDocType(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white">
                                {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                            <input type="file" accept="image/*,application/pdf" onChange={(e) => setDocFile(e.target.files[0])} className="mt-2 w-full text-sm" />
                        </div>
                        <button type="submit" disabled={uploadingDoc}
                            className="px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-accent transition disabled:opacity-60">
                            {uploadingDoc ? 'Uploading…' : 'Upload'}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default Profile;
