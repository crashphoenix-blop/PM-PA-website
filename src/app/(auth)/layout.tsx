import { RequireAuthRoutes } from "@/features/auth/require-auth-routes";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <RequireAuthRoutes>{children}</RequireAuthRoutes>;
}
