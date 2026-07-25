import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Parsea una fecha de reserva (Date o string ISO) para evitar desfasamiento de zona horaria (UTC-3)
export const parseBookingDate = (dateInput) => {
    if (!dateInput) return new Date();
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return new Date();

    // Si viene como string 'YYYY-MM-DD' sin hora
    if (typeof dateInput === 'string' && dateInput.length === 10) {
        const [year, month, day] = dateInput.split('-').map(Number);
        return new Date(year, month - 1, day, 12, 0, 0);
    }

    // Si la fecha en UTC es medianoche (T00:00:00Z) o en hora local quedó en noche anterior
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
};

// Formatea una fecha de reserva (Date o string ISO) para mostrarla en la interfaz
export const formatBookingDate = (dateInput, pattern = 'd MMM', options = { locale: es }) => {
    const safeDate = parseBookingDate(dateInput);
    return format(safeDate, pattern, options);
};
