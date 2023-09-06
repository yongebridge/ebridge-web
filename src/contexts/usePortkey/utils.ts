import detectProvider from '@portkey/detect-provider';

import { IPortkeyProvider } from '@portkey/provider-types';

export async function getPortInstants(): Promise<null | IPortkeyProvider> {
  const provider: null | IPortkeyProvider = await detectProvider();
  return provider;
}
