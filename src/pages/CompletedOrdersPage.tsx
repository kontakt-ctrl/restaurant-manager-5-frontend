import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCompletedOrders } from "../services/api";
import {
  Typography, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";

function DatePicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  return (
    <TextField
      type="date"
      value={value}
      onChange={e => onChange(e.target.value)}
      size="small"
      sx={{ width: 160 }}
      inputProps={{ max: dayjs().format("YYYY-MM-DD") }}
    />
  );
}

function formatDateTime(dateStr: string | null | undefined) {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm");
}

function timeDiffMinutes(start: string, end: string) {
  if (!start || !end) return "-";
  const diffMs = dayjs(end).diff(dayjs(start), "minute");
  return `${diffMs} min`;
}

export default function CompletedOrdersPage() {
  const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders", "completed", date],
    queryFn: () => getCompletedOrders(date),
  });
  const [selected, setSelected] = useState<any | null>(null);

  return (
    <Box>
      <Box mb={2} display="flex" alignItems="center" gap={2}>
        <Typography variant="h5">Zamówienia zrealizowane {date === dayjs().format("YYYY-MM-DD") ? "dzisiaj" : date}</Typography>
        <IconButton aria-label="Wybierz datę" onClick={() => {}}>
          <CalendarTodayIcon />
        </IconButton>
        <DatePicker value={date} onChange={setDate} />
      </Box>
      {isLoading && <Typography>Ładowanie...</Typography>}
      {error && <Typography color="error">{(error as any).message || "Błąd"}</Typography>}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Numer zamówienia</TableCell>
            <TableCell>Data zam.</TableCell>
            <TableCell>Status</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {(orders || []).map((order: any) => (
            <TableRow key={order.id}>
              <TableCell>{order.order_number}</TableCell>
              <TableCell>{formatDateTime(order.created_at)}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => setSelected(order)}
                >
                  Szczegóły
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {orders?.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">Brak zamówień</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Szczegóły zamówienia */}
      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Szczegóły zamówienia</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography><b>Numer zamówienia:</b> {selected.order_number}</Typography>
              <Typography><b>Data złożenia:</b> {formatDateTime(selected.created_at)}</Typography>
              <Typography><b>Data przyjęcia w kuchni:</b> {formatDateTime(selected.accepted_at)}</Typography>
              <Typography><b>Data wydania:</b> {formatDateTime(selected.ready_at)}</Typography>
              <Typography><b>Czas oczekiwania klienta:</b> {timeDiffMinutes(selected.created_at, selected.ready_at)}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>Zamknij</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
