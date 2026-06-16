import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SendIcon from "@mui/icons-material/Send";

import { jwtDecode } from "jwt-decode";

function Depositar() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [monto, setMonto] = useState("");
  const [cuentaId, setCuentaId] = useState("");
  const token = localStorage.getItem("jwt_token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        localStorage.removeItem("jwt_token");
        navigate("/login");
        return;
      }

      const idCuenta = decoded["IdCuenta"] || decoded.IdCuenta;
      const nombreUsuario =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
        decoded.unique_name ||
        "Usuario";
      const propietario = decoded["Propietario"] || nombreUsuario;

      setCuentaId(idCuenta);
    } catch (err) {
      console.error("Error:", err);
      localStorage.removeItem("jwt_token");
      navigate("/login");
    }
  }, [navigate, token]);

  const handleDepositar = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!monto || monto <= 0) {
      setError(
        "Por favor, ingresa un monto válido para depositar. El monto debe ser mayor a cero.",
      );
      return;
    }

    setLoading(true);

    try {
      // El microservicio CuentaMovimientos corre en el puerto 7172 (https)
      const response = await fetch(
        `http://localhost:8070/api/Cuentas/${cuentaId}/depositar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            monto: parseFloat(monto),
          }),
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al realizar el depósito.");
      }

      setSuccess(
        "¡Depósito realizado con éxito! El saldo se actualizará en breve.",
      );

      setMonto("");
    } catch (err) {
      setError(
        err.message ||
          "Error de conexión. Verifica que los servicios estén encendidos.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}
    >
      <AppBar position="static" color="primary" elevation={2}>
        <Toolbar>
          <Button
            color="inherit"
            onClick={() => navigate("/dashboard")}
            startIcon={<ArrowBackIcon />}
          >
            Volver
          </Button>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold", ml: 2 }}
          >
            Depositar Dinero
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Depositar Dinero
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
            Ingresa el monto que deseas depositar en tu cuenta.
            <br />
            El saldo se actualizará automáticamente después de confirmar el
            depósito.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <form onSubmit={handleDepositar}>
              <TextField
                label="Monto a Transferir"
                type="number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={loading ? null : <SendIcon />}
                sx={{ mt: 4, mb: 2, py: 1.5 }}
                disabled={loading || !monto}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Confirmar Depósito"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Depositar;
