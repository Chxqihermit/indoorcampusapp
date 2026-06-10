import React from 'react';

interface MapHeaderProps {
    onGpsClick?: () => void;
    onMenuToggle?: () => void;
}

export default function MapHeader({
    onGpsClick,
    onMenuToggle,
}: MapHeaderProps) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm dark:bg-slate-950 dark:border-slate-800">
            <div className="flex items-center justify-between px-4 py-3 h-16">
                {/* Hamburger Menu */}
                <button
                    onClick={onMenuToggle}
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                    title="Toggle menu"
                >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                {/* Logo/Title */}
                <div className="flex flex-1 items-center gap-3 mx-4 min-w-0">
                    <img
                        src="/images/nust-logo.png"
                        alt="Namibia University of Science and Technology"
                        className="h-10 w-auto max-w-[200px] object-contain object-left shrink-0"
                    />
                    <h1 className="text-lg font-semibold text-gray-800 dark:text-white truncate hidden sm:block">
                        CampusNav
                    </h1>
                </div>

                {/* GPS Button */}
                <button
                    onClick={onGpsClick}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
                    title="Use current GPS location (Press G)"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11 10.07 7.5 12 7.5s3.5 1.57 3.5 3.5z" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
