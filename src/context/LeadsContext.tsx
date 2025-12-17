import { createContext, useContext, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { type Lead } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface LeadsContextType {
    leads: Lead[];
    addLead: (leadData: Omit<Lead, 'id' | 'created_at'>) => void;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    deleteLead: (id: string) => void;
    importLeads: (newLeads: Lead[]) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
    const [leads, setLeads] = useLocalStorage<Lead[]>('leads', []);

    const addLead = (leadData: Omit<Lead, 'id' | 'created_at'>) => {
        const newLead: Lead = {
            ...leadData,
            id: uuidv4(),
            created_at: new Date().toISOString(),
        };
        setLeads((prev) => [newLead, ...prev]);
    };

    const updateLead = (id: string, updates: Partial<Lead>) => {
        setLeads((prev) =>
            prev.map((lead) =>
                lead.id === id
                    ? { ...lead, ...updates }
                    : lead
            )
        );
    };

    const deleteLead = (id: string) => {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
    };

    const importLeads = (newLeads: Lead[]) => {
        setLeads((prev) => [...newLeads, ...prev]);
    };

    return (
        <LeadsContext.Provider value={{ leads, addLead, updateLead, deleteLead, importLeads }}>
            {children}
        </LeadsContext.Provider>
    );
};

export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (context === undefined) {
        throw new Error('useLeads must be used within a LeadsProvider');
    }
    return context;
};
