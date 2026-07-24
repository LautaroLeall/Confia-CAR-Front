// src/App.jsx
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar.jsx';
import AppRoutes from './routes/routes.jsx';
import PageProgress from './components/ui/PageProgress.jsx';
import CustomToaster from './components/ui/CustomToaster.jsx';
import './index.css';

// Rutas donde el Navbar NO se muestra
const ROUTES_WITHOUT_NAVBAR = ['/login', '/register'];

const App = () => {
    const location = useLocation();
    const showNavbar = !ROUTES_WITHOUT_NAVBAR.includes(location.pathname) && !location.pathname.startsWith('/admin');

    return (
        <>
            {/* Indicador de carga de cambio de página */}
            <PageProgress />

            {/* Navbar */}
            {showNavbar && <Navbar />}

            {/* Contenido principal */}
            <main key={location.pathname} className="main-content-wrapper animate-fade-in">
                <AppRoutes />
            </main>

            {/* Componente Toaster independiente */}
            <CustomToaster />
        </>
    );
};

export default App;
