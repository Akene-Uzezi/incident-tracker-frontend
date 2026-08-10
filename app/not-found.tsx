import Link from "next/link";
import { CompassIcon, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CompassIcon className="h-8 w-8" />
      </span>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved.
        </p>
      </div>
      <Link href="/">
        <Button className="gap-2 rounded-xl">
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </Link>
    </div>
  );
}
