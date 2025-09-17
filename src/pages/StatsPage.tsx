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

function sumPayments(payments: any[]): number {
  return payments.reduce((acc, p) => acc + (p.amount_cents || 0), 0) / 100;
}
function maxPayment(payments: any[]): number {
  return Math.max(0, ...payments.map(p => p.amount_cents || 0)) / 100;
}
function avgPayment(payments: any[]): number {
  return payments.length ? sumPayments(payments) / payments.length : 0;
}
function sumPaymentsMonth(payments: any[], month: string): number {
  // month = "2025-09"
  return payments
    .filter(p => p.created_at && p.created_at.startsWith(month))
    .reduce((acc, p) => acc + (p.amount_cents || 0), 0) / 100;
}
function countPaymentsAbove(payments: any[], threshold: number): number {
  return payments.filter(p => (p.amount_cents || 0) >= threshold).length;
}

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

  // Statystyki płatności (wszystkie płatności danego dnia)
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
  const sumPaymentsDay = sumPayments(paymentsStats);
  const maxPaymentsDay = maxPayment(paymentsStats);
  const avgPaymentsDay = avgPayment(paymentsStats);
  const countPaymentsDay = paymentsStats.length;
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

  // Łączna kwota płatności w miesiącu
  const monthStr = dayjs(date).format("YYYY-MM");
  const sumPaymentsMonthValue = sumPaymentsMonth(paymentsStats, monthStr);
  // Zamówienia powyżej 100 PLN
  const countPaymentsAbove100 = countPaymentsAbove(paymentsStats, 10000);

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
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Łączna kwota płatności (ten dzień)</Typography>
            <Typography variant="h4" color="primary">{sumPaymentsDay.toFixed(2)} PLN</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Najdroższa płatność (ten dzień)</Typography>
            <Typography variant="h5" color="secondary">{maxPaymentsDay > 0 ? `${maxPaymentsDay.toFixed(2)} PLN` : '-'}</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Średnia wartość płatności</Typography>
            <Typography variant="h5">{avgPaymentsDay > 0 ? `${avgPaymentsDay.toFixed(2)} PLN` : '-'}</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Łączna kwota płatności w miesiącu</Typography>
            <Typography variant="h5">{sumPaymentsMonthValue.toFixed(2)} PLN</Typography>
          </Paper>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{`Duże zamówienia (\u003e100 PLN)`}</Typography>
            <Typography variant="h5">{countPaymentsAbove100}</Typography>
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
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Statystyki płatności</Typography>
            <Typography>Suma płatności: <b>{sumPaymentsDay.toFixed(2)} PLN</b></Typography>
            <Typography>Liczba transakcji: <b>{countPaymentsDay}</b></Typography>
            <Box>
              <PieChart width={250} height={200}>
                <Pie
                  data={pieData}
                  cx={120}
                  cy={100}
                  innerRadius={40}
                  outerRadius={70}
                  label
                  dataKey="value"
                >
                  {pieData.map((entry, idx) => <Cell key={`cell-${idx}`} fill={entry.fill} />)}
                </Pie>
                <Legend />
              </PieChart>
            </Box>
            <Typography sx={{ mt: 2 }}>Podział wg terminala:</Typography>
            {paymentsByTerminal.map(pt => (
              <Typography key={pt.hostname}>
                {pt.hostname}: <b>{pt.total} PLN</b>
              </Typography>
            ))}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
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
