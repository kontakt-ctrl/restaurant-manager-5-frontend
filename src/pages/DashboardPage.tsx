import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getPendingOrders, getOrdersDailyStats, getBestsellers, getPaymentsStatsByDay } from "../services/api";
import { OrdersTable } from "../components/OrdersTable";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";

function sumPayments(payments: any[]): number {
  return payments.reduce((acc, p) => acc + (p.amount_cents || 0), 0) / 100;
}
function maxPayment(payments: any[]): number {
  return Math.max(0, ...payments.map(p => p.amount_cents || 0)) / 100;
}
function avgPayment(payments: any[]): number {
  return payments.length ? sumPayments(payments) / payments.length : 0;
}

export default function DashboardPage() {
  const { data: pendingOrders, isLoading: isPendingLoading, error: pendingError } = useQuery({
    queryKey: ["orders", "pending"],
    queryFn: getPendingOrders,
  });
  const { data: ordersDaily, isLoading: isDailyLoading, error: dailyError } = useQuery({
    queryKey: ["stats", "orders-daily"],
    queryFn: getOrdersDailyStats,
  });
  const { data: bestsellers, isLoading: isBestsellersLoading, error: bestsellersError } = useQuery({
    queryKey: ["stats", "bestsellers"],
    queryFn: getBestsellers,
  });
  // Płatności dzisiaj
  const todayStr = new Date().toISOString().slice(0, 10);
  const { data: paymentsToday, isLoading: isPaymentsLoading, error: paymentsError } = useQuery({
    queryKey: ["payments", "today", todayStr],
    queryFn: () => getPaymentsStatsByDay(todayStr),
  });

  if (isPendingLoading || isDailyLoading || isBestsellersLoading || isPaymentsLoading)
    return <Loading />;

  if (pendingError || dailyError || bestsellersError || paymentsError)
    return <ErrorInfo error={pendingError || dailyError || bestsellersError || paymentsError} />;

  const totalPaymentsToday = sumPayments(paymentsToday || []);
  const maxPaymentsToday = maxPayment(paymentsToday || []);
  const avgPaymentsToday = avgPayment(paymentsToday || []);
  const countPaymentsToday = (paymentsToday || []).length;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={1}>Oczekujące zamówienia</Typography>
          <OrdersTable orders={pendingOrders || []} showActions />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Ilość zrealizowanych zamówień (dzisiaj)</Typography>
          {ordersDaily?.map((stat: any) => (
            <Typography key={stat.terminal_name}>
              {stat.terminal_name}: <b>{stat.orders_done}</b>
            </Typography>
          ))}
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Łączna suma płatności (dzisiaj)</Typography>
          <Typography variant="h4" color="primary">{totalPaymentsToday.toFixed(2)} PLN</Typography>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Najdroższa płatność (dzisiaj)</Typography>
          <Typography variant="h5" color="secondary">{maxPaymentsToday > 0 ? `${maxPaymentsToday.toFixed(2)} PLN` : '-'}</Typography>
        </Paper>
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6">Średnia wartość płatności (dzisiaj)</Typography>
          <Typography variant="h6">{avgPaymentsToday > 0 ? `${avgPaymentsToday.toFixed(2)} PLN` : '-'}</Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Bestsellery (dzisiaj)</Typography>
          {bestsellers?.map((item: any) =>
            <Typography key={item.name}>{item.name}: <b>{item.total}</b></Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
