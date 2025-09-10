import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItem, updateMenuItem, getMenuCategories, createMenuItem } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, TextField, Button, MenuItem, Box } from "@mui/material";

export default function MenuEditPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categories = [] } = useQuery({ queryKey: ["menu", "categories"], queryFn: getMenuCategories });
  const { data: menuItem, isLoading } = useQuery({
    queryKey: ["menu", "item", id],
    queryFn: () => getMenuItem(Number(id)),
    enabled: isEdit,
  });

  // Ustaw form jako null, potem ustaw po pobraniu menuItem
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (isEdit) {
      if (menuItem) {
        setForm({
          category_id: String(menuItem.category_id ?? ""),
          name_pl: menuItem.name_pl ?? "",
          price_cents: String(menuItem.price_cents ?? ""),
        });
      }
    } else {
      setForm({
        category_id: "",
        name_pl: "",
        price_cents: "",
      });
    }
  }, [menuItem, isEdit]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      if (isEdit) return updateMenuItem(Number(id), { ...data, price_cents: Number(data.price_cents), category_id: Number(data.category_id) });
      return createMenuItem({ ...data, price_cents: Number(data.price_cents), category_id: Number(data.category_id) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      navigate("/menu");
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((f: any) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form) {
      mutation.mutate(form);
    }
  }

  if ((isEdit && (isLoading || !form)) || !form) return <Loading />;

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
            <MenuItem key={cat.id} value={String(cat.id)}>{cat.name_pl}</MenuItem>
          ))}
        </TextField>
        <TextField label="Nazwa (PL)" name="name_pl" value={form.name_pl} onChange={handleChange}
          required fullWidth margin="normal" />
        <TextField label="Cena (gr)" name="price_cents" type="number" value={form.price_cents} onChange={handleChange}
          required fullWidth margin="normal" />
        <Button variant="contained" type="submit" sx={{ mt: 2 }}>
          {isEdit ? "Zapisz" : "Dodaj"}
        </Button>
      </form>
    </Box>
  );
}
