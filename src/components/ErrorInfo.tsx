import React from "react";
import { Alert } from "@mui/material";

export function ErrorInfo({ error }: { error: any }) {
  return <Alert severity="error">{error?.message || "Wystąpił błąd"}</Alert>;
}