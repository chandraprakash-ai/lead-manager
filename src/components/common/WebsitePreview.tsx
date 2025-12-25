import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';

interface WebsitePreviewProps {
    url: string;
    children: React.ReactNode;
}

export const WebsitePreview = ({ url, children }: WebsitePreviewProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    const screenshotUrl = `https://image.thum.io/get/width/400/crop/800/noanimate/${safeUrl}`;

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top - 8,
                left: rect.left + rect.width / 2
            });
            setIsHovered(true);
        }
    };

    return (
        <>
            <div
                ref={triggerRef}
                className="inline-block"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
            </div>

            {isHovered && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        zIndex: 9999,
                        top: coords.top,
                        left: coords.left,
                        transform: 'translate(-50%, -100%)',
                        width: '280px',
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                        border: '1px solid var(--border-default)',
                        overflow: 'hidden',
                        padding: '4px',
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{ position: 'relative', width: '100%', height: '180px', background: '#f3f4f6' }}>
                        {!imageLoaded && (
                            <div style={{
                                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--text-muted)', fontSize: '12px'
                            }}>
                                Loading preview...
                            </div>
                        )}
                        <img
                            src={screenshotUrl}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                                display: imageLoaded ? 'block' : 'none'
                            }}
                            onLoad={() => setImageLoaded(true)}
                            onError={(e) => {
                                setImageLoaded(true);
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        {imageLoaded && (
                            <div style={{ padding: '4px 8px', fontSize: '10px', color: '#6b7280', textAlign: 'center', background: 'white' }}>
                                Live Preview
                            </div>
                        )}
                    </div>
                    {/* Tiny triangle pointer */}
                    <div style={{
                        position: 'absolute',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '10px',
                        height: '10px',
                        backgroundColor: 'white',
                        borderBottom: '1px solid var(--border-default)',
                        borderRight: '1px solid var(--border-default)'
                    }} />
                </div>,
                document.body
            )}
        </>
    );
};
