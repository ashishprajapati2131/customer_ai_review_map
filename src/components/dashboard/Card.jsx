import React from 'react';
import FlowIcon from '../../assets/icons/card_flow.png';

const Card = ({ title, description, active, onClick, listView }) => {
    return (
        <div
            onClick={onClick}
            className={`
                p-5 gap-4 flex bg-white rounded-2xl cursor-pointer transition-all duration-300 ease-in-out
                ${active
                    ? 'border border-black shadow-none'
                    : 'border border-transparent shadow-[0px_10px_10px_rgba(0,0,0,0.02)] hover:shadow-[0px_20px_25px_rgba(0,0,0,0.05)]'
                }
                ${listView
                    ? 'w-full flex-row items-center h-auto'
                    : 'w-full flex-col h-[165px]'
                }
            `}
        >
            {/* Icon Container */}
            <div className={`w-14 h-14 rounded-full bg-[#A0D296]/10 flex items-center justify-center flex-none text-[#5A7C60]`}>
                <img src={FlowIcon} alt="Flow" className="w-6 h-6 object-contain opacity-100" />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1 flex-1">
                <h3 className="font-['Inter'] font-semibold text-[20px] leading-[120%] tracking-[-0.01em] text-black">
                    {title}
                </h3>
                <p className="font-['Inter'] font-normal text-[14px] leading-[150%] tracking-[-0.012em] text-black/60 line-clamp-2">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default Card;
