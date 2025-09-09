import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, createUser, updateUser } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, TextField, Button, MenuItem, Box, Paper } from "@mui/material";

const ROLES = [
  { value: "admin", label: "Administrator" },
  { value: "manager", label: "Manager" },
];

export default function UserEditPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Przy edycji pobieramy użytkownika
  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
    enabled: isEdit,
  });

  const editingUser = isEdit ? users?.find((u: any) => String(u.id) === String(id)) : null;

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "manager",
  });

  useEffect(() => {
    if (isEdit && editingUser) {
      setForm({
        username: editingUser.username,
        password: "",
        role: editingUser.role,
      });
    }
  }, [isEdit, editingUser]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      setError(null);
      if (isEdit) {
        await updateUser(Number(id), data);
      } else {
        await createUser(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      navigate("/users");
    },
    onError: (err: any) => setError(err.message),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  if (isEdit && isLoading) return <Loading />;

  return (
    <Box maxWidth={400} mx="auto">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>
          {isEdit ? "Edytuj użytkownika" : "Dodaj użytkownika"}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Login"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          />
          <TextField
            label="Hasło"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
            autoComplete="new-password"
          />
          <TextField
            select
            label="Rola"
            name="role"
            value={form.role}
            onChange={handleChange}
            required
            fullWidth
            margin="normal"
          >
            {ROLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
            ))}
          </TextField>
          {error && <Typography color="error" mt={1}>{error}</Typography>}
          <Button variant="contained" type="submit" sx={{ mt: 2 }} disabled={mutation.isPending}>
            {isEdit ? "Zapisz zmiany" : "Dodaj użytkownika"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
