import React from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, Button, Chip,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function MenuTable({
  items,
  categories,
  onBlock,
  onUnblock,
}: {
  items: any[];
  categories: any[];
  onBlock: (id: number) => void;
  onUnblock: (id: number) => void;
}) {
  function getCategoryName(id: number) {
    return categories.find((c: any) => c.id === id)?.name_pl || "-";
  }
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nazwa</TableCell>
          <TableCell>Kategoria</TableCell>
          <TableCell>Cena (PLN)</TableCell>
          <TableCell>Dostępność</TableCell>
          <TableCell></TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.name_pl}</TableCell>
            <TableCell>{getCategoryName(item.category_id)}</TableCell>
            <TableCell>{(item.price_cents / 100).toFixed(2)}</TableCell>
            <TableCell>
              {item.is_available === false ? (
                <Chip label="Zablokowana" color="error" />
              ) : (
                <Chip label="Dostępna" color="success" />
              )}
            </TableCell>
            <TableCell>
              {item.is_available === false ? (
                <Button size="small" onClick={() => onUnblock(item.id)}>
                  Odblokuj
                </Button>
              ) : (
                <Button size="small" color="warning" onClick={() => onBlock(item.id)}>
                  Zablokuj
                </Button>
              )}
              <Button
                size="small"
                variant="outlined"
                component={RouterLink}
                to={`/menu/${item.id}/edit`}
                sx={{ ml: 1 }}
              >
                Edytuj
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
