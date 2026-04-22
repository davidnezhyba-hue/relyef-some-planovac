import { DesignersManagement } from "@/components/designers/designers-management";

export const metadata = {
  title: "Grafičky | Video Plánovač",
};

export default function DesignersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-foreground">Grafičky</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Správa seznamu grafiček
        </p>
      </div>
      <DesignersManagement />
    </div>
  );
}
