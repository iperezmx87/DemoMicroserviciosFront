import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";

import InputAdornment from "@mui/material/InputAdornment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LockIcon from "@mui/icons-material/Lock";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";

function CrearCuenta() {
  const [usuario, setUsuario] = useState("");
  const [secreto, setSecreto] = useState("");
  const [propietario, setPropietario] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCrearCuenta = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!usuario || !secreto || !propietario) {
      setError("Por favor, ingresa los campos requeridos.");
      return;
    }

    setLoading(true);

    try {
      // El microservicio CuentaMovimientos corre en el puerto 7172 (https)
      const response = await fetch("http://localhost:8071/api/CuentaUsuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario, secreto, propietario }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al realizar el depósito.");
      }

      setSuccess(
        data.mensaje,
      );

      setError("");
      setUsuario("");
      setPropietario("");
      setSecreto("");

      setTimeout(() => {
        navigate("/");
      }, 10000);
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
            onClick={() => navigate("/login")}
            startIcon={<ArrowBackIcon />}
          >
            Volver
          </Button>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1, fontWeight: "bold", ml: 2 }}
          >
            Crear cuenta
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 6 }}>
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

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" color="text.primary">
            Aquí podrás crear una cuenta bancaria.
            <br />
            Ingrese los datos requeridos.
          </Typography>
        </Box>

        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3 }}>
          <CardContent>
            <form onSubmit={handleCrearCuenta}>
              <TextField
                label="Usuario"
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                required
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AssignmentIndIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={secreto}
                onChange={(e) => setSecreto(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <TextField
                label="Propietario"
                variant="outlined"
                fullWidth
                margin="normal"
                value={propietario}
                onChange={(e) => setPropietario(e.target.value)}
                disabled={loading}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
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
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Crear cuenta"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

export default CrearCuenta;
