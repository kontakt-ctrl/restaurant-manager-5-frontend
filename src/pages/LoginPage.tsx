import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Button, Box, Typography, Paper } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password);
      navigate("/dashboard");
    } catch (e) {
      setError("Nieprawidłowy login lub hasło.");
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper sx={{ p: 4, minWidth: 320 }}>
        <Typography variant="h5" mb={2}>Logowanie</Typography>
        <form onSubmit={handleSubmit}>
          <TextField label="Login" fullWidth required margin="normal"
            value={username} onChange={e => setUsername(e.target.value)} />
          <TextField label="Hasło" type="password" fullWidth required margin="normal"
            value={password} onChange={e => setPassword(e.target.value)} />
          {error && <Typography color="error" mt={1}>{error}</Typography>}
          <Button variant="contained" fullWidth type="submit" sx={{ mt: 2 }}>Zaloguj się</Button>
        </form>
      </Paper>
    </Box>
  );
}