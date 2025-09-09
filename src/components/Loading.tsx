import React from "react";
import { CircularProgress, Box } from "@mui/material";

export function Loading() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
      <CircularProgress />
    </Box>
  );
}