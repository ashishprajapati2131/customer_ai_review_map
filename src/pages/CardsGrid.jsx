import React, { useState, useEffect } from 'react';
import Card from '../components/dashboard/Card';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import FlowIcon from '../assets/icons/card_flow.png';
import { LayoutGrid, List, Users, ImageIcon } from 'lucide-react';

const PlaceholderIcon = () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <ImageIcon className="w-6 h-6 text-gray-400" />
    </div>
);

const ShopLogoCell = ({ value, getDirectDriveLink }) => {
    const [loadError, setLoadError] = useState(false);
    const strVal = value != null ? String(value).trim() : '';
    const hasValidUrl = strVal.length > 0;
    const displayUrl = hasValidUrl ? getDirectDriveLink(strVal) : null;

    if (!hasValidUrl || !displayUrl) {
        return (
            <div className="w-28 h-28 flex items-center justify-center shrink-0">
                <PlaceholderIcon />
            </div>
        );
    }

    const content = loadError ? (
        <PlaceholderIcon />
    ) : (
        <img
            src={displayUrl}
            alt="Shop logo"
            className="w-full h-full object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setLoadError(true)}
        />
    );

    return (
        <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-28 h-28 overflow-hidden flex items-center justify-center transition-all duration-200 hover:scale-110"
        >
            {content}
        </a>
    );
};

const QrCodeCell = ({ value, getDirectDriveLink, shopName }) => {
    const [loadError, setLoadError] = useState(false);
    const strVal = value != null ? String(value).trim() : '';
    const hasValidUrl = strVal.length > 0;
    const displayUrl = hasValidUrl ? getDirectDriveLink(strVal) : null;

    const handleDownload = async (e) => {
        e.preventDefault();
        if (!displayUrl) return;

        try {
            // Extract ID to use the direct download link which is better for 'download' attribute
            const fileIdMatch = strVal.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
                || strVal.match(/[?&]id=([a-zA-Z0-9_-]+)/)
                || strVal.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/)
                || (!strVal.includes('/') && strVal.length > 15 ? [null, strVal] : null); // Handle raw ID

            let downloadUrl = displayUrl;
            if (fileIdMatch && fileIdMatch[1]) {
                downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`;
            }

            // Create a temporary anchor for download
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${shopName || 'shop'}_qr_code.png`;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            window.open(displayUrl, '_blank');
        }
    };

    if (!hasValidUrl || !displayUrl) {
        return (
            <div className="w-28 h-28 flex items-center justify-center shrink-0">
                <PlaceholderIcon />
            </div>
        );
    }

    const content = loadError ? (
        <PlaceholderIcon />
    ) : (
        <img
            src={displayUrl}
            alt="QR Code"
            className="w-full h-full object-contain"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setLoadError(true)}
        />
    );

    return (
        <div
            onClick={handleDownload}
            title="Click to download QR Code"
            className="inline-block w-28 h-28 overflow-hidden flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer"
        >
            {content}
        </div>
    );
};

