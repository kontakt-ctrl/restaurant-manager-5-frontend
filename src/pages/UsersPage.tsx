import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, deleteUser } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function UsersPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Użytkownicy</Typography>
        <Button variant="contained" onClick={() => navigate("/users/new")}>Dodaj użytkownika</Button>
      </Box>
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
                  size="small"
                  variant="outlined"
                  sx={{ mr: 1 }}
                  onClick={() => navigate(`/users/${u.id}/edit`)}
                >
                  Edytuj
                </Button>
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
