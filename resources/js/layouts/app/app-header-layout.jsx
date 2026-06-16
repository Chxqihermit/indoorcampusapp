import { AppContent } from "@/components/app-content";
import { AppHeader } from "@/components/app-header";
import { AppShell } from "@/components/app-shell";
function AppHeaderLayout({
  children,
  breadcrumbs
}) {
  return <AppShell>
            <AppHeader breadcrumbs={breadcrumbs} />
            <AppContent>{children}</AppContent>
        </AppShell>;
}
export {
  AppHeaderLayout as default
};
