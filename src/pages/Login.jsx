import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { User, Lock, ArrowRight, Moon, Sparkles, Circle } from 'lucide-react';
import mascot1 from '../assets/mascot_1.png';
import mascot3 from '../assets/mascot_3.png';
import mascot4 from '../assets/mascot_4.png';
import mascot5 from '../assets/mascot_5.png';
import logo from '../assets/logo.png';


// Floating Mascot Component (Individual Images)
// Floating Mascot Component (Individual Images)
// Floating Mascot Component (Individual Images) with Gaze Tracking
const Mascot = ({ imageSrc, delay, x, y, size = "w-16 h-16", cursorColor = "text-blue-500", cursorRotation = "0deg" }) => {
    return (
        <div
            className={`absolute ${x} ${y} z-20 animate-float transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer pointer-events-auto`}
            style={{
                animationDelay: `${delay}s`
            }}
        >
            <div className={`${size} rounded-full overflow-hidden shadow-lg relative bg-white/50 backdrop-blur-sm border border-white/40`}>
                <img
                    src={imageSrc}
                    alt="User"
                    className="w-full h-full object-cover"
                />
            </div>
            <div
                className={`absolute -bottom-3 -right-3 ${cursorColor} drop-shadow-md`}
                style={{ transform: `rotate(${cursorRotation})` }}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.5 3.5L10.5 20.5L13.5 13.5L20.5 10.5L3.5 3.5Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    React.useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            if (result.user?.role === 'vendor') {
                navigate('/vendor');
            } else {
                navigate('/admin');
            }
        } else {
            setError(result.message || 'Login failed');
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#FAFAFF] relative flex items-center justify-center p-4 lg:p-8 overflow-hidden font-sans">
            {/* Full Screen Grid Pattern - Base */}
            <div className="absolute inset-0 z-0 opacity-100 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                    maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)'
                }}>
            </div>

            {/* Interactive Grid Spotlight (Purple Glow) */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50"
                style={{
                    background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.15), transparent 40%)`
                }}>
            </div>

            {/* Ambient Gradients - Left & Right */}
            <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-600/30 rounded-full blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

            {/* Theme Toggle (Placeholder) */}
            <div className="absolute top-6 right-6 z-20">
                <button className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-pucho-dark transition-colors">
                    <Moon size={20} />
                </button>
            </div>




            {/* Floating Mascots - Individual Images */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
                {/* Top Left - Woman Green Beanie */}
                <Mascot
                    imageSrc={mascot1}
                    x="top-[25%] left-[2%]"
                    delay={0}
                    cursorColor="text-blue-500"
                    cursorRotation="-10deg"
                />

                {/* Top Center-Right - Man Cap */}
                <Mascot
                    imageSrc={mascot5}
                    x="top-[10%] right-[35%]"
                    delay={1.5}
                    cursorColor="text-purple-500"
                    cursorRotation="15deg"
                />

                {/* Bottom Center-Left - Man Turban */}
                <Mascot
                    imageSrc={mascot3}
                    x="bottom-[20%] left-[40%]"
                    delay={0.8}
                    cursorColor="text-yellow-500"
                    cursorRotation="-5deg"
                />

                {/* Bottom Right - Woman Hijab */}
                <Mascot
                    imageSrc={mascot4}
                    x="bottom-[10%] right-[10%]"
                    delay={2.2}
                    cursorColor="text-green-500"
                    cursorRotation="10deg"
                />
            </div>

            <div className="w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-24 relative z-10 items-center">

                {/* Left Side: Marketing Content */}
                <div className="text-left space-y-8 lg:pl-16 pt-12">
                    {/* Logo */}
                    <div className="mb-16 pl-8">
                        <img src={logo} alt="Pucho.ai" className="h-12" />
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="font-semibold text-pucho-dark text-lg">Pucho.ai's HR Dashboard</div>
                            <div className="text-xs font-bold text-purple-600 tracking-wider uppercase drop-shadow-sm">BUILT ON PUCHO.AI</div>
                        </div>

                        <h1 className="text-[70px] font-bold text-[#111834] leading-[0.95] tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-[#111834] to-[#4338ca]">
                            Build.<br />
                            <span className="text-[#8b5cf6]/80">Automate.</span><br />
                            Scale.
                        </h1>

                        <p className="text-[#111834] text-base leading-relaxed max-w-md opacity-70">
                            From words to working intelligence. Access your HR command center to manage workflows that think.
                        </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-4 pt-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full text-xs font-medium text-purple-700">
                            <Sparkles size={14} />
                            AI-Powered Intelligence
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-100 rounded-full text-xs font-medium text-green-700">
                            <Circle size={8} fill="currentColor" />
                            System Operational
                        </div>
                    </div>
                </div>

                {/* Right Side: Floating Login Card with Glassmorphism */}
                <div className="flex justify-center lg:justify-end">
                    <div className="bg-white/70 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] w-full max-w-md border border-white/50 relative overflow-hidden group">

                        <div className="space-y-2 mb-8">
                            <h2 className="text-2xl font-bold text-[#111834]">Welcome Back</h2>
                            <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <Input
                                label="Username"
                                type="text"
                                icon={User}
                                placeholder="Your Username"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <Input
                                label="Password"
                                type="password"
                                icon={Lock}
                                placeholder="Your Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    relative w-full h-[52px] flex items-center justify-center gap-3 rounded-full
                                    transition-all duration-300 ease-in-out
                                    font-['Inter'] font-semibold text-[18px] leading-[150%] text-white
                                    overflow-hidden group
                                    disabled:opacity-70 disabled:cursor-not-allowed
                                `}
                                style={{
                                    background: 'linear-gradient(180deg, #5833EF 0%, #3A10CE 100%)',
                                    boxShadow: '0px 4.4px 8.8px rgba(58, 16, 206, 0.3)',
                                }}
                            >
                                {/* Highlight/Gloss Effect - Top Half */}
                                {/* Visible by default, fades out on hover/active */}
                                <div
                                    className="absolute top-[1px] left-[1px] right-[1px] h-[26px] rounded-full pointer-events-none transition-opacity duration-300 group-hover:opacity-0 group-active:opacity-0"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)',
                                        zIndex: 1,
                                    }}
                                />

                                {/* Label & Icon */}
                                <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                                    {loading ? 'Automating...' : 'Automate now'}
                                    {!loading && <ArrowRight className="w-5 h-5 -rotate-45" strokeWidth={2.5} />}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Login;
