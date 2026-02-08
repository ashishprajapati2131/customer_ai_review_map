import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.png';

// Custom Icon Imports
import HomeIcon from '../../assets/icons/home.svg';
import AgentsIcon from '../../assets/icons/agents.svg';
import ChatIcon from '../../assets/icons/chat.svg';
import FlowsIcon from '../../assets/icons/flows.svg';
import ActivityIcon from '../../assets/icons/activity.svg';
import McpIcon from '../../assets/icons/mcp.svg';
import KnowledgeIcon from '../../assets/icons/knowledge.svg';
import ToolsIcon from '../../assets/icons/tools.svg';
import MarketplaceIcon from '../../assets/icons/marketplace.svg';
import LogoutIcon from '../../assets/icons/logout.svg';

const Sidebar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Menu items configuration
    const menuItems = [
        { name: 'Overview', icon: HomeIcon, path: '/admin' }, // Using Home icon for "Cards" view as primary
        { name: 'User Admin', icon: AgentsIcon, path: '/admin/user-admin' },
    ];

    return (
        <aside className="w-[240px] h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-10">
            {/* Logo */}
            <div className="pl-8 pt-3 pb-2"> {/* Minor padding adjustment */}
                <div className="flex items-center gap-2">
                    <img src={logo} alt="Pucho" className="h-[34px] w-auto" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-[10px] px-[12px] h-[40px] rounded-[22px] text-[14px] font-medium transition-all duration-200 border
                            ${isActive
                                ? 'bg-[rgba(160,210,150,0.1)] border-transparent text-black'
                                : 'bg-transparent border-transparent text-black hover:border-[rgba(160,210,150,0.3)]'
                            }
                        `}
                    >
                        {/* Render Icon Image */}
                        <img
                            src={item.icon}
                            alt={item.name}
                            className="w-5 h-5 object-contain opacity-100"
                        />
                        <span className="truncate">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* User Profile (Bottom) */}
            <div className="p-4 border-t border-gray-100 space-y-2">

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-3xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                    <img
                        src={LogoutIcon}
                        alt="Logout"
                        className="w-5 h-5 object-contain opacity-80"
                    />
                    <span className="truncate">Log out</span>
                </button>

                <div className="flex items-center gap-3 p-2 rounded-2xl hover:bg-gray-50 cursor-pointer transition-colors">
                    <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="User"
                        className="w-8 h-8 rounded-full bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">Admin User</p>
                        <p className="text-xs text-gray-500 truncate">admin@pucho.ai</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
