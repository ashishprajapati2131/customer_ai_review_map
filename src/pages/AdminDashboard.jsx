import React from "react";
import Sidebar from "../components/dashboard/Sidebar";
import Header from "../components/dashboard/Header";
import { Outlet } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div className="flex h-screen bg-pucho-light overflow-hidden font-sans text-gray-900">
            {/* Sidebar: Fixed Left */}
            <Sidebar />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col ml-[240px] overflow-hidden relative">
                {/* Header: Sticky Top */}
                <Header />

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-8 relative z-10">
                    <div className="w-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
