import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AppRoutes } from '@/config/routes';
import { AnalyticsListener } from '@/components/AnalyticsListener';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ToastProvider>
            <AnalyticsListener />
            <AppRoutes />
          </ToastProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
