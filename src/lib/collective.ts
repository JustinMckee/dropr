import { headers } from 'next/headers';
import type { Collective } from './collective-config';

export async function getCollective(): Promise<Collective> {
  const headersList = await headers();
  const collective = headersList.get('x-collective') as Collective;
  return collective || 'MOD';
}
