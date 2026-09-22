import { useState, useEffect, useRef, useCallback } from "react";
import {
  PageSpeedTarget,
  PageSpeedAuditResult,
  PageSpeedSyncLogEntry,
  SyncServiceConfig,
  loadSyncConfig,
  saveSyncConfig,
  loadSyncLogs,
  saveSyncLogs,
  executeBatchPageSpeedSync,
  PageSpeedMetricSnapshot,
} from "../services/pagespeedSyncService";

interface UsePageSpeedSyncServiceProps {
  targets: PageSpeedTarget[];
  userName?: string;
  userDomain?: string;
  userSpeedScore?: number;
  onResults?: (results: PageSpeedAuditResult[]) => void;
}

export function usePageSpeedSyncService({
  targets,
  userName = "Siteniz",
  userDomain = "sitemiz.com.tr",
  userSpeedScore = 98,
  onResults,
}: UsePageSpeedSyncServiceProps) {
  const [config, setConfig] = useState<SyncServiceConfig>(loadSyncConfig);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStep, setSyncStep] = useState<string>("");
  const [countdown, setCountdown] = useState<number>(config.intervalSeconds);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Henüz senkronize edilmedi");
  const [lastDurationMs, setLastDurationMs] = useState<number>(0);
  const [syncLogs, setSyncLogs] = useState<PageSpeedSyncLogEntry[]>(loadSyncLogs);
  const [liveAuditMap, setLiveAuditMap] = useState<Map<string, PageSpeedAuditResult>>(new Map());
  const [activeAlert, setActiveAlert] = useState<{ message: string; timestamp: number } | null>(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState<boolean>(false);

  // Keep previous metrics for delta calculations
  const previousMetricsMapRef = useRef<Map<string, PageSpeedMetricSnapshot>>(new Map());
  const isSyncingRef = useRef<boolean>(false);
  isSyncingRef.current = isSyncing;

  // Derive consolidated list of targets: User + Competitors
  const fullTargets: PageSpeedTarget[] = [
    {
      id: "user-profile",
      name: `${userName} (Siz)`,
      domain: userDomain,
      rank: 1,
      isUser: true,
      baseSpeed: userSpeedScore,
    },
    ...targets.map((t, idx) => ({
      id: t.id || `comp-${idx + 1}`,
      name: t.name,
      domain: t.domain,
      url: t.url || (t.domain.startsWith("http") ? t.domain : `https://${t.domain}`),
      rank: t.rank || idx + 1,
      isUser: false,
      baseSpeed: t.baseSpeed,
    })),
  ];

  // Perform full batch sync
  const performSync = useCallback(
    async (manualTargetId?: string) => {
      if (isSyncingRef.current) return;
      setIsSyncing(true);
      setSyncStep("Google PSI v5 API ile bağlantı kuruluyor...");

      try {
        const queryTargets = manualTargetId
          ? fullTargets.filter((t) => t.id === manualTargetId)
          : fullTargets;

        setTimeout(() => {
          setSyncStep(
            manualTargetId
              ? `${manualTargetId} için Core Web Vitals verileri çekiliyor...`
              : `Tüm rakip URL'leri (${queryTargets.length}) Google PageSpeed motoruna gönderiliyor...`
          );
        }, 300);

        const { results, log } = await executeBatchPageSpeedSync(
          queryTargets,
          config.device,
          previousMetricsMapRef.current
        );

        // Update live map
        setLiveAuditMap((prev) => {
          const nextMap = new Map(prev);
          results.forEach((res) => {
            nextMap.set(res.id, res);
            previousMetricsMapRef.current.set(res.id, res.metrics);
          });
          return nextMap;
        });

        // Trigger onResults callback if provided
        if (onResults) {
          try {
            onResults(results);
          } catch (_e) {
            // ignore
          }
        }

        // Update logs
        setSyncLogs((prev) => {
          const updated = [log, ...prev].slice(0, 30);
          saveSyncLogs(updated);
          return updated;
        });

        setLastSyncTime(log.timeFormatted);
        setLastDurationMs(log.durationMs);

        // Check if there are critical alerts
        if (log.alerts && log.alerts.length > 0) {
          setActiveAlert({
            message: log.alerts[0],
            timestamp: Date.now(),
          });
        }
      } catch (err: any) {
        console.error("PageSpeed Sync failed:", err);
      } finally {
        setIsSyncing(false);
        setSyncStep("");
        // Reset countdown timer
        setCountdown(config.intervalSeconds);
      }
    },
    [fullTargets, config.device, config.intervalSeconds]
  );

  // Countdown timer for automatic synchronization
  useEffect(() => {
    // If autoSync is disabled or interval is 0 (off), do not run timer
    if (!config.autoSyncEnabled || config.intervalSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger sync automatically
          performSync();
          return config.intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [config.autoSyncEnabled, config.intervalSeconds, performSync]);

  // Initial sync on mount if map is empty
  useEffect(() => {
    if (liveAuditMap.size === 0) {
      performSync();
    }
  }, [performSync, liveAuditMap.size]);

  // Toggle Auto-Sync
  const toggleAutoSync = () => {
    setConfig((prev) => {
      const next = { ...prev, autoSyncEnabled: !prev.autoSyncEnabled };
      saveSyncConfig(next);
      if (next.autoSyncEnabled) {
        setCountdown(next.intervalSeconds);
      }
      return next;
    });
  };

  // Change Interval
  const setSyncInterval = (seconds: number) => {
    setConfig((prev) => {
      const next = {
        ...prev,
        intervalSeconds: seconds,
        autoSyncEnabled: seconds > 0,
      };
      saveSyncConfig(next);
      setCountdown(seconds);
      return next;
    });
  };

  // Switch Device Strategy
  const setDeviceStrategy = (device: "mobile" | "desktop") => {
    setConfig((prev) => {
      const next = { ...prev, device };
      saveSyncConfig(next);
      return next;
    });
    // Trigger immediate refresh with new device
    setTimeout(() => performSync(), 50);
  };

  // Manual Trigger
  const triggerManualSync = (targetId?: string) => {
    performSync(targetId);
  };

  // Dismiss alert
  const dismissAlert = () => {
    setActiveAlert(null);
  };

  // Clear logs
  const clearLogs = () => {
    setSyncLogs([]);
    saveSyncLogs([]);
  };

  return {
    config,
    isSyncing,
    syncStep,
    countdown,
    lastSyncTime,
    lastDurationMs,
    syncLogs,
    liveAuditMap,
    activeAlert,
    isLogsModalOpen,
    setIsLogsModalOpen,
    triggerManualSync,
    toggleAutoSync,
    setSyncInterval,
    setDeviceStrategy,
    dismissAlert,
    clearLogs,
  };
}
