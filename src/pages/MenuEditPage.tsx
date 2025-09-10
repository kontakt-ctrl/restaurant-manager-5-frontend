import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItem, updateMenuItem, getMenuCategories, createMenuItem } from "../services/api";
import { Loading } from "../components/Loading";
import { Typography, TextField, Button, MenuItem, Box, FormControlLabel, Switch } from "@mui/material";

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

  // Dodaj pole is_available do stanu!
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (isEdit) {
      if (menuItem) {
        setForm({
          category_id: String(menuItem.category_id ?? ""),
          name_pl: menuItem.name_pl ?? "",
          name_en: menuItem.name_en ?? "",
          price_cents: String(menuItem.price_cents ?? ""),
          image_url: menuItem.image_url ?? "",
          is_available: menuItem.is_available ?? true,
        });
      }
    } else {
      setForm({
        category_id: "",
        name_pl: "",
        name_en: "",
        price_cents: "",
        image_url: "",
        is_available: true,
      });
    }
  }, [menuItem, isEdit]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = {
        ...(isEdit ? { id: Number(id) } : {}),
        category_id: Number(data.category_id),
        name_pl: data.name_pl,
        name_en: data.name_en,
        price_cents: Number(data.price_cents),
        image_url: data.image_url,
        is_available: Boolean(data.is_available),
      };
      if (isEdit) return updateMenuItem(Number(id), payload);
      return createMenuItem(payload);
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
        <TextField label="Nazwa (EN)" name="name_en" value={form.name_en} onChange={handleChange}
          required fullWidth margin="normal" />
        <TextField label="Cena (gr)" name="price_cents" type="number" value={form.price_cents} onChange={handleChange}
          required fullWidth margin="normal" />
        <TextField
          label="Adres obrazka (URL)"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {form.image_url && (
          <Box sx={{ my: 2, textAlign: "center" }}>
            <img
              src={form.image_url}
              alt="Podgląd obrazka"
              style={{ maxWidth: 200, maxHeight: 150, border: "1px solid #eee" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </Box>
        )}
        <FormControlLabel
          control={
            <Switch
              checked={!!form.is_available}
              onChange={handleChange}
              name="is_available"
              color="primary"
            />
          }
          label="Dostępna pozycja"
          sx={{ mt: 2 }}
        />
        <Button variant="contained" type="submit" sx={{ mt: 2 }}>
          {isEdit ? "Zapisz" : "Dodaj"}
        </Button>
      </form>
    </Box>
  );
}
