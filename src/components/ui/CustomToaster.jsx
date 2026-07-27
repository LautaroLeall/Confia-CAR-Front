// src/components/ui/CustomToaster.jsx
import { Toaster } from 'react-hot-toast';
import './CustomToaster.css';

const CustomToaster = () => {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={12}
            toastOptions={{
                className: 'custom-toast-popup',
                style: {
                    background: 'rgba(22, 27, 34, 0.96)',
                    color: '#e6edf3',
                    border: '1px solid #30363d',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    fontSize: '0.88rem',
                    fontWeight: '500',
                    fontFamily: "'Inter', sans-serif",
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(16px)',
                },
                success: {
                    duration: 3500,
                    iconTheme: {
                        primary: '#3fb950',
                        secondary: '#0d1117',
                    },
                    style: {
                        border: '1px solid rgba(63, 185, 80, 0.4)',
                        boxShadow: '0 8px 24px rgba(63, 185, 80, 0.15)',
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
                        boxShadow: '0 8px 24px rgba(248, 81, 73, 0.15)',
                    }
                },
                loading: {
                    iconTheme: {
                        primary: '#3b82f6',
                        secondary: '#0d1117',
                    },
                    style: {
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        boxShadow: '0 8px 24px rgba(59, 130, 246, 0.15)',
                    }
                }
            }}
        />
    );
};

export default CustomToaster;
