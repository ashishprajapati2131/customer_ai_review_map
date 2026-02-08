import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import UserAdmin from "./pages/UserAdmin";
import CustomerReview from "./pages/CustomerReview";
import ShopValidator from "./pages/ShopValidator";

import CardsGrid from "./pages/CardsGrid";

// GUARD: Protects routes from unauthenticated users
const ProtectedRoute = ({ children, allowedRole = 'admin' }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-50 text-pucho-purple animate-pulse">Loading Pucho OS...</div>;
    if (!user) return <Navigate to="/login" replace />;

    // Role Check
    if (user.role !== allowedRole) {
        // CORRECTION: Allow 'admin' to access 'vendor' pages (Super Admin)
        if (allowedRole === 'vendor' && user.role === 'admin') {
            return children;
        }

        // Redirect to their appropriate dashboard if they try to access wrong area
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'vendor') return <Navigate to="/vendor" replace />;
        return <Navigate to="/login" replace />;
    }

    return children;
};

const DummyPage = ({ title }) => (
    <div className="space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-subtle flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-300">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No Data Available</h3>
            <p className="text-gray-500 max-w-sm mt-2">This is a dummy page generated for layout demonstration purposes.</p>
        </div>
    </div>
);

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/review" element={<CustomerReview />} />

                    {/* Admin Area */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }>
                        <Route index element={<CardsGrid />} />
                        <Route path="user-admin" element={<UserAdmin />} />
                        <Route path="dummy1" element={<DummyPage title="Dummy Page #1" />} />
                        <Route path="dummy2" element={<DummyPage title="Dummy Page #2" />} />
                        <Route path="dummy3" element={<DummyPage title="Dummy Page #3" />} />
                        <Route path="team" element={<DummyPage title="Team Management" />} />
                        <Route path="settings" element={<DummyPage title="System Settings" />} />
                        <Route path="settings" element={<DummyPage title="System Settings" />} />
                    </Route>

                    {/* Dynamic Shop Route */}
                    <Route path="/:shopId" element={<ShopValidator />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
