import { useEffect, useRef, useState } from "react";

type UseLivePriceOptions = {
  pollingMs?: number;
  enabled?: boolean;
};

type PriceState = {
  price?: number;
  loading: boolean;
  error?: string;
  lastUpdated?: string;
};

const DEFAULT_OPTIONS: UseLivePriceOptions = {
  pollingMs: 15_000,
  enabled: true,
};

export function useLivePrice(assetId?: string, options: UseLivePriceOptions = {}): PriceState {
  const { pollingMs, enabled } = { ...DEFAULT_OPTIONS, ...options };
  const [state, setState] = useState<PriceState>({ loading: Boolean(enabled && assetId) });
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!assetId || !enabled) {
      setState((prev) => ({ ...prev, loading: false }));
      return () => undefined;
    }

    let isMounted = true;

    async function fetchPrice() {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${assetId}&vs_currencies=usd`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch price: ${response.statusText}`);
        }

        const data = (await response.json()) as Record<string, { usd: number }>;
        const price = assetId ? data[assetId]?.usd : undefined;

        if (isMounted) {
          setState({
            price: typeof price === "number" ? price : undefined,
            loading: false,
            lastUpdated: new Date().toISOString(),
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            price: undefined,
            loading: false,
            error: error instanceof Error ? error.message : "Unknown pricing error",
            lastUpdated: new Date().toISOString(),
          });
        }
      }
    }

    fetchPrice();

    if (!pollingMs) {
      return () => {
        isMounted = false;
        controllerRef.current?.abort();
      };
    }

    const interval = setInterval(fetchPrice, pollingMs);

    return () => {
      isMounted = false;
      controllerRef.current?.abort();
      clearInterval(interval);
    };
  }, [assetId, enabled, pollingMs]);

  return state;
}

