import React from 'react';
import { StoreContext, useStoreContextValue } from './store/store';
import Index from './components/Index';
import { StatusBar } from 'expo-status-bar';

export default function App() {
    const StoreContextValue = useStoreContextValue();
    return (
        <StoreContext.Provider value={StoreContextValue}>
            <Index />
            <StatusBar style="dark" />
        </StoreContext.Provider>
    );
}