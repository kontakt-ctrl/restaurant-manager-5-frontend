import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Paper, Typography, Box, TextField, Grid } from "@mui/material";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  ResponsiveContainer,
  Label,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getOrdersStatsByDay,
  getBestSellersByDay,
  getOrderHoursStatsByDay,
  getPaymentsStatsByDay,
} from "../services/api";

// DatePicker
function DatePicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <TextField
      type="date"
      size="small"
      value={value}
      label=""
      onChange={e => onChange(e.target.value)}
      sx={{ width: 170 }}
      inputProps={{ max: dayjs().format("YYYY-MM-DD") }}
    />
  );
}

const STATUS_COLORS: Record<string, string> = {
  completed: "#1976d2",
  pending: "#ffa726",
  failed: "#e53935",
};

export default function StatsPage() {
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));

  // Zamówienia (cały dzień)
  const { data: ordersStats, isLoading: isOrdersLoading, error: ordersError } = useQuery({
    queryKey: ["stats", "orders", date],
    queryFn: () => getOrdersStatsByDay(date),
  });

  // Bestsellery (cały dzień)
  const { data: bestsellers, isLoading: isBestsellersLoading, error: bestsellersError } = useQuery({
    queryKey: ["stats", "bestsellers", date],
    queryFn: () => getBestSellersByDay(date),
  });

  // Godziny szczytu (histogram)
  const { data: hoursStats, isLoading: isHoursLoading, error: hoursError } = useQuery({
    queryKey: ["stats", "hours", date],
    queryFn: () => getOrderHoursStatsByDay(date),
  });

  // Statystyki płatności
  const { data: payments, isLoading: isPaymentsLoading, error: paymentsError } = useQuery({
    queryKey: ["stats", "payments", date],
    queryFn: () => getPaymentsStatsByDay(date),
  });

  if (isOrdersLoading || isBestsellersLoading || isHoursLoading || isPaymentsLoading) return <Loading />;
  if (ordersError || bestsellersError || hoursError || paymentsError) return <ErrorInfo error={ordersError || bestsellersError || hoursError || paymentsError} />;

  // Przygotowanie danych do wykresów
  const bestsellerChartData = (bestsellers || []).map((item: any, idx: number) => ({
    name: item.name,
    Sprzedano: item.total,
    idx,
  }));

  const hoursChartData = (hoursStats || []).map((stat: any) => ({
    godzina: stat.hour,
    Zamówienia: stat.count,
  }));

  // Statystyki płatności
  const paymentsStats = payments || [];
  const sumPayments = paymentsStats.reduce((acc: number, p: any) => acc + (p.amount_cents || 0), 0) / 100;
  const countPayments = paymentsStats.length;
  const statusCount = paymentsStats.reduce((acc: Record<string, number>, p: any) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});
  const paymentsByTerminal = Object.entries(paymentsStats.reduce((acc: Record<string, number>, p: any) => {
    acc[p.hostname] = (acc[p.hostname] || 0) + p.amount_cents;
    return acc;
  }, {})).map(([hostname, total]) => ({
    hostname,
    total: (total / 100).toFixed(2),
  }));

  const pieData = Object.entries(statusCount).map(([status, count]) => ({
    name: status,
    value: count,
    fill: STATUS_COLORS[status] || "#888",
  }));

  return (
    <>
      <Box mb={3} display="flex" alignItems="center" gap={2}>
        <Typography variant="h5">
          Statystyki dla dnia: {date === dayjs().format("YYYY-MM-DD") ? "dzisiaj" : date}
        </Typography>
        <DatePicker value={date} onChange={setDate} />
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Liczba zamówień</Typography>
            <Typography variant="h3" color="primary" mt={2}>
              {ordersStats?.ordersCount ?? 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Najlepiej sprzedające
