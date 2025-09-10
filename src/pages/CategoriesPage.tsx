import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCategories, deleteCategory } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: categories, isLoading, error } = useQuery({ queryKey: ["categories"], queryFn: getCategories });

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingId(null);
    }
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorInfo error={error} />;

  return (
    <>
      <Typography variant="h5" mb={2}>Kategorie produktów</Typography>
      <Button
        variant="contained"
        sx={{ mb: 2 }}
        component={RouterLink}
        to="/categories/new"
      >
        Dodaj kategorię
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Nazwa (PL)</TableCell>
            <TableCell>Nazwa (EN)</TableCell>
            <TableCell>Obrazek</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories?.map((cat: any) => (
            <TableRow key={cat.id}>
              <TableCell>{cat.id}</TableCell>
              <TableCell>{cat.name_pl}</TableCell>
              <TableCell>{cat.name_en}</TableCell>
              <TableCell>
                {cat.image_url && <img src={cat.image_url} alt="" style={{ maxWidth: 48, maxHeight: 30 }} />}
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                  component={RouterLink}
                  to={`/categories/${cat.id}/edit`}
                >
                  Edytuj
                </Button>
                <Button
                  color="error"
                  size="small"
                  onClick={() => setDeletingId(cat.id)}
                >
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!deletingId} onClose={() => setDeletingId(null)}>
        <DialogTitle>Usuń kategorię</DialogTitle>
        <DialogContent>
          Czy na pewno chcesz usunąć tę kategorię? Tej operacji nie można cofnąć.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingId(null)}>Anuluj</Button>
          <Button
            onClick={() => deletingId && deleteMutation.mutate(deletingId)}
            color="error"
            disabled={deleteMutation.isPending}
          >
            Usuń
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
