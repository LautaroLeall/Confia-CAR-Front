// src/components/ui/CustomToaster.jsx
import { Toaster } from 'react-hot-toast';
import './CustomToaster.css';

const CustomToaster = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={10}
            toastOptions={{
                className: 'custom-toast-popup',
                style: {
                    background: 'rgba(22, 27, 34, 0.95)',
                    color: '#e6edf3',
                    border: '1px solid rgba(56, 139, 253, 0.3)',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontSize: '0.88rem',
                    fontWeight: '500',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(12px)',
                },
                success: {
                    duration: 3500,
                    iconTheme: {
                        primary: '#3fb950',
                        secondary: '#0d1117',
                    },
                    style: {
                        border: '1px solid rgba(63, 185, 80, 0.4)',
                    }
                },
                error: {
                    duration: 4000,
                    iconTheme: {
                        primary: '#f85149',
                        secondary: '#0d1117',
                    },
                    style: {
                        border: '1px solid rgba(248, 81, 73, 0.4)',
                    }
                },
                loading: {
                    iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#0d1117',
                    },
                    style: {
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                    }
                }
            }}
        />
    );
};

export default CustomToaster;
