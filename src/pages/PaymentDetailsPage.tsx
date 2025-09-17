import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getPayment } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography, Paper, Chip } from "@mui/material";

export default function PaymentDetailsPage() {
  const { id } = useParams<{ id?: string }>();
  const { data: payment, isLoading, error } = useQuery({
    queryKey: ["payments", id],
    queryFn: () => getPayment(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorInfo error={error} />;
  if (!payment) return <Typography>Nie znaleziono płatności.</Typography>;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>Szczegóły płatności #{payment.id}</Typography>
      <Typography>Kwota: <b>{(payment.amount_cents / 100).toFixed(2)} PLN</b></Typography>
      <Typography>Status: <Chip label={payment.status} color={payment.status === "completed" ? "success" : payment.status === "pending" ? "warning" : "error"} /></Typography>
      <Typography>Numer zamówienia: {payment.order_number}</Typography>
      <Typography>Terminal: {payment.hostname}</Typography>
      <Typography>Opis: {payment.description || "-"}</Typography>
      <Typography>Terminal log: {payment.terminal_log || "-"}</Typography>
      <Typography>Data utworzenia: {new Date(payment.created_at).toLocaleString()}</Typography>
    </Paper>
  );
}
