import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Movimientos from './pages/Movimientos';
import Transferencia from './pages/Transferencia';
import Depositar from './pages/Depositar';
import Retirar from './pages/Retirar';
import CrearCuenta from './pages/CrearCuenta';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/movimientos" element={<Movimientos />} />
        <Route path="/transferencia" element={<Transferencia />} />
        <Route path="/deposito" element={<Depositar />} />
        <Route path="/retiro" element={<Retirar />} />
        <Route path="/crear-cuenta" element={<CrearCuenta />} />
      </Routes>
    </Router>
  );
}

export default App;
