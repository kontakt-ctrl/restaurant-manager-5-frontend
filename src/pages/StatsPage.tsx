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
  Label
} from "recharts";
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
            <Typography variant="h6" sx={{ mb: 2 }}>Najlepiej sprzedające się produkty (wykres kreskowy)</Typography>
            <ResponsiveContainer width="100%" minHeight={420}>
              <LineChart
                data={bestsellerChartData}
                margin={{ top: 40, right: 60, left: 20, bottom: 90 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={85}
                  style={{ fontSize: 15, fontFamily: "Roboto, Arial, sans-serif" }}
                />
                <YAxis allowDecimals={false}>
                  <Label angle={-90} value="Sprzedano" position="insideLeft" style={{ fontSize: 16 }} />
                </YAxis>
                <Tooltip />
                <Line type="monotone" dataKey="Sprzedano" stroke="#1976d2" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Godziny szczytu (najwięcej zamówień wg godzin)</Typography>
            <ResponsiveContainer width="100%" minHeight={360}>
              <BarChart
                data={hoursChartData}
                margin={{ top: 40, right: 40, left: 25, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="godzina"
                  interval={0}
                  angle={0}
                  height={50}
                  style={{ fontSize: 15, fontFamily: "Roboto, Arial, sans-serif" }}
                >
                  <Label value="Godzina" position="insideBottom" style={{ fontSize: 16 }} />
                </XAxis>
                <YAxis allowDecimals={false}>
                  <Label angle={-90} value="Zamówienia" position="insideLeft" style={{ fontSize: 16 }} />
                </YAxis>
                <Tooltip />
                <Bar dataKey="Zamówienia" fill="#1976d2" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
