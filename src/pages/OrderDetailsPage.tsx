import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOrderDetails } from "../services/api";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const orderNumber = id; // order_number może być stringiem
  const { data: order, isLoading, error } = useQuery({
    queryKey: ["orders", orderNumber],
    queryFn: () => getOrderDetails(orderNumber),
    enabled: !!orderNumber,
  });

  if (isLoading) return <Loading />;
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
            <ListItemText primary={`ID pozycji: ${item.menu_item_id}`} secondary={`Ilość: ${item.quantity}`} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
