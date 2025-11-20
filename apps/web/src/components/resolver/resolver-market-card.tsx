"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, BadgeCheck, Clock3, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MarketViewModel, OutcomeSide } from "@/types/market";
import { evaluateCondition, formatOperator } from "@/lib/oracle";
import { useLivePrice } from "@/lib/hooks/use-live-price";
import { formatNumber } from "@/lib/number";

type ResolverMarketCardProps = {
  market: MarketViewModel;
  onResolve: (market: MarketViewModel, outcome: OutcomeSide) => Promise<void>;
  refreshing?: boolean;
};

export function ResolverMarketCard({ market, onResolve, refreshing = false }: ResolverMarketCardProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const oracleConfig = market.resolverState.oracleConfig;
  const isManual = market.resolverState.source === "manual";
  const [manualOutcome, setManualOutcome] = useState<OutcomeSide>("yes");
  const { price, loading: priceLoading, error: priceError, lastUpdated } = useLivePrice(oracleConfig?.assetId, {
    enabled: Boolean(oracleConfig),
  });

  const evaluation = useMemo(() => {
    if (!oracleConfig) {
      return { status: "pending", reason: "incomplete_config" } as const;
    }
    return evaluateCondition(price, oracleConfig.operator, oracleConfig.targetValue);
  }, [oracleConfig, price]);

  const computedOutcome = useMemo<OutcomeSide | null>(() => {
    if (isManual) {
      return market.resolverState.readyToResolve ? manualOutcome : null;
    }

    if (!oracleConfig || !market.resolverState.readyToResolve) {
      return null;
    }

    if (evaluation.status === "pending") {
      return null;
    }

    return evaluation.status === "met" ? "yes" : "no";
  }, [evaluation.status, isManual, manualOutcome, market.resolverState.readyToResolve, oracleConfig]);

  const resolveLabel = (() => {
    if (!market.resolverState.closeTimeReached) {
      return "Awaiting close";
    }
    if (isManual) {
      return "Submit resolution";
    }
    if (oracleConfig && !computedOutcome) {
      return "Waiting for condition";
    }
    if (!computedOutcome) {
      return "Resolve";
    }
    return computedOutcome === "yes" ? "Resolve YES" : "Resolve NO";
  })();

  const handleResolve = async () => {
    if (!market.resolverState.canResolve || !computedOutcome) {
      return;
    }
    setIsResolving(true);
    setErrorMessage(null);
    try {
      await onResolve(market, computedOutcome);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Resolution failed");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-[#111827]">{market.title}</h3>
          {market.resolverState.source === "oracle" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E9F7EF] px-3 py-1 text-xs font-semibold text-[#217756]">
              <BadgeCheck className="h-3.5 w-3.5" />
              Oracle
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-semibold text-[#4B5563]">
              Manual
            </span>
          )}
        </div>
        <p className="text-sm text-[#4B5563]">{market.description ?? "No description provided."}</p>
      </header>

      <div className="rounded-2xl bg-[#F9FAFB] p-4 text-sm text-[#4B5563]">
        <div className="flex items-center gap-2 font-semibold text-[#111827]">
          <Clock3 className="h-4 w-4 text-[#35D07F]" />
          Closes{" "}
          {new Date(market.closeTime).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </div>
        <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
            <div className="font-medium text-[#111827]">Pool totals</div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between">
                <span>Yes</span>
                <span className="font-semibold text-[#217756]">{formatNumber(market.yesPool, 2)} cUSD</span>
              </div>
              <div className="flex items-center justify-between">
                <span>No</span>
                <span className="font-semibold text-[#B91C1C]">{formatNumber(market.noPool, 2)} cUSD</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
            <div className="font-medium text-[#111827]">Oracle condition</div>
            {oracleConfig ? (
              <ul className="mt-2 space-y-1">
                <li>
                  Asset: <span className="font-semibold text-[#111827]">{oracleConfig.assetId}</span>
                </li>
                <li>
                  Rule:{" "}
                  <span className="font-semibold text-[#111827]">
                    price {formatOperator(oracleConfig.operator)} {oracleConfig.targetValue.toLocaleString()} USD
                  </span>
                </li>
                {oracleConfig.expiry && (
                  <li>
                    Expiry:{" "}
                    <span className="font-semibold text-[#111827]">
                      {new Date(oracleConfig.expiry).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-2 text-[#9CA3AF]">No oracle metadata configured.</p>
            )}
          </div>
        </div>
      </div>

      {isManual && (
        <div className="rounded-2xl border border-dashed border-[#D1D5DB] bg-white p-4 text-sm text-[#4B5563]">
          <div className="font-semibold text-[#111827]">Select winning outcome</div>
          <p className="mt-1 text-xs text-[#6B7280]">
            Choose the correct outcome once the market has closed, then submit the on-chain resolution.
          </p>
          <div className="mt-3 flex gap-3">
            <button
              type="button"
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                manualOutcome === "yes"
                  ? "border-[#35D07F] bg-[#E9F7EF] text-[#217756]"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]"
              }`}
              onClick={() => setManualOutcome("yes")}
              disabled={!market.resolverState.readyToResolve}
            >
              Resolve YES
            </button>
            <button
              type="button"
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                manualOutcome === "no"
                  ? "border-[#DC2626] bg-red-50 text-[#B91C1C]"
                  : "border-[#E5E7EB] bg-[#F9FAFB] text-[#4B5563]"
              }`}
              onClick={() => setManualOutcome("no")}
              disabled={!market.resolverState.readyToResolve}
            >
              Resolve NO
            </button>
          </div>
        </div>
      )}

      {oracleConfig && (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 text-sm text-[#4B5563]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-[#111827]">Live price</span>
            {priceLoading && <Loader2 className="h-4 w-4 animate-spin text-[#35D07F]" />}
            {priceError && (
              <span className="inline-flex items-center gap-1 text-xs text-[#B91C1C]">
                <AlertTriangle className="h-4 w-4" />
                {priceError}
              </span>
            )}
            {price !== undefined && (
              <span className="text-base font-semibold text-[#111827]">${price.toLocaleString()}</span>
            )}
            {lastUpdated && (
              <span className="text-xs text-[#9CA3AF]">Updated {new Date(lastUpdated).toLocaleTimeString()}</span>
            )}
          </div>
          <div className="mt-2 text-xs text-[#6B7280]">
            {evaluation.status === "pending"
              ? "Waiting for condition to be decided."
              : evaluation.status === "met"
              ? "Condition met — ready to resolve YES."
              : "Condition missed — ready to resolve NO."}
          </div>
        </div>
      )}

      {errorMessage && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{errorMessage}</p>}

      {market.status === "Resolved" || market.status === "Void" ? (
        <div className="rounded-2xl border-2 border-[#D1D5DB] bg-[#F9FAFB] p-4 text-center">
          <p className="text-sm font-semibold text-[#6B7280] uppercase tracking-wide mb-2">
            Market Resolved
          </p>
          {market.winningOutcome && (
            <p className="text-sm text-[#4B5563]">
              Winning outcome: <span className="font-semibold text-[#35D07F]">{market.winningOutcome.toUpperCase()}</span>
            </p>
          )}
          {market.status === "Void" && (
            <p className="text-sm font-semibold text-[#DC2626] mt-2">
              Market was voided
            </p>
          )}
        </div>
      ) : (
        <Button
          className="w-full rounded-2xl bg-[#35D07F] text-sm font-semibold text-white hover:bg-[#29b46e] disabled:cursor-not-allowed disabled:opacity-60"
          onClick={handleResolve}
          disabled={
            refreshing ||
            isResolving ||
            !market.resolverState.canResolve ||
            !computedOutcome ||
            market.status !== "Live" ||
            market.status === "Resolved" ||
            market.status === "Void"
          }
        >
          {isResolving ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Resolving…
            </span>
          ) : (
            resolveLabel
          )}
        </Button>
      )}
    </article>
  );
}

