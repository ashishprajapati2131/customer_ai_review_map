import React, { useState, useEffect } from 'react';
import Input from '../components/ui/Input';
import { User, Map, Lock, Store, Save, Image as ImageIcon, Link, MapPin, CheckCircle, AlertCircle, X, RefreshCcw, ExternalLink } from 'lucide-react';

const UserAdmin = () => {
    const [formData, setFormData] = useState({
        userName: '',
        mapUrl: '',
        password: '',
        shopName: '',
        shopUrl: '',
        placeId: '',
        shopLogo: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [webhookResponse, setWebhookResponse] = useState(null);
    const [responseError, setResponseError] = useState(null);
    const [showModal, setShowModal] = useState(false);







    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };



    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, shopLogo: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setShowModal(true);
        setWebhookResponse(null);
        setResponseError(null);

        const data = new FormData();
        data.append('userName', formData.userName);
        data.append('mapUrl', formData.mapUrl);
        data.append('password', formData.password);
        data.append('shopName', formData.shopName);
        data.append('shopUrl', formData.shopUrl);
        data.append('placeId', formData.placeId);
        if (formData.shopLogo) {
            data.append('shopLogo', formData.shopLogo);
        }

        try {
            const response = await fetch('https://studio.pucho.ai/api/v1/webhooks/Iepv78ybPybKWk9nKqLER', {
                method: 'POST',
                body: data,
            });

            // Wait for and parse the response
            const responseData = await response.json();

            // Get the actual response body (handle nested structure)
            const actualResponse = responseData.body || responseData;
            const status = actualResponse.status;
            const message = actualResponse.message;

            // Check both HTTP status and response body status
            if (response.ok && status !== 'error') {
                setWebhookResponse(actualResponse);
                // Reset form
                setFormData({
                    userName: '',
                    mapUrl: '',
                    password: '',
                    shopName: '',
                    shopUrl: '',
                    placeId: '',
                    shopLogo: null
                });
                setPreviewUrl(null);
            } else {
                // Handle error from response body
                setResponseError(message || 'Failed to create user. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setResponseError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setWebhookResponse(null);
        setResponseError(null);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">

            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-subtle">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User Name */}
                        <Input
                            label="User Name"
                            name="userName"
                            type="text"
                            icon={User}
                            placeholder="Enter shop user name"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                        />

                        {/* Map URL */}
                        <Input
                            label="Map URL"
                            name="mapUrl"
                            type="text"
                            icon={Map}
                            placeholder="https://maps.google.com/..."
                            value={formData.mapUrl}
                            onChange={handleChange}
                            required
                        />

                        {/* Password */}
                        <Input
                            label="Password"
                            name="password"
                            type="password"
                            icon={Lock}
                            placeholder="Set a secure password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {/* Shop Name */}
                        <Input
                            label="Shop Name"
                            name="shopName"
                            type="text"
                            icon={Store}
                            placeholder="Enter shop name"
                            value={formData.shopName}
                            onChange={handleChange}
                            required
                        />

                        {/* Shop URL */}
                        <Input
                            label="Shop URL"
                            name="shopUrl"
                            type="url"
                            icon={Link}
                            placeholder="https://myshop.com"
                            value={formData.shopUrl}
                            onChange={handleChange}
                            required
                        />

                        {/* Place ID */}
                        <Input
                            label="Place ID"
                            name="placeId"
                            type="text"
                            icon={MapPin}
                            placeholder="Enter Google Place ID"
                            value={formData.placeId}
                            onChange={handleChange}
                            required
                        />

                        {/* Shop Logo Upload */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 block">
                                Shop Logo
                            </label>
                            <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 hover:border-pucho-purple transition-colors bg-gray-50/50">
                                <input
                                    type="file"
                                    name="shopLogo"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-2">
                                    {previewUrl ? (
                                        <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                            <img src={previewUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-pucho-purple">
                                                <ImageIcon size={20} />
                                            </div>
                                            <p className="text-sm">Click or drag logo to upload</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-2 px-6 py-3 bg-pucho-purple text-white font-medium rounded-xl hover:bg-pucho-hover transition-all shadow-md active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            <Save size={18} />
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {loading ? 'Processing...' : (webhookResponse ? 'Success' : 'Error')}
                            </h3>
                            {!loading && (
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X size={20} className="text-gray-500" />
                                </button>
                            )}
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Loading State */}
                            {loading && (
                                <div className="flex flex-col items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-pucho-purple border-t-transparent mb-4"></div>
                                    <p className="text-gray-600 text-lg">Waiting for response...</p>
                                    <p className="text-gray-400 text-sm mt-2">Please wait while we process your request</p>
                                </div>
                            )}

                            {/* Success State */}
                            {!loading && webhookResponse && (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4">
                                        <CheckCircle size={36} />
                                    </div>
                                    <h4 className="text-xl font-semibold text-green-700">User Created Successfully!</h4>
                                </div>
                            )}

                            {/* Error State */}
                            {!loading && responseError && (
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <AlertCircle size={28} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-red-700">Error</h4>
                                        <p className="text-red-600">{responseError}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {!loading && (
                            <div className="p-4 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-pucho-purple text-white font-medium rounded-xl hover:bg-pucho-hover transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserAdmin;
