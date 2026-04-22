export default function SettingsPage() {
  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-2">Nastavení</h1>
      <p className="text-muted-foreground mb-8">
        Globální nastavení aplikace.
      </p>

      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div>
          <h2 className="text-base font-medium mb-1">Supabase</h2>
          <p className="text-sm text-muted-foreground">
            Připojení k databázi se konfiguruje přes proměnné prostředí{" "}
            <code className="bg-muted px-1 rounded text-xs">
              NEXT_PUBLIC_SUPABASE_URL
            </code>{" "}
            a{" "}
            <code className="bg-muted px-1 rounded text-xs">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </code>
            .
          </p>
        </div>

        <hr className="border-border" />

        <div>
          <h2 className="text-base font-medium mb-1">Verze</h2>
          <p className="text-sm text-muted-foreground">
            relyef-some-planovac v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
