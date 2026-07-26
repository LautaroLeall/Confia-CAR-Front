// src/components/MyPayments/MyPayments.jsx
import { useState, useEffect } from 'react';
import { FiCalendar, FiDollarSign } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { PageLoader } from '../ui/Loader';
import api from '../../services/api';
import { formatBookingDate } from '../../utils/dateUtils';
import './MyPayments.css';

const MyPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const { data } = await api.get('/api/bookings/my-payments');
                setPayments(data);
            } catch {
                toast.error('Error al cargar pagos');
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const total = payments.reduce((acc, p) => acc + (p.totalPrice || 0), 0);

    if (loading) return <PageLoader text="Cargando historial de pagos..." />;

    return (
        <div className="mypayments-page page-container">
            <div className="container">
                <div className="mypayments-header">
                    <div>
                        <h1 className="section-title">Mis Pagos</h1>
                        <p className="section-subtitle">Historial de reservas pagadas</p>
                    </div>
                    {payments.length > 0 && (
                        <div className="payments-total-single-line">
                            <FiDollarSign className="payments-total-icon" />
                            <span className="total-label-inline">Total gastado:</span>
                            <span className="total-amount-inline">${total.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {payments.length === 0 ? (
                    <EmptyState
                        icon={<FiDollarSign />}
                        title="Sin pagos registrados"
                        description="Cuando realices un pago, aparecerá aquí tu historial."
                    />
                ) : (
                    <div className="payments-list">
                        {payments.map(payment => (
                            <div key={payment._id} className="payment-card glass-card animate-fade-in">
                                <img src={payment.car?.image} alt={payment.car?.name} className="payment-car-img" />
                                <div className="payment-info">
                                    <h3>{payment.car?.name}</h3>
                                    <div className="payment-date">
                                        <FiCalendar />
                                        {formatBookingDate(payment.pickUpDate, "d MMM")}
                                        {' → '}
                                        {formatBookingDate(payment.dropOffDate, "d MMM yyyy")}
                                    </div>
                                </div>
                                <Badge status={payment.status} />
                                <div className="payment-amount">
                                    ${payment.totalPrice?.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPayments;
