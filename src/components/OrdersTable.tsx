import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button,
} from "@mui/material";

export function OrdersTable({ orders, showActions = false }: { orders: any[]; showActions?: boolean }) {
  const navigate = useNavigate();
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>ID</TableCell>
          <TableCell>Numer zamówienia</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Typ</TableCell>
          <TableCell>Utworzone</TableCell>
          {showActions && <TableCell></TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell>{order.id}</TableCell>
            <TableCell>{order.order_number}</TableCell>
            <TableCell>{order.status}</TableCell>
            <TableCell>{order.type}</TableCell>
            <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
            {showActions && (
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  Szczegóły
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}