import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPayments } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function PaymentsPage() {
  const { data: payments, isLoading, error } = useQuery({
    queryKey: ["payments"],
    queryFn: getPayments,
  });
  const navigate = useNavigate();

  if (isLoading) return <Loading />;
  if (error) return <ErrorInfo error={error} />;

  return (
    <>
      <Typography variant="h5" mb={2}>Płatności</Typography>
      <Button variant="contained" sx={{ mb: 2 }} onClick={() => navigate("/payments/new")}>
        Dodaj płatność
      </Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Kwota</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Terminal</TableCell>
            <TableCell>Opis</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(payments || []).map((p: any) => (
            <TableRow key={p.id}>
              <TableCell>{p.id}</TableCell>
              <TableCell>{(p.amount_cents / 100).toFixed(2)} PLN</TableCell>
              <TableCell>
                <Chip label={p.status} color={p.status === "completed" ? "success" : p.status === "pending" ? "warning" : "error"} />
              </TableCell>
              <TableCell>{new Date(p.created_at).toLocaleString()}</TableCell>
              <TableCell>{p.hostname}</TableCell>
              <TableCell>{p.description}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/payments/${p.id}`)}
                >
                  Szczegóły
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {(payments?.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} align="center">Brak płatności</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </>
  );
}
