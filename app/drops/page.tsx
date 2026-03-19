import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DropsPage() {
  const drops = [
    {
      id: "1",
      slug: "walnut-desk-organizer",
      title: "Limited Edition Walnut Desk Organizer",
      maker: "WoodCraft Studio",
      price: 89,
      remaining: 12,
      total: 50,
      endsIn: "2h 34m",
      image: null,
    },
    {
      id: "2",
      slug: "3d-printed-planters",
      title: "Geometric Succulent Planters Set",
      maker: "PrintLab",
      price: 45,
      remaining: 28,
      total: 100,
      endsIn: "1d 5h",
      image: null,
    },
    {
      id: "3",
      slug: "leather-cable-organizer",
      title: "Handstitched Leather Cable Organizer",
      maker: "Leather & Co",
      price: 35,
      remaining: 5,
      total: 30,
      endsIn: "4h 12m",
      image: null,
    },
  ];

  return (
    <main className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Live Drops</h1>
          <p className="text-lg text-muted-foreground">
            Limited quantities available now. Once they're gone, they're gone.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <Button variant="secondary" size="sm">All Categories</Button>
          <Button variant="ghost" size="sm">Woodworking</Button>
          <Button variant="ghost" size="sm">3D Printing</Button>
          <Button variant="ghost" size="sm">Electronics</Button>
          <Button variant="ghost" size="sm">Crafts</Button>
        </div>

        {/* Drops Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drops.map((drop) => (
            <Link
              key={drop.id}
              href={`/drops/${drop.slug}`}
              className="group relative overflow-hidden rounded-lg border border-border bg-card hover:shadow-lg transition"
            >
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Product Image</span>
              </div>

              {/* Content */}
              <div className="p-6 space-y-3">
                {/* Timer & Stock */}
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-muted-foreground">
                    Ends in {drop.endsIn}
                  </span>
                  <span className={drop.remaining < 10 ? "text-destructive" : "text-muted-foreground"}>
                    {drop.remaining} left
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-lg group-hover:text-primary transition line-clamp-2">
                  {drop.title}
                </h3>

                {/* Maker */}
                <p className="text-sm text-muted-foreground">
                  by {drop.maker}
                </p>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-2xl font-bold">${drop.price}</span>
                  <Button size="sm">View Drop</Button>
                </div>

                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${((drop.total - drop.remaining) / drop.total) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {drop.total - drop.remaining} of {drop.total} claimed
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
