import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CustomerReview from './CustomerReview';

const ShopValidator = () => {
    const { shopId } = useParams();
    const [status, setStatus] = useState('loading'); // loading, valid, invalid, error
    const [errorMsg, setErrorMsg] = useState('');
    const [shopDetails, setShopDetails] = useState(null);

    useEffect(() => {
        let cleanupScript = null;

        const validateShop = () => {
            // Use JSONP to bypass CORS completely without proxies
            const SHEET_ID = '1g8-0UdPVIrUfSFZlkU_Q7fd-bvEzaJOi4W0OQ3UMLYg';
            const callbackName = 'googleSheetCallback_' + Math.floor(Math.random() * 100000);

            // Define global callback
            window[callbackName] = (json) => {
                try {
                    if (!json || !json.table) {
                        throw new Error('Invalid response from Google Sheets');
                    }

                    const cols = json.table.cols; // headers
                    const rows = json.table.rows; // data

                    // Helper to normalize strings
                    const normalize = (str) => (str || '').toLowerCase().trim();

                    // Strategy 1: Check column definition labels
                    let qrUrlIndex = cols.findIndex(col => {
                        const label = normalize(col.label || '');
                        return label.includes('qr') && label.includes('url');
                    });

                    let shopNameIndex = cols.findIndex(col => {
                        const label = normalize(col.label || '');
                        return label.includes('shop') && label.includes('name');
                    });

                    let shopLogoIndex = cols.findIndex(col => {
                        const label = normalize(col.label || '');
                        return label.includes('shop') && label.includes('logo');
                    });

                    let mapUrlIndex = cols.findIndex(col => {
                        const label = normalize(col.label || '');
                        return (label.includes('map') || label.includes('google')) && label.includes('url');
                    });

                    // Strategy 2: If not found in labels, check the FIRST ROW of data
                    // This often happens if Google doesn't detect the header row automatically
                    if (qrUrlIndex === -1 && rows.length > 0) {
                        const firstRow = rows[0].c;
                        if (firstRow) {
                            firstRow.forEach((cell, index) => {
                                if (!cell || !cell.v) return;
                                const val = normalize(cell.v);
                                if (val.includes('qr') && val.includes('url')) {
                                    qrUrlIndex = index;
                                }
                                if (val.includes('shop') && val.includes('name')) {
                                    shopNameIndex = index;
                                }
                                if (val.includes('shop') && val.includes('logo')) {
                                    shopLogoIndex = index;
                                }
                                if ((val.includes('map') || val.includes('google')) && val.includes('url')) {
                                    mapUrlIndex = index;
                                }
                            });
                        }
                    }

                    if (qrUrlIndex === -1) {
                        // Fallback based on user screenshot if dynamic detection fails:
                        // D = 3 (QR url)
                        // F = 5 (shop name)
                        // But let's throw error for now to be safe, or we could soft-fallback.
                        throw new Error(`Column "QR url" not found. Parsed first row: ${rows.length > 0 ? rows[0].c.map(c => c?.v).join(', ') : 'Empty'}`);
                    }

                    const targetPath = normalize(shopId);
                    let foundDetails = null;

                    const isValid = rows.some(row => {
                        // row.c is array of cells
                        if (!row.c || !row.c[qrUrlIndex]) return false;

                        // accessing value .v
                        const cellValue = normalize(row.c[qrUrlIndex]?.v);

                        if (cellValue.includes(targetPath)) {
                            // Match!
                            let name = null;
                            let logo = null;
                            let map = null;
                            if (shopNameIndex !== -1 && row.c[shopNameIndex]) {
                                name = row.c[shopNameIndex]?.v;
                            }
                            if (shopLogoIndex !== -1 && row.c[shopLogoIndex]) {
                                logo = row.c[shopLogoIndex]?.v;
                            }
                            if (mapUrlIndex !== -1 && row.c[mapUrlIndex]) {
                                map = row.c[mapUrlIndex]?.v;
                            }
                            foundDetails = { shopName: name, shopLogo: logo, mapUrl: map };
                            return true;
                        }
                        return false;
                    });

                    if (isValid) {
                        setStatus('valid');
                        setShopDetails(foundDetails);
                    } else {
                        setStatus('invalid');
                    }

                } catch (error) {
                    console.error('Processing error:', error);
                    setStatus('error');
                    setErrorMsg(error.message);
                } finally {
                    // Cleanup
                    delete window[callbackName];
                    if (cleanupScript) cleanupScript.remove();
                }
            };

            // Inject Script
            const script = document.createElement('script');
            script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}`;
            script.onerror = () => {
                setStatus('error');
                setErrorMsg('Network error: Failed to load Google Sheet data. Check internet connection or sheet permissions.');
                delete window[callbackName];
            };
            document.body.appendChild(script);
            cleanupScript = script;
        };

        if (shopId) {
            validateShop();
        }

        return () => {
            if (cleanupScript) cleanupScript.remove();
        };
    }, [shopId]);

    if (status === 'loading') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col gap-4">
                <div className="w-12 h-12 border-4 border-pucho-purple border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium animate-pulse">Verifying Shop...</p>
            </div>
        );
    }

    if (status === 'valid') {
        return <CustomerReview shopName={shopDetails?.shopName} shopLogo={shopDetails?.shopLogo} mapUrl={shopDetails?.mapUrl} />;
    }

    if (status === 'invalid') {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col text-center p-4">
                <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Shop Not Found</h2>
                <p className="text-gray-500 max-w-md">
                    The shop ID <span className="font-mono bg-gray-200 px-1 rounded">/{shopId}</span> could not be confirmed.
                    Please check the URL or contact support.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-50 flex-col text-center p-4">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Validation Error</h2>
            <p className="text-gray-500 max-w-md mb-4">{errorMsg}</p>
            <div className="text-sm text-gray-400 max-w-sm bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <p className="font-semibold mb-1">Troubleshooting:</p>
                <ul className="text-left list-disc pl-4 space-y-1">
                    <li>Ensure the Google Sheet is <b>"Published to the web"</b> (File → Share → Publish to web).</li>
                    <li>Ensure the "QrURL" column exists.</li>
                </ul>
            </div>
        </div>
    );
};

export default ShopValidator;
