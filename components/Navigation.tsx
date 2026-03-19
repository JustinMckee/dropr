import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/UserNav";
import { auth } from "@/auth";

export async function Navigation() {
  const session = await auth();
  const user = session?.user;

  return (
    <nav className="border-b border-border bg-background/95 supports-[backdrop-filter]:bg-background/60 z-10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold">
              dropr
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/drops"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Drops
              </Link>
              <Link
                href="/preorders"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Pre-orders
              </Link>
              <Link
                href="/makers"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                Makers
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <UserNav
                user={{
                  displayName: user.name || user.email || 'User',
                  email: user.email || '',
                  role: user.role || 'member',
                  photoUrl: user.image
                }}
              />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
