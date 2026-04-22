import { VideoTable } from "@/components/videos/video-table";

export const metadata = {
  title: "Dashboard | Video Plánovač",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-5 border-b border-border bg-background">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Přehled a správa videí
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <VideoTable />
      </div>
    </div>
  );
}
