import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuth } from "../providers/AuthProvider";

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Portal Menadżerski
          </Typography>
          <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>
          <Button color="inherit" component={Link} to="/orders">Zamówienia</Button>
          <Button color="inherit" component={Link} to="/orders/completed">Zamówienia zrealizowane</Button>
          <Button color="inherit" component={Link} to="/menu">Menu</Button>
          <Button color="inherit" component={Link} to="/categories">Kategorie</Button>
          <Button color="inherit" component={Link} to="/stats">Statystyki</Button>
          {user?.role === "admin" && (
            <Button color="inherit" component={Link} to="/users">Użytkownicy</Button>
          )}
          <Button color="inherit" onClick={() => { logout(); navigate("/login"); }}>
            Wyloguj
          </Button>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </>
  );
}
