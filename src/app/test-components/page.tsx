import { getCollective } from '@/lib/collective';
import { getCollectiveConfig } from '@/lib/collective-config';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default async function TestComponentsPage() {
  const collective = await getCollective();
  const config = getCollectiveConfig(collective);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Component Test Page</h1>
          <p className="text-muted-foreground">
            Testing shadcn/ui components with {config.name} theming
          </p>
          <Badge className="mt-2 bg-collective text-white">
            {collective}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sample Drop Card</CardTitle>
            <CardDescription>
              This is a sample drop card using shadcn/ui components
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Drop Title</Label>
              <Input id="title" placeholder="Enter drop title..." />
            </div>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input id="price" type="number" placeholder="49.99" />
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button className="bg-collective hover:bg-collective/90">
              Create Drop
            </Button>
            <Button variant="outline">Cancel</Button>
          </CardFooter>
        </Card>

        <Alert>
          <AlertTitle>Collective Theming Active</AlertTitle>
          <AlertDescription>
            The primary color for {config.name} is {config.color.primary}
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-collective hover:bg-collective/90">
                Primary
              </Button>
              <Button variant="secondary" className="w-full">
                Secondary
              </Button>
              <Button variant="outline" className="w-full">
                Outline
              </Button>
              <Button variant="ghost" className="w-full">
                Ghost
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-collective text-white">Collective</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pattern Background</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`h-32 rounded-md pattern-${config.pattern} bg-muted`} />
              <p className="text-sm text-muted-foreground mt-2">
                Pattern: {config.pattern}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
