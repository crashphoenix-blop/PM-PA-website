import { RequireAppAccess } from "@/features/auth/require-app-access";
import { BottomNav } from "@/shared/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAppAccess>
      {children}
      <BottomNav />
    </RequireAppAccess>
  );
}
