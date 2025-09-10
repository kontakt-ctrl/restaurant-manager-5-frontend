import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, createCategory, updateCategory } from "../services/api";
import { Loading } from "../components/Loading";
import { Typography, TextField, Button, Box, Paper } from "@mui/material";

export default function CategoryEditPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Przy edycji pobieramy kategorię
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    enabled: isEdit,
  });

  const editingCategory = isEdit ? categories?.find((cat: any) => String(cat.id) === String(id)) : null;

  const [form, setForm] = useState({
    name_pl: "",
    name_en: "",
    image_url: "",
  });

  useEffect(() => {
    if (isEdit && editingCategory) {
      setForm({
        name_pl: editingCategory.name_pl,
        name_en: editingCategory.name_en,
        image_url: editingCategory.image_url,
      });
    }
  }, [isEdit, editingCategory]);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      if (isEdit) {
        await updateCategory(Number(id), data);
      } else {
        await createCategory(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      navigate("/categories");
    },
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
          {isEdit ? "Edytuj kategorię" : "Dodaj kategorię"}
        </Typography>
        <form onSubmit={handleSubmit}>
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
                style={{ maxWidth: 180, maxHeight: 80, border: "1px solid #eee" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </Box>
          )}
          <Button variant="contained" type="submit" sx={{ mt: 2 }} disabled={mutation.isPending}>
            {isEdit ? "Zapisz zmiany" : "Dodaj kategorię"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}
