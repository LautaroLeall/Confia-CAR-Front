// src/routes/routes.jsx
import { Routes, Route } from 'react-router-dom';
import Container from '../container/Container';
import Inicio from '../components/Inicio/Inicio';
import CarGrid from '../components/Cars/CarGrid';
import CarDetail from '../components/CarDetail/CarDetail';
import Login from '../components/Auth/Login';
import Register from '../components/Auth/Register';
import MyBookings from '../components/MyBookings/MyBookings';
import MyPayments from '../components/MyPayments/MyPayments';
import Profile from '../components/Profile/Profile';
import NotFound from '../components/NotFound/NotFound';
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import AdminLayout from '../components/Admin/AdminLayout';
import AdminDashboard from '../components/Admin/AdminDashboard';
import AdminBookings from '../components/Admin/AdminBookings';
import AdminUsers from '../components/Admin/AdminUsers';
import AdminChats from '../components/Admin/AdminChats';
import AdminCars from '../components/Admin/AdminCars';

const AppRoutes = () => (
    <Routes>
        {/* PUBLICAS */}
        <Route path="/" element={<Container />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/autos" element={<CarGrid />} />
        <Route path="/autos/:id" element={<CarDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* PRIVADAS */}
        <Route path="/mireservas" element={<PrivateRoute><MyBookings /></PrivateRoute>} />
        <Route path="/mispagos" element={<PrivateRoute><MyPayments /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* ADMIN */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="autos" element={<AdminCars />} />
            <Route path="reservas" element={<AdminBookings />} />
            <Route path="chats" element={<AdminChats />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="*" element={<AdminDashboard />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
    </Routes>
);

export default AppRoutes;
