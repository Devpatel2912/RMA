import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';

export const useTickets = () => {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/tickets`);
      return res.data;
    },
    // Don't refetch on window focus for internal tool unless needed
    refetchOnWindowFocus: false,
  });
};

export const useTicket = (id) => {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/tickets/${id}`);
      return res.data;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/categories`);
      return res.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const res = await axios.get(`${baseUrl}/vendors`);
      return res.data;
    },
    refetchOnWindowFocus: false,
  });
};
