import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const deleteM = useMutation({
    mutationFn: (id: number) => deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorInfo error={error} />;

  return (
    <>
      <Typography variant="h5" mb={2}>Użytkownicy</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell><TableCell>Login</TableCell><TableCell>Rola</TableCell><TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.map((u: any) => (
            <TableRow key={u.id}>
              <TableCell>{u.id}</TableCell>
              <TableCell>{u.username}</TableCell>
              <TableCell>{u.role}</TableCell>
              <TableCell>
                <Button
                  color="error"
                  size="small"
                  onClick={() => deleteM.mutate(u.id)}
                  disabled={deleteM.isPending}
                >
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}