import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItems, getMenuCategories, blockMenuItem, unblockMenuItem, deleteMenuItem } from "../services/api";
import { MenuTable } from "../components/MenuTable";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";

export default function MenuPage() {
  const queryClient = useQueryClient();
  const { data: items, isLoading, error } = useQuery({ queryKey: ["menu", "items"], queryFn: getMenuItems });
  const { data: categories = [] } = useQuery({ queryKey: ["menu", "categories"], queryFn: getMenuCategories });

  const blockMutation = useMutation({
    mutationFn: (id: number) => blockMenuItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menu", "items"] }),
  });
  const unblockMutation = useMutation({
    mutationFn: (id: number) => unblockMenuItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["menu", "items"] }),
  });

  // Stan do potwierdzania usuwania
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menu", "items"] });
      setDeletingId(null);
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorInfo error={error} />;

  return (
    <>
      <Typography variant="h5" mb={2}>Menu restauracji</Typography>
      <MenuTable
        items={items || []}
        categories={categories}
        onBlock={blockMutation.mutate}
        onUnblock={unblockMutation.mutate}
        onDelete={(id) => setDeletingId(id)}
      />
      <Button variant="contained" sx={{ mt: 2 }} href="/menu/new">Dodaj pozycję</Button>
      <Dialog open={!!deletingId} onClose={() => setDeletingId(null)}>
        <DialogTitle>Usuń pozycję</DialogTitle>
        <DialogContent>
          Czy na pewno chcesz usunąć tę pozycję menu? Tej operacji nie można cofnąć.
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
