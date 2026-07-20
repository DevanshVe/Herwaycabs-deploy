import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

let counter = 0;

export const NotificationProvider = ({ children }) => {
    const [items, setItems] = useState([]);

    const add = useCallback((message, type = 'info') => {
        setItems((prev) => [{ id: ++counter, message, type, read: false, at: Date.now() }, ...prev].slice(0, 30));
    }, []);

    const markAllRead = useCallback(() => setItems((prev) => prev.map((n) => ({ ...n, read: true }))), []);
    const clear = useCallback(() => setItems([]), []);
    const unread = items.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider value={{ items, add, markAllRead, clear, unread }}>
            {children}
        </NotificationContext.Provider>
    );
};
