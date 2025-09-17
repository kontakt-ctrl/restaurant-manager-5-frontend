import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createPayment } from "../services/api";
import { Typography, TextField, Button, Paper, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PaymentCreatePage() {
  const [form, setForm] = useState({
    hostname: "",
    order_number: "",
    amount_cents: "",
    status: "pending",
    terminal_log: "",
    description: "",
  });
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      await createPayment({
        hostname: data.hostname,
        order_number: Number(data.order_number),
        amount_cents: Number(data.amount_cents),
        status: data.status,
        terminal_log: data.terminal_log,
        description: data.description,
      });
    },
    onSuccess: () => navigate("/payments"),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <Box maxWidth={420} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" mb={2}>Dodaj płatność</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Numer zamówienia"
            name="order_number"
            value={form.order_number}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Kwota (gr)"
            name="amount_cents"
            value={form.amount_cents}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            type="number"
          />
          <TextField
            label="Terminal"
            name="hostname"
            value={form.hostname}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Opis"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Terminal log"
            name="terminal_log"
            value={form.terminal_log}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <Button variant="contained" type="submit" sx={{ mt: 2 }} disabled={mutation.isPending}>
            Dodaj płatność
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
