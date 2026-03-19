import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight">
              Where makers launch,
              <br />
              <span className="text-muted-foreground">communities thrive</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover limited drops, pre-orders, and unique projects from indie makers.
              One platform for everything you need to support your favorite creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/drops">Browse Drops</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/makers">Explore Makers</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Drops */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Live Drops</h2>
              <p className="text-muted-foreground mt-2">Limited quantities, don't miss out</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/drops">View all →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition"
              >
                <div className="aspect-square bg-muted" />
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Ends in 2h 34m
                    </span>
                    <span className="text-xs font-medium text-destructive">
                      12 left
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition">
                    Limited Edition Wooden Desk Organizer
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    Handcrafted walnut organizer with brass accents. Only 50 made.
                  </p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-2xl font-bold">$89</span>
                    <Button size="sm">View Drop</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Pre-orders */}
      <section className="py-16 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Upcoming Pre-orders</h2>
              <p className="text-muted-foreground mt-2">Reserve your spot for future launches</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/preorders">View all →</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="aspect-video sm:aspect-square sm:w-1/3 bg-muted" />
                  <div className="flex-1 p-6 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                        Pre-order
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ships March 2026
                      </span>
                    </div>
                    <h3 className="font-semibold text-xl group-hover:text-primary transition">
                      Custom Mechanical Keyboard Kit
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Premium aluminum case with hot-swap PCB. Limited to 100 units.
                    </p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-2xl font-bold">$249</span>
                      <Button size="sm">Pre-order Now</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How Dropr Works</h2>
            <p className="text-muted-foreground">
              Supporting makers and building community has never been easier
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold text-lg">Discover</h3>
              <p className="text-sm text-muted-foreground">
                Browse curated drops and pre-orders from trusted indie makers
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold text-lg">Support</h3>
              <p className="text-sm text-muted-foreground">
                Back projects you love with secure payments and buyer protection
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold text-lg">Connect</h3>
              <p className="text-sm text-muted-foreground">
                Join maker communities and get exclusive access to future launches
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to launch your next project?
            </h2>
            <p className="text-lg opacity-90">
              Join hundreds of makers using Dropr to connect with their communities
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/register">Become a Maker</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
