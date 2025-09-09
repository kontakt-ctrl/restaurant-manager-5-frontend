import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMenuItems, getMenuCategories, blockMenuItem, unblockMenuItem } from "../services/api";
import { MenuTable } from "../components/MenuTable";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, Button } from "@mui/material";

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
      />
      <Button variant="contained" sx={{ mt: 2 }} href="/menu/new">Dodaj pozycję</Button>
    </>
  );
}