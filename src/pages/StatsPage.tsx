import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrdersDailyStats, getBestsellers } from "../services/api";
import { Paper, Typography, List, ListItem, ListItemText, Grid } from "@mui/material";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";

export default function StatsPage() {
  const { data: ordersDaily, isLoading: isOrdersLoading, error: ordersError } = useQuery({
    queryKey: ["stats", "orders-daily"],
    queryFn: getOrdersDailyStats,
  });
  const { data: bestsellers, isLoading: isBestsellersLoading, error: bestsellersError } = useQuery({
    queryKey: ["stats", "bestsellers"],
    queryFn: getBestsellers,
  });

  if (isOrdersLoading || isBestsellersLoading) return <Loading />;
  if (ordersError || bestsellersError) return <ErrorInfo error={ordersError || bestsellersError} />;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Liczba zamówień zrealizowanych dzisiaj – Terminale</Typography>
          <List>
            {ordersDaily?.map((stat: any) => (
              <ListItem key={stat.terminal_name}>
                <ListItemText primary={stat.terminal_name} secondary={`Zamówień: ${stat.orders_done}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6">Najlepiej sprzedające się produkty (dzisiaj)</Typography>
          <List>
            {bestsellers?.map((item: any) => (
              <ListItem key={item.name}>
                <ListItemText primary={item.name} secondary={`Sprzedano: ${item.total}`} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}