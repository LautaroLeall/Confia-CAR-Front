// src/components/Chat/ChatWidget.jsx
import { useState, useEffect, useRef, useContext } from 'react';
import { FiSend, FiX, FiMinus, FiMessageCircle, FiLock } from 'react-icons/fi';
import { io } from 'socket.io-client';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import UserAvatar from '../ui/UserAvatar.jsx';
import './ChatWidget.css';

const ChatWidget = ({ booking, onClose, embedded = false }) => {
    const { user } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [minimized, setMinimized] = useState(false);
    const messagesEndRef = useRef(null);

    const isReadOnly = ['completed', 'cancelled'].includes(booking.status);

    // Conectar a Socket.io
    useEffect(() => {
        if (isReadOnly) return;
        const token = localStorage.getItem('confia_car_token') || localStorage.getItem('token');
        if (!token) return;

        const backendUrl = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:5000';
        const newSocket = io(backendUrl, {
            auth: { token }
        });

        setSocket(newSocket);

        newSocket.on('connect', () => {
            newSocket.emit('join_booking', { bookingId: booking._id });
        });

        const handleIncomingMessage = (message) => {
            setMessages((prev) => {
                if (prev.some(m => m._id === message._id)) return prev;
                return [...prev, message];
            });
        };

        newSocket.on('receive_message', handleIncomingMessage);
        newSocket.on('newMessage', handleIncomingMessage);

        return () => newSocket.close();
    }, [booking._id, isReadOnly]);

    // Cargar historial de mensajes
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await api.get(`/api/messages/${booking._id}`);
                setMessages(data);
            } catch (error) {
                console.error('Error cargando mensajes:', error);
            }
        };
        fetchMessages();
    }, [booking._id]);

    // Scroll automático
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, minimized]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || isReadOnly) return;

        const msgData = {
            bookingId: booking._id,
            content: newMessage.trim(),
        };

        socket.emit('send_message', msgData);
        setNewMessage('');
    };

    const isAdmin = user?.isAdmin || user?.role === 'admin';
    const otherPersonName = isAdmin
        ? `${booking.user?.firstName || 'Usuario'} ${booking.user?.lastName || ''}`
        : 'Soporte Confia-CAR';

    const renderChatContent = () => (
        <>
            {!embedded && (
                <div className="chat-widget-header">
                    <div className="chat-header-info">
                        <div className="chat-header-avatar">
                            <UserAvatar
                                avatar={isAdmin ? booking.user?.avatar : null}
                                firstName={isAdmin ? booking.user?.firstName : 'Confia'}
                                lastName={isAdmin ? booking.user?.lastName : 'CAR'}
                                size={32}
                            />
                        </div>
                        <div className="chat-header-text">
                            <h4>{otherPersonName}</h4>
                            <span>Reserva: {booking.car?.name}</span>
                        </div>
                    </div>
                    <div className="chat-header-actions">
                        <button onClick={() => setMinimized(!minimized)} title="Minimizar">
                            {minimized ? <FiMessageCircle /> : <FiMinus />}
                        </button>
                        <button onClick={onClose} title="Cerrar"><FiX /></button>
                    </div>
                </div>
            )}

            {!minimized && (
                <>
                    <div className="chat-widget-body">
                        {messages.length === 0 ? (
                            <div className="chat-empty">
                                <p>Comienza a chatear. Los mensajes están protegidos.</p>
                            </div>
                        ) : (
                            messages.map((msg, index) => {
                                const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
                                const isMe = String(senderId) === String(user?._id);
                                return (
                                    <div key={msg._id || index} className={`chat-message ${isMe ? 'message-out' : 'message-in'}`}>
                                        <div className="message-bubble">
                                            {msg.content}
                                        </div>
                                        <div className="message-time">
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {isReadOnly ? (
                        <div className="chat-readonly-banner">
                            <FiLock size={14} />
                            <span>Conversación finalizada ({booking.status === 'completed' ? 'Reserva completada' : 'Reserva cancelada'}). Modo solo lectura.</span>
                        </div>
                    ) : (
                        <form className="chat-widget-footer" onSubmit={handleSendMessage}>
                            <input
                                type="text"
                                placeholder="Escribe un mensaje..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button type="submit" disabled={!newMessage.trim()} className="chat-send-btn">
                                <FiSend />
                            </button>
                        </form>
                    )}
                </>
            )}
        </>
    );

    return (
        <div className={`modern-chat-widget ${embedded ? 'embedded' : 'floating'} ${minimized ? 'minimized' : ''}`}>
            {renderChatContent()}
        </div>
    );
};

export default ChatWidget;
