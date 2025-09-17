import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderDetails, getMenuItems, getPaymentsByOrderNumber } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Paper, Typography, List, ListItem, ListItemText, Table, TableHead, TableRow, TableCell, TableBody, Chip } from "@mui/material";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const orderNumber = Number(id);
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["orders", orderNumber],
    queryFn: () => getOrderDetails(orderNumber),
    enabled: !!orderNumber,
  });

  // Pobieranie menu
  const { data: menuItems } = useQuery({
    queryKey: ["menu", "items"],
    queryFn: getMenuItems,
  });

  // Pobieranie powiązanych płatności
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments", order?.order_number],
    queryFn: () => getPaymentsByOrderNumber(order?.order_number),
    enabled: !!order,
  });

  function getMenuItemName(id: number) {
    return menuItems?.find((item: any) => item.id === id)?.name_pl || `ID pozycji: ${id}`;
  }

  if (isLoading || !menuItems) return <Loading />;
  if (error) return <ErrorInfo error={error} />;
  if (!order) return <Typography>Nie znaleziono zamówienia.</Typography>;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Szczegóły zamówienia #{order.order_number}
      </Typography>
      <Typography>Status: {order.status}</Typography>
      <Typography>Typ: {order.type}</Typography>
      <Typography>Utworzone: {new Date(order.created_at).toLocaleString()}</Typography>
      <Typography variant="h6" mt={2}>Produkty:</Typography>
      <List>
        {order.items.map((item: any) => (
          <ListItem key={item.id}>
            <ListItemText
              primary={getMenuItemName(item.menu_item_id)}
              secondary={`Ilość: ${item.quantity}`}
            />
          </ListItem>
        ))}
      </List>
      <Typography variant="h6" mt={2}>Płatności:</Typography>
      {paymentsLoading ? <Loading /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Kwota</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Terminal</TableCell>
              <TableCell>Opis</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(payments || []).map((p: any) => (
              <TableRow key={p.id}>
                <TableCell>{(p.amount_cents / 100).toFixed(2)} PLN</TableCell>
                <TableCell>
                  <Chip label={p.status} color={p.status === "completed" ? "success" : p.status === "pending" ? "warning" : "error"} />
                </TableCell>
                <TableCell>{new Date(p.created_at).toLocaleString()}</TableCell>
                <TableCell>{p.hostname}</TableCell>
                <TableCell>{p.description}</TableCell>
              </TableRow>
            ))}
            {(payments?.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} align="center" style={{ color: "#aaa" }}>Brak płatności powiązanych z zamówieniem</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
