"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "../../lib/query-client";
import { getSocket } from "../../lib/socket";

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const socket = getSocket();
    return () => {
      socket.disconnect();
    };
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
