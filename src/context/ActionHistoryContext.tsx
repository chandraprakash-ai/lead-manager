import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Action {
    id: string;
    name: string;
    timestamp: number;
    undo: () => void;
    redo: () => void;
    details?: string;
    businessName?: string;
    category?: string;
    city?: string;
}

interface ActionHistoryContextType {
    past: Action[];
    future: Action[];
    addAction: (action: Omit<Action, 'id' | 'timestamp'>) => void;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    clearHistory: () => void;
}

const ActionHistoryContext = createContext<ActionHistoryContextType | undefined>(undefined);

export function ActionHistoryProvider({ children }: { children: ReactNode }) {
    const [past, setPast] = useState<Action[]>([]);
    const [future, setFuture] = useState<Action[]>([]);

    const addAction = useCallback((action: Omit<Action, 'id' | 'timestamp'>) => {
        const newAction: Action = {
            ...action,
            id: Math.random().toString(36).substring(7),
            timestamp: Date.now()
        };
        setPast(prev => [...prev, newAction]);
        setFuture([]);
    }, []);

    const undo = useCallback(() => {
        setPast(prev => {
            if (prev.length === 0) return prev;
            const newPast = [...prev];
            const action = newPast.pop()!;
            action.undo();
            setFuture(f => [...f, action]);
            return newPast;
        });
    }, []);

    const redo = useCallback(() => {
        setFuture(prev => {
            if (prev.length === 0) return prev;
            const newFuture = [...prev];
            const action = newFuture.pop()!;
            action.redo();
            setPast(p => [...p, action]);
            return newFuture;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setPast([]);
        setFuture([]);
    }, []);

    const value = {
        past,
        future,
        addAction,
        undo,
        redo,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        clearHistory
    };

    return (
        <ActionHistoryContext.Provider value={value}>
            {children}
        </ActionHistoryContext.Provider>
    );
}

export function useActionHistory() {
    const context = useContext(ActionHistoryContext);
    if (context === undefined) {
        throw new Error('useActionHistory must be used within an ActionHistoryProvider');
    }
    return context;
}
