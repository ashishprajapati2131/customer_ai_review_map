import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Copy, MapPin, Store } from 'lucide-react';
import logo from '../assets/logo.png';

// const WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/wimUfp6hNEdJf7EWB0IkY';
const WEBHOOK_URL = 'https://studio.pucho.ai/api/v1/webhooks/CFQiaxj3uEJsIqOku2S1i';

const formatShopName = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name
        .replace(/[-_./\\]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

const getDirectDriveLink = (url) => {
    if (!url || typeof url !== 'string') return url;
    const trimmed = url.trim();
    if (!trimmed) return url;
    if (!trimmed.includes('drive.google.com')) {
        return trimmed.startsWith('http') || trimmed.startsWith('//') ? trimmed : `https://${trimmed}`;
    }
    const fileIdMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
        || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/)
        || trimmed.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
        return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`;
    }
    return trimmed;
};

const CustomerReview = ({ shopName, shopLogo, mapUrl }) => {
    const [searchParams] = useSearchParams();
    const [shopData, setShopData] = useState(null);
    const [review, setReview] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedReviews, setGeneratedReviews] = useState(null);
    const [postOnMapDisabled, setPostOnMapDisabled] = useState(true);
    const [copiedWhich, setCopiedWhich] = useState(null);
    const [selectedKeywords, setSelectedKeywords] = useState(new Set());
    const [logoError, setLogoError] = useState(false);
    const reviewInputRef = useRef(null);

    useEffect(() => {
        if (!loading && !generatedReviews && reviewInputRef.current) {
            reviewInputRef.current.focus({ preventScroll: true });
        }
    }, [loading, generatedReviews]);

    const KEYWORD_CHIPS = [
        { emoji: '⭐', text: 'Excellent' },
        { emoji: '👍', text: 'Very Good' },
        { emoji: '🙂', text: 'Good' },
        { emoji: '😐', text: 'Average' },
        { emoji: '👎', text: 'Needs Improvement' },
        { emoji: '⚠️', text: 'Poor' },
    ];

    const handleFormKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && review.trim()) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const handleKeywordClick = (keywordText) => {
        const input = document.getElementById('review');
        if (selectedKeywords.has(keywordText)) {
            setReview((prev) => prev.replace(keywordText, '').replace(/\s{2,}/g, ' ').trim());
            setSelectedKeywords((prev) => {
                const next = new Set(prev);
                next.delete(keywordText);
                return next;
            });
        } else {
            setReview((prev) => (prev ? `${prev} ${keywordText}` : keywordText));
            setSelectedKeywords((prev) => new Set([...prev, keywordText]));
        }
        input?.focus();
    };

    // On mount: read pid from URL, trigger webhook, wait for response before updating header
    // On mount: read pid from URL, fetch from Google Sheet, find match
    useEffect(() => {
        const pid = searchParams.get('pid');
        if (!pid) return;

        let cleanupScript = null;
        const SHEET_ID = '1g8-0UdPVIrUfSFZlkU_Q7fd-bvEzaJOi4W0OQ3UMLYg';
        const callbackName = 'googleSheetReviewCallback_' + Math.floor(Math.random() * 100000);

        window[callbackName] = (json) => {
            try {
                if (!json || !json.table || !json.table.rows) {
                    console.warn('Invalid sheet data');
                    return;
                }

                const cols = json.table.cols;
                const rows = json.table.rows;
                const normalize = (str) => (str || '').toLowerCase().trim();
                const targetPid = normalize(pid);

                // Find column indices
                const findColIndex = (keywords) => cols.findIndex(col => {
                    const label = normalize(col.label || '');
                    return keywords.every(k => label.includes(k));
                });

                let placeIdIndex = findColIndex(['place', 'id']);
                if (placeIdIndex === -1) placeIdIndex = findColIndex(['qr', 'url']); // Fallback

                let shopNameIndex = findColIndex(['shop', 'name']);
                let shopLogoIndex = findColIndex(['shop', 'logo']);
                let shopUrlIndex = findColIndex(['shop', 'url']);
                if (shopUrlIndex === -1) shopUrlIndex = findColIndex(['website']);
                if (shopUrlIndex === -1) shopUrlIndex = findColIndex(['link']);

                // Fallback: Check first row if headers are empty/missed
                if ((placeIdIndex === -1 || shopNameIndex === -1) && rows.length > 0) {
                    const firstRow = rows[0].c;
                    if (firstRow) {
                        firstRow.forEach((cell, idx) => {
                            const val = normalize(cell?.v);
                            if (val.includes('place') && val.includes('id')) placeIdIndex = idx;
                            else if (val.includes('qr') && val.includes('url') && placeIdIndex === -1) placeIdIndex = idx;

                            if (val.includes('shop') && val.includes('name')) shopNameIndex = idx;
                            if (val.includes('shop') && val.includes('logo')) shopLogoIndex = idx;
                            if (val.includes('shop') && val.includes('url')) shopUrlIndex = idx;
                            else if (val.includes('website') && shopUrlIndex === -1) shopUrlIndex = idx;
                            else if (val.includes('link') && shopUrlIndex === -1) shopUrlIndex = idx;
                        });
                    }
                }

                if (placeIdIndex === -1) {
                    console.error('PID/Place ID column not found');
                    return;
                }

                // Search for matching row
                const match = rows.find(row => {
                    const cellValue = normalize(row.c[placeIdIndex]?.v);
                    return cellValue.includes(targetPid);
                });

                if (match) {
                    const name = shopNameIndex !== -1 ? match.c[shopNameIndex]?.v : null;
                    const logo = shopLogoIndex !== -1 ? match.c[shopLogoIndex]?.v : null;
                    const id = match.c[placeIdIndex]?.v; // The full value from the sheet

                    // Determine Place ID (clean it if it's a URL)
                    // If the column is 'QR url', the PID is a substring, but the Place ID might be the whole thing or part of it.
                    // The prompt says "search for the row where the place_id column contains the given pid as a substring".
                    // And "Use this matches record... retrieve full row data".

                    if (name) {
                        setShopData({
                            shop_name: name,
                            logo_url: getDirectDriveLink(logo),
                            place_id: id,
                            shop_url: shopUrlIndex !== -1 ? match.c[shopUrlIndex]?.v : null
                        });
                    }
                } else {
                    console.log('No shop found for PID:', pid);
                }

            } catch (err) {
                console.error('Sheet parsing error:', err);
            } finally {
                delete window[callbackName];
                if (cleanupScript) cleanupScript.remove();
            }
        };

        const script = document.createElement('script');
        script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=responseHandler:${callbackName}`;
        script.onerror = () => {
            console.error('Failed to load sheet data');
            delete window[callbackName];
        };
        document.body.appendChild(script);
        cleanupScript = script;

        return () => {
            if (cleanupScript) cleanupScript.remove();
            delete window[callbackName]; // Ensure cleanup on unmount
        };
    }, [searchParams]);

    const pidFromUrl = searchParams.get('pid');
    const placeId = shopData?.place_id || pidFromUrl;
    const effectiveMapUrl = placeId;
    // mapUrl ||
    // (placeId ? `https://search.google.com/local/writereview?placeid=${placeId}` : null);

    const shopnameFromUrl = searchParams.get('shopname') || searchParams.get('shop_name');

    // User Request: "show the shop name from excel sheet not from the query parameter"
    // If PID is present, we rely on the Sheet data (shopData). 
    // If shopData is not yet loaded, we don't fallback to URL param to avoid confusion.
    const rawName = pidFromUrl
        ? (shopData?.shop_name)
        : (shopData?.shop_name || shopnameFromUrl || shopName);

    const headerText = formatShopName(rawName) || 'Customer Review';

    const headerLogo = shopData?.logo_url || shopLogo;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!review.trim()) return;

        setLoading(true);

        // Minimum loading time of 4 seconds as requested
        const minLoadingTime = new Promise(resolve => setTimeout(resolve, 4000));

        try {
            const [response] = await Promise.all([
                // fetch('/api/webhook/qsIldd88NpOc7c6uG7tT3/sync', {
                fetch('/api/webhook/CFQiaxj3uEJsIqOku2S1i/sync', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        review,
                        shopName: shopData?.shop_name || shopName || 'Unknown Shop',
                        shopUrl: shopData?.shop_url || window.location.href
                    }),
                }),
                minLoadingTime
            ]);

            if (response.ok) {
                const json = await response.json();
                console.log('Webhook Response:', json); // Debugging

                // Handle nested data structure { data: { ... } } or flat structure
                const data = json.data || json;

                const shortReview = data.short_review || data.short || data.shortReview;
                const longReview = data.long_review || data.long || data.review || data.detailedReview;

                if (shortReview || longReview) {
                    setGeneratedReviews({
                        short: shortReview || 'No short summary available.',
                        long: longReview || 'No details available.'
                    });
                } else {
                    // Fallback if response is OK but data is empty/malformed
                    console.warn('Empty review data received', json);
                    alert('Review submitted, but no content was returned from the server.');
                }
                setReview('');
            } else {
                alert('Failed to submit review. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text, which) => {
        navigator.clipboard.writeText(text);
        setPostOnMapDisabled(false);
        setCopiedWhich(which);
        setTimeout(() => setCopiedWhich(null), 2000);
    };

    const getReviewUrl = (url) => {
        if (!url) return '';
        // If it's already a write review link, return as is
        if (url.includes('writereview')) return url;

        // Handle "g.page" shortlinks (common for businesses) -> append /review
        if (url.includes('g.page')) {
            return url.endsWith('/') ? `${url}review` : `${url}/review`;
        }

        // For standard google maps links, it's harder to force "write review" without Place ID.
        // But we can try appending query param if it supports it, or just return original.
        // Best practice is for user to provide the 'writereview' link in the sheet.
        return url;
    };

    const handlePostToMap = (text) => {
        if (!effectiveMapUrl) return;
        navigator.clipboard.writeText(text);
        alert('Review text copied! Opening Google Maps in a popup window... Please paste your review there.');

        const targetUrl = getReviewUrl(effectiveMapUrl);

        // Open as a popup window
        const width = 600;
        const height = 800;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);

        window.open(
            targetUrl,
            'GoogleMapReview',
            `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`
        );
    };

    const handleReset = () => {
        setGeneratedReviews(null);
        setReview();
        setCopiedWhich(null);
        setPostOnMapDisabled(true);
        setSelectedKeywords(new Set());
    };

    const LoadingSkeleton = () => (
        <div className="w-full max-w-2xl space-y-6 animate-pulse">
            <div className="text-center mb-8 space-y-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto"></div>
                <div className="h-8 bg-gray-200 rounded w-48 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Short Review Skeleton */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-64">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="space-y-3 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
                    </div>
                </div>

                {/* Long Review Skeleton */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-64">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                    <div className="space-y-3 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-8">
                <div className="h-4 bg-gray-200 rounded w-40"></div>
            </div>
        </div>
    );
    return (
        <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm shrink-0">
                <div className="pl-10">
                    <img src={logo} alt="Pucho" className="h-10 w-auto" />
                </div>
                <div className="pr-10 flex items-center gap-4">
                    {headerLogo && !logoError ? (
                        <img
                            src={headerLogo}
                            alt={shopData?.shop_name || shopName}
                            className="h-16 w-16 object-contain rounded-full shadow-sm bg-white"
                            onError={() => setLogoError(true)}
                        />
                    ) : (
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 shadow-sm border border-gray-200">
                            <Store size={32} />
                        </div>
                    )}

                    <span className="text-xl font-bold text-gray-900 tracking-tight">
                        {headerText}
                    </span>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center p-4 py-8 overflow-y-auto">
                {loading ? (
                    <LoadingSkeleton />
                ) : generatedReviews ? (
                    <div className="w-full max-w-2xl space-y-6 animate-fade-in relative">
                        {/* Header Section */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                <Send size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">AI-Generated Review Summary</h2>
                            <p className="text-gray-500 mt-2 mb-6">Here is a summary of your feedback.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Short Review Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Short Summary</h3>
                                <p className="text-gray-800 text-lg font-semibold leading-relaxed whitespace-pre-wrap flex-1">
                                    "{generatedReviews.short || 'No summary available.'}"
                                </p>
                                <div className="mt-6 flex flex-col gap-3">
                                    <button
                                        onClick={() => handleCopy(generatedReviews.short, 'short')}
                                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pucho-purple/30 focus-visible:ring-offset-1 ${copiedWhich === 'short'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        <Copy size={16} />
                                        {copiedWhich === 'short' ? 'Copied!' : 'Copy Text'}
                                    </button>
                                </div>
                            </div>

                            {/* Long Review Card */}
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Detailed Review</h3>
                                <p className="text-gray-800 text-lg font-semibold leading-relaxed whitespace-pre-wrap flex-1">
                                    {generatedReviews.long || 'No details available.'}
                                </p>
                                <div className="mt-6 flex flex-col gap-3">
                                    <button
                                        onClick={() => handleCopy(generatedReviews.long, 'long')}
                                        className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-all duration-200 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pucho-purple/30 focus-visible:ring-offset-1 ${copiedWhich === 'long'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        <Copy size={16} />
                                        {copiedWhich === 'long' ? 'Copied!' : 'Copy Text'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {effectiveMapUrl && (
                            <div className="flex justify-center">
                                <button
                                    onClick={() => handlePostToMap(generatedReviews.short)}
                                    disabled={postOnMapDisabled}
                                    className="inline-flex items-center gap-3 px-8 py-4 bg-pucho-purple text-white font-black text-xl rounded-2xl shadow-xl hover:bg-pucho-hover hover:scale-105 transition-all duration-200 group disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pucho-purple focus-visible:ring-offset-2"
                                >
                                    <MapPin size={24} className="group-hover:animate-bounce" />
                                    Post on Map
                                </button>
                            </div>
                        )}

                        <div className="text-center pt-8">
                            <button
                                onClick={handleReset}
                                className="text-pucho-purple hover:text-pucho-hover font-bold text-lg hover:underline transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pucho-purple/30 focus-visible:ring-offset-1 rounded"
                            >
                                Generate another review:
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg border border-gray-100 p-10">
                        <div className="flex flex-col items-center text-center mb-10">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                                Share your experience
                            </h1>
                            <p className="text-lg text-gray-500 mt-3">We value your feedback.</p>
                        </div>

                        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
                            <div>
                                <label htmlFor="review" className="sr-only">Review</label>
                                <textarea
                                    ref={reviewInputRef}
                                    id="review"
                                    rows={6}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pucho-purple/20 focus:border-pucho-purple transition-all duration-200 resize-none bg-gray-50/50 min-h-[140px] cursor-text"
                                    placeholder="Write your review here..."
                                    value={review}
                                    onChange={(e) => setReview(e.target.value)}
                                    required
                                />
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {KEYWORD_CHIPS.map(({ emoji, text }) => (
                                        <button
                                            key={text}
                                            type="button"
                                            onClick={() => handleKeywordClick(text)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pucho-purple/30 focus-visible:ring-offset-1 ${selectedKeywords.has(text)
                                                ? 'bg-pucho-purple/10 border-pucho-purple text-pucho-purple'
                                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                                                }`}
                                        >
                                            {emoji} {text}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !review.trim()}
                                className={`
                                    w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium text-white
                                    bg-pucho-purple hover:bg-pucho-hover transition-all duration-200 shadow-md hover:shadow-lg active:scale-95
                                    disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-md
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pucho-purple focus-visible:ring-offset-2
                                `}
                            >
                                <Send size={18} />
                                {loading ? 'Generating...' : 'Generate Review'}
                            </button>
                        </form>
                    </div>
                )}
            </main>

            <div className="py-6 text-center border-t border-gray-100 bg-white">
                <p className="text-xs text-gray-400">Powered by Pucho.ai</p>
            </div>
        </div>
    );
};

export default CustomerReview;