const CardsGrid = () => {
    const [shopCount, setShopCount] = useState(null);
    const [shops, setShops] = useState([]);
    const [loadingCount, setLoadingCount] = useState(true);

    useEffect(() => {
        let cleanupScript = null;

        const fetchSheetData = () => {
            const SHEET_ID = '1g8-0UdPVIrUfSFZlkU_Q7fd-bvEzaJOi4W0OQ3UMLYg';
            const callbackName = 'googleSheetCountCallback_' + Math.floor(Math.random() * 100000);

            window[callbackName] = (json) => {
                try {
                    if (json && json.table && json.table.rows) {
                        const rows = json.table.rows;
                        const cols = json.table.cols;



                        // Parse Data for List
                        if (rows.length > 0) {
                            let headers = cols.map(c => c.label || '').filter(l => l);
                            let startRowIndex = 0;
                            if (headers.length === 0 && rows.length > 0) {
                                headers = rows[0].c.map(cell => cell?.v || '');
                                startRowIndex = 1;
                            }

                            const parsedShops = [];
                            for (let i = startRowIndex; i < rows.length; i++) {
                                const row = rows[i];
                                if (!row.c) continue;

                                const shopObj = {};
                                headers.forEach((header, index) => {
                                    if (row.c[index]) {
                                        shopObj[header] = row.c[index]?.v;
                                    }
                                });
                                parsedShops.push(shopObj);
                            }
                            setShops(parsedShops);
                            setShopCount(parsedShops.length);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching sheets:', error);
                } finally {
                    setLoadingCount(false);
                    delete window[callbackName];
                    if (cleanupScript) cleanupScript.remove();
                }
            };

            const script = document.createElement('script');
            script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}`;
            script.onerror = () => {
                setLoadingCount(false);
                delete window[callbackName];
            };
            document.body.appendChild(script);
            cleanupScript = script;
        };

        fetchSheetData();

        return () => {
            if (cleanupScript) cleanupScript.remove();
        };
    }, []);

    const getDirectDriveLink = (url) => {
        if (!url || typeof url !== 'string') return url;
        const trimmed = url.trim();
        if (!trimmed) return url;
        // Pass through non-Drive URLs (e.g. imgur, direct image links)
        if (!trimmed.includes('drive.google.com')) {
            return trimmed.startsWith('http') || trimmed.startsWith('//') ? trimmed : `https://${trimmed}`;
        }
        // Handle Drive URL formats: /file/d/ID, ?id=ID, &id=ID, /open?id=ID
        const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
            || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
            || trimmed.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
        if (fileIdMatch && fileIdMatch[1]) {
            // Using thumbnail endpoint is more reliable for direct display without downloads
            return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
        }
        return trimmed;
    };

    const renderCell = (key, value, shop) => {
        const normalizedKey = key.toLowerCase().trim();

        // Imagery: Render Shop Logo
        if (normalizedKey === 'shop logo url' || normalizedKey.includes('logo')) {
            return <ShopLogoCell value={value} getDirectDriveLink={getDirectDriveLink} />;
        }

        // QR Code Display + Download
        if (normalizedKey.includes('qr')) {
            return <QrCodeCell value={value} getDirectDriveLink={getDirectDriveLink} shopName={shop['Shop Name']} />;
        }

        if (!value) return '-';

        // Interactivity: Clickable Links
        const isUrl = normalizedKey.includes('url') ||
            value.toString().startsWith('http') ||
            value.toString().includes('google.com/maps') ||
            (typeof value === 'string' && value.includes('drive.google.com'));

        if (isUrl && !normalizedKey.includes('logo') && !normalizedKey.includes('qr')) {
            // Ensure URL has protocol for the anchor tag
            const hrefValue = (value.toString().startsWith('http') || value.toString().startsWith('//'))
                ? value
                : `https://${value}`;

            return (
                <a
                    href={hrefValue}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-pucho-purple/10 text-pucho-purple hover:bg-pucho-purple hover:text-white rounded-xl transition-all text-sm font-bold group shadow-sm hover:shadow-md"
                >
                    <span>Open</span>
                    <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">↗</span>
                </a>
            );
        }

        return value;
    };

    const findValueByTerms = (shop, terms) => {
        const keys = Object.keys(shop);
        // Priority 1: Case-insensitive exact match
        for (const term of terms) {
            const match = keys.find(k => k.toLowerCase().trim() === term.toLowerCase().trim());
            if (match) return shop[match];
        }
        // Priority 2: Partial match
        for (const term of terms) {
            const match = keys.find(k => k.toLowerCase().includes(term.toLowerCase()));
            if (match) return shop[match];
        }
        return null;
    };

    const TABLE_COLUMNS = [
        { label: 'User Name', searchTerms: ['user name', 'user'] },
        { label: 'Shop Name', searchTerms: ['shop name', 'name'] },
        { label: 'Shop Logo', searchTerms: ['shop logo url', 'logo', 'image'] },
        { label: 'Qr Code', searchTerms: ['qr url', 'qr', 'code'] },
        { label: 'Shop Url', searchTerms: ['shop url', 'url', 'link'] },
        { label: 'Map Url', searchTerms: ['map url', 'map', 'location'] },
    ];

    return (
        <div className="space-y-8">
            {/* Top Stats Section */}
            <div className="">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-w-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-pucho-purple/10 flex items-center justify-center text-pucho-purple">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Active Shops</p>
                            <h3 className="text-2xl font-bold text-gray-900">
                                {loadingCount ? (
                                    <span className="animate-pulse">...</span>
                                ) : (
                                    shopCount !== null ? shopCount : '-'
                                )}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shop List Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Registered Shops</h3>
                    <div className="text-sm text-gray-500">
                        Live Data from Google Sheets
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100/50">
                                {loadingCount || shops.length === 0 ? (
                                    <th className="px-6 py-5 text-sm font-bold text-gray-500 uppercase tracking-wider">Shops</th>
                                ) : (
                                    TABLE_COLUMNS.map((col, idx) => (
                                        <th key={idx} className="px-6 py-5 text-sm font-bold text-gray-700 capitalize tracking-wider">
                                            {col.label}
                                        </th>
                                    ))
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingCount ? (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-8 text-center text-gray-500">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-pucho-purple border-t-transparent rounded-full animate-spin"></div>
                                            Loading shops data...
                                        </div>
                                    </td>
                                </tr>
                            ) : shops.length > 0 ? (
                                shops.map((shop, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                        {TABLE_COLUMNS.map((col, colIndex) => {
                                            const value = findValueByTerms(shop, col.searchTerms);
                                            // Pass one of the search terms as the "key" to renderCell to trigger special rendering (logo/qr)
                                            return (
                                                <td key={colIndex} className="px-6 py-6 text-base font-medium text-gray-800 whitespace-nowrap">
                                                    {renderCell(col.searchTerms[0], value, shop)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={TABLE_COLUMNS.length} className="px-6 py-8 text-center text-gray-500">
                                        No shops found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CardsGrid;
