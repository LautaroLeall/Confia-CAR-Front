// src/context/BookingProvider.jsx
import { useState, useEffect, useContext, useCallback } from "react";
import { BookingContext } from "./BookingContext";
import { AuthContext } from "./AuthContext";
import api from "../services/api";

const BookingProvider = ({ children }) => {
    const [bookings, setBookings] = useState([]);
    const { user } = useContext(AuthContext);

    const transformBooking = useCallback((b) => {
        if (!b || !b.car) return b;
        return {
            _id: b._id, // ID de la reserva en MongoDB
            id: b.car.id, // ID numérico del auto para ruteo
            name: b.car.name,
            type: b.car.type,
            year: b.car.year,
            seats: b.car.seats,
            fuel: b.car.fuel,
            transmission: b.car.transmission,
            price: b.car.price,
            image: b.car.image,
            description: b.car.description,
            pickUpDate: b.pickUpDate,
            dropOffDate: b.dropOffDate,
            location: b.location,
            totalPrice: b.totalPrice,
            paymentStatus: b.paymentStatus,
            preferenceId: b.preferenceId,
            paymentId: b.paymentId,
            status: b.status,
            chatOpen: b.chatOpen,
            adminNote: b.adminNote,
            cancelledBy: b.cancelledBy
        };
    }, []);

    const fetchMyBookings = useCallback(async () => {
        try {
            const { data } = await api.get('/api/bookings/my-bookings');
            const formatted = data.map(transformBooking);
            setBookings(formatted);
        } catch (error) {
            console.error('Error fetching bookings:', error.message);
        }
    }, [transformBooking]);

    useEffect(() => {
        if (user) {
            fetchMyBookings();
        } else {
            setBookings([]);
        }
    }, [user, fetchMyBookings]);

    const addBooking = async (carConFechas) => {
        try {
            const { data } = await api.post('/api/bookings', {
                carId: carConFechas.id,
                pickUpDate: carConFechas.pickUpDate,
                dropOffDate: carConFechas.dropOffDate,
                location: carConFechas.location
            });
            const formatted = transformBooking(data);
            setBookings((prev) => [...prev, formatted]);
            return { success: true, booking: formatted };
        } catch (error) {
            console.error('Error adding booking:', error);
            const message = error.response?.data?.message || 'Error al guardar la reserva';
            return { success: false, error: message };
        }
    };

    const removeBooking = async (id) => {
        // En el frontend antiguo, 'id' es el id del auto.
        // Busquemos el booking correspondiente para obtener el '_id' de MongoDB
        const booking = bookings.find((b) => b.id === id || b._id === id);
        if (!booking) return;

        try {
            await api.delete(`/api/bookings/${booking._id}`);
            setBookings((prev) => prev.filter((b) => b._id !== booking._id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting booking:', error);
            const message = error.response?.data?.message || 'Error al cancelar la reserva';
            return { success: false, error: message };
        }
    };

    return (
        <BookingContext.Provider value={{ bookings, addBooking, removeBooking, fetchMyBookings }}>
            {children}
        </BookingContext.Provider>
    );
};

export default BookingProvider;
