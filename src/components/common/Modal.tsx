import { X } from 'lucide-react';
import type { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                width: '100%', maxWidth,
                maxHeight: '90vh', overflowY: 'auto',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid var(--border-color)'
            }}>
                <div style={{
                    padding: '16px 20px', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '16px' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: '20px' }}>
                    {children}
                </div>
            </div>
        </div>
    );
}
