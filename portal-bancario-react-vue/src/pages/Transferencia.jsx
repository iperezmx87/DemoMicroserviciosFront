import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Button,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SearchIcon from "@mui/icons-material/Search";

import { jwtDecode } from "jwt-decode";

function Transferencia() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cuentaOrigenId, setCuentaOrigenId] = useState("");
  const [cuentaDestinoId, setCuentaDestinoId] = useState("");
  const [monto, setMonto] = useState("");

  const token = localStorage.getItem("jwt_token");

  const buscarInput = useRef(null);
  const montoInput = useRef(null);

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

      setCuentaOrigenId(idCuenta);

      buscarInput.current.focus();
    } catch (err) {
      console.error("Error:", err);
      localStorage.removeItem("jwt_token");
      navigate("/login");
    }
  }, [navigate, token]);

  const buscarCuentaDestino = async (e) => {
    if (e.key !== "Enter") return false;
    e.preventDefault();

    setError("");

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8071/api/CuentaUsuario/obtener-cuenta/${e.target.value}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        navigate("/login");
        return;
      }

      if (response.status === 404) {
        setError("No se encontró una cuenta con ese usuario.");
        setCuentaDestinoId("");
        return;
      }

      const data = await response.json();

      setCuentaDestinoId(data.cuenta.idCuenta);

      montoInput.current.focus();
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

  const handleTransferir = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!cuentaDestinoId || !monto || monto <= 0) {
      setError(
        "Por favor, ingresa un monto válido y el ID de la cuenta destino.",
      );
      return;
    }

    setLoading(true);

    try {
      // El microservicio CuentaMovimientos corre en el puerto 7172 (https)
      const response = await fetch(
        `http://localhost:8070/api/Cuentas/transferir`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cuentaOrigenId,
            cuentaDestinoId,
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
        throw new Error(data.error || "Error al realizar la transferencia.");
      }

      setSuccess(
        "¡Transferencia realizada con éxito! El saldo se actualizará en breve.",
      );

      buscarInput.current.value = "";
      setCuentaDestinoId("");
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
            Transferencia
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Enviar Dinero
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>
            Transfiere fondos de manera segura a otras cuentas
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
            <form onSubmit={handleTransferir}>
              <TextField
                label="Buscar cuenta a enviar el dinero por usuario"
                variant="outlined"
                fullWidth
                onKeyUp={buscarCuentaDestino}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 2 }}
                inputRef={buscarInput}
              />

              <TextField
                disabled
                label="Cuenta destino (ID)"
                value={cuentaDestinoId}
                sx={{ mb: 2 }}
                fullWidth
              />

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
                inputRef={montoInput}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                startIcon={loading ? null : <SendIcon />}
                sx={{ mt: 4, mb: 2, py: 1.5 }}
                disabled={loading || !cuentaDestinoId || !monto}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Confirmar Transferencia"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default Transferencia;
