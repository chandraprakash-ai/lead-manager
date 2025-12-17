import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useQuery } from '@tanstack/react-query';
import Modal from './common/Modal';
import { Upload } from 'lucide-react';
import type { NicheCategory } from '../types';
import { bulkInsertLeads } from '../api/leads';
import { fetchCustomFields } from '../api/customFields';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ImportModal({ isOpen, onClose, onSuccess }: ImportModalProps) {
    const [step, setStep] = useState<'upload' | 'map' | 'preview'>('upload');
    const [fileData, setFileData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const [mapping, setMapping] = useState<Record<string, string>>({});
    const [importing, setImporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { data: customFields = [] } = useQuery({
        queryKey: ['customFields'],
        queryFn: fetchCustomFields,
        enabled: isOpen
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

                if (data.length === 0) throw new Error("File is empty");

                const headers = data[0] as string[];
                const rows = data.slice(1);

                setHeaders(headers);
                setFileData(rows);

                // Auto-map based on similar names
                const autoMap: Record<string, string> = {};

                headers.forEach(h => {
                    const normalized = h.toLowerCase().replace(/[^a-z0-9]/g, '');

                    // Check for custom fields matches
                    const exactCustomKey = customFields.find(cf => cf.key === h || cf.name.toLowerCase() === h.toLowerCase());
                    if (exactCustomKey) {
                        autoMap[h] = exactCustomKey.key;
                        return;
                    }

                    if (normalized.includes('business') || normalized.includes('name')) autoMap[h] = 'business_name';
                    else if (normalized.includes('city') || normalized.includes('loc')) autoMap[h] = 'city';
                    else if (normalized.includes('niche') || normalized.includes('cat')) autoMap[h] = 'niche';
                    else if (normalized.includes('web')) autoMap[h] = 'website';
                    else if (normalized.includes('phone') || normalized.includes('tel')) autoMap[h] = 'phone';
                    else if (normalized.includes('email') || normalized.includes('mail')) autoMap[h] = 'email';
                    else if (normalized.includes('rating') || normalized.includes('stars')) autoMap[h] = 'rating';
                    else if (normalized.includes('review') || normalized.includes('count')) autoMap[h] = 'reviews';
                });
                setMapping(autoMap);
                setStep('map');
                setError(null);
            } catch (err) {
                setError("Failed to parse file. Ensure it is a valid CSV or Excel file.");
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        setImporting(true);
        setError(null);
        try {
            const customKeys = new Set(customFields.map(cf => cf.key));

            // Transform data
            const leadsToInsert = fileData.map((row: any[]) => {
                const lead: any = {
                    contacted: false,
                    priority: 'High',
                    deal_stage: 'New',
                    website_status: 'no', // Default
                    reviews: 0,
                    rating: 0,
                    custom_data: {}
                };

                Object.entries(mapping).forEach(([header, dbField]) => {
                    if (dbField === 'ignore') return;
                    const index = headers.indexOf(header);
                    let value = row[index];

                    // Basic Cleanup
                    if (typeof value === 'string') value = value.trim();

                    // Niche Validation fallback
                    if (dbField === 'niche') {
                        const valid: NicheCategory[] = ['Cafe', 'Gym', 'Clinic', 'Other'];
                        const vUpper = String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
                        if (!valid.includes(vUpper as any)) value = 'Other';
                        else value = vUpper;
                    }

                    if (dbField === 'website_status') {
                        const vLower = String(value).toLowerCase();
                        if (['yes', 'active', 'true'].includes(vLower)) value = 'yes';
                        else if (['bad', 'error', 'broken'].includes(vLower)) value = 'bad';
                        else value = 'no';
                    }

                    if (dbField === 'priority') {
                        const vInit = String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
                        if (['High', 'Medium', 'Low'].includes(vInit)) value = vInit;
                        else value = 'High'; // Default
                    }

                    if (dbField === 'deal_stage') {
                        const valid = ['New', 'Contacted', 'Interested', 'Proposal', 'Closed', 'Lost'];
                        const vInit = String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
                        if (valid.includes(vInit)) value = vInit;
                        else value = 'New';
                    }

                    if (dbField === 'contacted') {
                        const vLower = String(value).toLowerCase();
                        value = ['yes', 'true', '1', 'y'].includes(vLower);
                    }

                    if (dbField === 'reviews') {
                        value = parseInt(String(value).replace(/[^0-9]/g, ''), 10);
                        if (isNaN(value)) value = 0;
                    }

                    if (dbField === 'rating') {
                        value = parseFloat(String(value));
                        if (isNaN(value)) value = 0;
                    }

                    // Assign to correct place
                    if (customKeys.has(dbField)) {
                        lead.custom_data[dbField] = value;
                    } else {
                        lead[dbField] = value;
                    }
                });

                // Validation
                if (!lead.business_name) lead.business_name = 'Unknown Business';
                if (!lead.city) lead.city = 'Unknown City';
                if (!lead.niche) lead.niche = 'Other';

                return lead;
            });

            await bulkInsertLeads(leadsToInsert);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to import leads to Supabase.");
        } finally {
            setImporting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Leads" maxWidth="600px" background-color="white">
            <div>
                {step === 'upload' && (
                    <div style={{ textAlign: 'center', padding: '40px 20px', border: '2px dashed var(--border-default)', borderRadius: '8px', background: 'var(--gray-50)' }}>
                        <div style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>
                            <Upload size={48} style={{ margin: '0 auto', display: 'block', marginBottom: '8px', opacity: 0.5 }} />
                            <p>Drag and drop CSV/Excel file here, or click to select</p>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            accept=".csv, .xlsx, .xls"
                            style={{ display: 'none' }}
                        />
                        <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
                            Select File
                        </button>
                        {error && <div style={{ marginTop: '16px', color: 'var(--danger-text)', fontSize: '13px' }}>{error}</div>}
                    </div>
                )}

                {step === 'map' && (
                    <div >
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                            Map your file columns to the database fields.
                        </p>

                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
                            {headers.map(header => (
                                <div key={header} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    <div style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>{header}</div>
                                    <div style={{ color: 'var(--text-faint)' }}>→</div>
                                    <select
                                        value={mapping[header] || 'ignore'}
                                        onChange={(e) => setMapping(prev => ({ ...prev, [header]: e.target.value }))}
                                        className="input"
                                        style={{ flex: 1 }}
                                    >
                                        <option value="ignore">Ignore</option>
                                        <optgroup label="Required">
                                            <option value="business_name">Business Name</option>
                                            <option value="niche">Niche</option>
                                            <option value="city">City</option>
                                        </optgroup>
                                        <optgroup label="Custom Fields">
                                            {customFields.map(cf => (
                                                <option key={cf.key} value={cf.key}>{cf.name}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Optional">
                                            <option value="website">Website</option>
                                            <option value="website_status">Website Status</option>
                                            <option value="social_media">Social Media (Link)</option>
                                            <option value="phone">Phone</option>
                                            <option value="email">Email</option>
                                            <option value="rating">Rating</option>
                                            <option value="reviews">Reviews</option>
                                        </optgroup>
                                        <optgroup label="Operational">
                                            <option value="priority">Priority</option>
                                            <option value="deal_stage">Deal Stage</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="follow_up_date">Follow Up Date</option>
                                            <option value="notes">Notes</option>
                                        </optgroup>
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between pt-4 border-t border-[var(--border-subtle)]">
                            <button className="btn" onClick={() => setStep('upload')}>Back</button>
                            <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
                                {importing ? 'Importing...' : `Import ${fileData.length} rows`}
                            </button>
                        </div>
                        {error && <div style={{ marginTop: '16px', color: 'var(--danger-text)', fontSize: '13px' }}>{error}</div>}
                    </div>
                )}
            </div>
        </Modal>
    );
}
