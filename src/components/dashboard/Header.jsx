import React from "react";
import { useLocation } from "react-router-dom";
import BellIcon from '../../assets/icons/bell.png';

const Header = () => {
    const location = useLocation();

    const getPageTitle = (path) => {
        if (path === '/admin/user-admin') {
            return {
                title: 'User Admin',
                subtitle: 'Create new shop users and manage access'
            };
        }
        return {
            title: 'Overview',
            subtitle: 'Welcome back'
        };
    };

    const { title, subtitle } = getPageTitle(location.pathname);

    return (
        <header className="sticky top-0 z-20 w-full bg-white border-b border-gray-100 flex items-center justify-between pl-5 py-4 pr-8">
            {/* Title & Search (Left) */}
            <div className="flex items-center gap-6">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold text-gray-900 leading-tight">{title}</h1>
                    <p className="text-base text-gray-500">{subtitle}</p>
                </div>

                {/* Search Bar Removed */}

            </div>

            {/* Actions (Right) */}
            <div className="flex items-center gap-4">
                {/* Notification Button Removed as requested */}
                <div className="h-8 w-[1px] bg-gray-200 mx-4"></div>
                <div className="flex items-center gap-2">
                    {/* Version text removed */}
                </div>
            </div>
        </header >
    );
};

export default Header;
