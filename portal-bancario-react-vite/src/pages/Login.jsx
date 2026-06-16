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
} from "@mui/material";

import InputAdornment from "@mui/material/InputAdornment";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import LockIcon from "@mui/icons-material/Lock";
import AddCardIcon from "@mui/icons-material/AddCard";
import LoginIcon from '@mui/icons-material/Login';

function Login() {
  const [usuario, setUsuario] = useState("");
  const [secreto, setSecreto] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!usuario || !secreto) {
      setError("Por favor, ingresa tu usuario y contraseña.");
      return;
    }

    setLoading(true);
    try {
      // El microservicio UsuariosCuentas corre en el puerto 7046 (https)
      const response = await fetch(
        "http://localhost:8071/api/CuentaUsuario/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ usuario, secreto }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar el token de forma segura en localStorage
        localStorage.setItem("jwt_token", data.token);
        // Redirigir al dashboard
        navigate("/dashboard");
      } else {
        setError(data.mensaje || "Credenciales incorrectas");
      }
    } catch (err) {
      setError(
        "Error al conectar con el servidor. Verifica que los servicios estén encendidos.",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card sx={{ width: "100%", p: 2 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <AccountBalanceIcon
              color="primary"
              fontSize="large"
              sx={{ float: "left" }}
            />
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ mt: 1, ml: 6, float: "left" }}
            >
              Banquito de isra
            </Typography>

            <div style={{ clear: "both" }}></div>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body1"
              fontWeight="bold"
              sx={{ mt: 2, mb: 1, textAlign: "center" }}
            >
              Iniciar Sesión
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              label="Usuario"
              variant="outlined"
              fullWidth
              type="email"
              required
              margin="normal"
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
              required
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
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || !usuario || !secreto}
              startIcon={<LoginIcon />}
            >
              {loading ? <CircularProgress size={24} /> : "Acceder"}
            </Button>
          </form>

          <Button
            type="button"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3, mb: 2 }}
            startIcon={<AddCardIcon />}
            onClick={() => navigate("/crear-cuenta")}
          >
            Crear cuenta
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export default Login;
