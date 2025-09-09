import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItem, updateMenuItem, getMenuCategories, createMenuItem } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, TextField, Button, MenuItem, Box, FormControlLabel, Checkbox } from "@mui/material";

const EMPTY_FORM = {
  id: undefined,
  category_id: "",
  name_pl: "",
  name_en: "",
  price_cents: "",
  image_url: "",
  is_available: true,
};

export default function MenuEditPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["menu", "categories"],
    queryFn: getMenuCategories,
  });

  const { data: menuItem, isLoading } = useQuery({
    queryKey: ["menu", "item", id],
    queryFn: () => getMenuItem(Number(id)),
    enabled: isEdit,
  });

  const [form, setForm] = useState<any>(EMPTY_FORM);

  useEffect(() => {
    if (isEdit && menuItem) {
      // Uzupełnij brakujące pola domyślnymi wartościami, jeśli menuItem ich nie ma
      setForm({ ...EMPTY_FORM, ...menuItem });
    } else if (!isEdit) {
      setForm(EMPTY_FORM);
    }
  }, [menuItem, isEdit]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      // Przy edycji backend wymaga wszystkich pól, łącznie z id
      // Przy dodawaniu nie podajemy id (backend go wygeneruje)
      const payload = isEdit ? { ...data, id: Number(id) } : { ...data };
      // Upewnij się, że category_id, price_cents są liczbami
      payload.category_id = Number(payload.category_id);
      payload.price_cents = Number(payload.price_cents);
      return isEdit
        ? updateMenuItem(Number(id), payload)
        : createMenuItem(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      navigate("/menu");
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target;
    setForm((f: any) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  if (isEdit && isLoading) return <Loading />;
  if (mutation.isError) return <ErrorInfo error={mutation.error} />;

  return (
    <Box maxWidth={480} mx="auto">
      <Typography variant="h5" mb={2}>
        {isEdit ? "Edytuj pozycję" : "Dodaj pozycję"}
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          select
          label="Kategoria"
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        >
          {categories.map((cat: any) => (
            <MenuItem key={cat.id} value={cat.id}>{cat.name_pl}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Nazwa (PL)"
          name="name_pl"
          value={form.name_pl}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Nazwa (EN)"
          name="name_en"
          value={form.name_en}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="Cena (gr)"
          name="price_cents"
          type="number"
          value={form.price_cents}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="URL obrazka"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          required
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={!!form.is_available}
              onChange={handleChange}
              name="is_available"
              color="primary"
            />
          }
          label="Dostępna"
        />
        <Button
          variant="contained"
          type="submit"
          sx={{ mt: 2 }}
          disabled={mutation.isPending}
        >
          {isEdit ? "Zapisz" : "Dodaj"}
        </Button>
      </form>
    </Box>
  );
}
