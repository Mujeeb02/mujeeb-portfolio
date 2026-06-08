"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="min-h-screen grid place-items-center bg-background p-6 text-center font-mono">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-bold text-destructive">System fault</h1>
            <p className="text-muted-foreground">
              Something failed while rendering this route.
            </p>
            <Button type="button" variant="outline" onClick={reset}>
              Retry
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
