import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { DropStatus } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * SSE endpoint for real-time drop updates
 * Streams countdown, inventory, and status changes
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial data
        const drops = await fetchActiveDrops();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(drops)}\n\n`));

        // Update every second
        const interval = setInterval(async () => {
          try {
            const drops = await fetchActiveDrops();
            const data = drops.map((drop) => ({
              id: drop.id,
              inventory: drop.inventory,
              status: drop.status,
              // Client calculates countdown from these timestamps
              startTime: drop.startTime?.toISOString(),
              endTime: drop.endTime?.toISOString(),
            }));

            controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          } catch (error) {
            console.error('SSE update error:', error);
          }
        }, 1000);

        // Cleanup on client disconnect
        req.signal.addEventListener('abort', () => {
          clearInterval(interval);
          controller.close();
        });
      } catch (error) {
        console.error('SSE initialization error:', error);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

async function fetchActiveDrops() {
  return await prisma.drop.findMany({
    where: {
      status: { in: [DropStatus.LIVE, DropStatus.SCHEDULED] },
    },
    select: {
      id: true,
      inventory: true,
      status: true,
      startTime: true,
      endTime: true,
    },
  });
}
