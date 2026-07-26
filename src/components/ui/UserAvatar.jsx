import { useState, useEffect } from 'react';

const AVATAR_COLORS = [
    'linear-gradient(135deg, #22c55e, #14b8a6)',  // Verde → Teal
    'linear-gradient(135deg, #3b82f6, #8b5cf6)',  // Azul → Violeta
    'linear-gradient(135deg, #f59e0b, #ef4444)',  // Ámbar → Rojo
    'linear-gradient(135deg, #ec4899, #8b5cf6)',  // Rosa → Violeta
    'linear-gradient(135deg, #06b6d4, #3b82f6)',  // Cyan → Azul
    'linear-gradient(135deg, #10b981, #059669)',  // Esmeralda
    'linear-gradient(135deg, #f97316, #dc2626)',  // Naranja → Rojo
    'linear-gradient(135deg, #8b5cf6, #ec4899)',  // Violeta → Rosa
];

/**
 * Genera un color de fondo consistente basado en el nombre del usuario.
 * El mismo nombre siempre genera el mismo color.
 */
const getColorFromName = (firstName = '', lastName = '') => {
    const str = `${firstName}${lastName}`.toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

/**
 * Extrae las iniciales del usuario (máximo 2 caracteres).
 */
const getInitials = (firstName = '', lastName = '') => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

/**
 * UserAvatar — Componente reutilizable de avatar
 */
const UserAvatar = ({
    avatar,
    firstName = '',
    lastName = '',
    size = 40,
    className = '',
    fontSize,
    style = {}
}) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [avatar]);

    const initials = getInitials(firstName, lastName);
    const computedFontSize = fontSize || Math.max(size * 0.38, 10);

    // Validar que el avatar sea una URL real de al menos 10 caracteres
    const isValidUrl = avatar &&
        typeof avatar === 'string' &&
        (avatar.startsWith('http://') || avatar.startsWith('https://')) &&
        avatar.length > 10;

    if (isValidUrl && !hasError) {
        return (
            <img
                src={avatar}
                alt={`${firstName} ${lastName}`}
                className={className}
                referrerPolicy="no-referrer"
                onError={() => setHasError(true)}
                style={{
                    width: size,
                    height: size,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    ...style
                }}
            />
        );
    }

    return (
        <div
            className={className}
            style={{
                width: size,
                height: size,
                borderRadius: '50%',
                background: getColorFromName(firstName, lastName),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: computedFontSize,
                fontWeight: 700,
                color: '#fff',
                fontFamily: "'Outfit', 'Poppins', sans-serif",
                letterSpacing: '0.02em',
                flexShrink: 0,
                textTransform: 'uppercase',
                userSelect: 'none',
                ...style
            }}
            title={`${firstName} ${lastName}`}
        >
            {initials || '?'}
        </div>
    );
};

export default UserAvatar;
