import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Paper, Typography, Box, TextField, Grid } from "@mui/material";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, ResponsiveContainer } from "recharts";

// --- MOCK API FUNCTIONS ---
// Zamiast prawdziwych API, podmień na swoje endpointy z parametrem daty!
import {
  getOrdersStatsByDay,
  getBestSellersByDay,
  getOrderHoursStatsByDay
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

export default function StatsPage() {
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));

  // Liczba zamówień (cały dzień)
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

  if (isOrdersLoading || isBestsellersLoading || isHoursLoading) return <Loading />;
  if (ordersError || bestsellersError || hoursError) return <ErrorInfo error={ordersError || bestsellersError || hoursError} />;

  // Przygotowanie danych do wykresów
  const bestsellerChartData = (bestsellers || []).map((item: any, idx: number) => ({
    name: item.name,
    Sprzedano: item.total,
    idx,
  }));

  const hoursChartData = (hoursStats || []).map((stat: any) => ({
    godzina: stat.hour, // np. '09', '10', '11', ...
    Zamówienia: stat.count,
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
            <Typography variant="h6">Najlepiej sprzedające się produkty (wykres kreskowy)</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={bestsellerChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="Sprzedano" stroke="#1976d2" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Godziny szczytu (najwięcej zamówień wg godzin)</Typography>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={hoursChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="godzina" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="Zamówienia" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}

/*
W pliku src/services/api.ts musisz mieć funkcje:
- getOrdersStatsByDay(date: string): Promise<{ordersCount: number}>
- getBestSellersByDay(date: string): Promise<{name: string, total: number}[]>
- getOrderHoursStatsByDay(date: string): Promise<{hour: string, count: number}[]>

Przykład implementacji:
export async function getOrdersStatsByDay(date: string) { ... }
export async function getBestSellersByDay(date: string) { ... }
export async function getOrderHoursStatsByDay(date: string) { ... }
*/
