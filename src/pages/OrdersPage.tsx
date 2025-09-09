import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPendingOrders } from "../services/api";
import { OrdersTable } from "../components/OrdersTable";
import { Loading } from "../components/Loading";
import { ErrorInfo } from "../components/ErrorInfo";
import { Typography } from "@mui/material";

export default function OrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["orders", "pending"],
    queryFn: getPendingOrders,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorInfo error={error} />;

  return (
    <>
      <Typography variant="h5" mb={2}>Zamówienia oczekujące</Typography>
      <OrdersTable orders={data || []} showActions />
    </>
  );
}