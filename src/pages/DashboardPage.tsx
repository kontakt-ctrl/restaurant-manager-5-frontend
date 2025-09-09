import React from "react";
import { Grid, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getPendingOrders, getOrdersDailyStats, getBestsellers } from "../services/api";
import { OrdersTable } from "../components/OrdersTable";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";

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

  if (isPendingLoading || isDailyLoading || isBestsellersLoading)
    return <Loading />;

  if (pendingError || dailyError || bestsellersError)
    return <ErrorInfo error={pendingError || dailyError || bestsellersError} />;

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