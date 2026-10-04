import React, { useState, useEffect } from "react";
import { ThemeTemplate, ColorPalette, SiteConfig, PlatformView, FormLead, NewsletterSubscriber, CustomerPanelTab } from "./types";
import { TEMPLATES, COLOR_PALETTES } from "./data/templates";
import { createDefaultSiteConfig, createNeutralSiteConfig } from "./data/mockData";
import { checkAndCreateDailyBackup } from "./utils/backupManager";
import { Header } from "./components/Header";
import { MarketingLanding } from "./components/MarketingLanding";
import { CustomerWizard } from "./components/CustomerWizard";
import { CustomerDashboard } from "./components/CustomerDashboard";
import { AdminSuperPanel } from "./components/AdminSuperPanel";
import { TemplateCatalog } from "./components/TemplateCatalog";
import { LivePreviewFrame } from "./components/LivePreviewFrame";
import { StaticDeployModal } from "./components/StaticDeployModal";
import { StrategicAnalysisView } from "./components/StrategicAnalysisView";
import { AiTemplateFactory } from "./components/AiTemplateFactory";
import { calculateLeadScore } from "./utils/leadScoring";
import { dispatchLeadNotification } from "./utils/leadNotificationDispatcher";
import { useAuth } from "./context/AuthContext";
import { AuthModal } from "./components/auth/AuthModal";
import { TrialGatekeeper } from "./components/TrialGatekeeper";

export default function App() {
  const [currentView, setCurrentView] = useState<PlatformView>("marketing");
  const [customerDashboardTab, setCustomerDashboardTab] = useState<CustomerPanelTab>("general");
  const [templates, setTemplates] = useState<ThemeTemplate[]>(TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<ThemeTemplate>(TEMPLATES[0]);

  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalInitialTab, 
    redirectAfterLoginView, 
    setRedirectAfterLoginView,
    isAuthenticated,
    activeWorkspaceId,
    user,
    isAdmin,
    isTeamMember,
    openAuthModal
  } = useAuth();
  
  // Single source of truth for the active site
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem("jetkur_active_site_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.companyName && !parsed.companyName.includes("Yıldız")) {
          if (!parsed.testimonials) {
            parsed.testimonials = { enabled: false, items: [] };
          }
          if (!parsed.gallery) {
            parsed.gallery = { enabled: false, items: [] };
          }
          if (!parsed.faqs) {
            parsed.faqs = { enabled: false, items: [] };
          }
          if (!parsed.subscribers) {
            parsed.subscribers = [];
          }
          if (!parsed.socialFeed || !parsed.socialFeed.posts) {
            parsed.socialFeed = createNeutralSiteConfig().socialFeed;
          }
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return createNeutralSiteConfig();
  });

  // Server-Authoritative Active Site Loader for Authenticated Customer
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    async function loadActiveSite() {
      try {
        const res = await fetch("/api/tenants/active-site", {
          credentials: "include",
          headers: {
            "Accept": "application/json",
            ...(activeWorkspaceId ? { "x-workspace-id": activeWorkspaceId } : {}),
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (data.siteConfig) {
              setSiteConfig(data.siteConfig);
            } else if (data.requiresOnboarding) {
              setSiteConfig(createNeutralSiteConfig());
              setCurrentView("wizard");
            }
          }
        }
      } catch (err) {
        console.warn("Could not load active site from server:", err);
      }
    }

    loadActiveSite();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, activeWorkspaceId]);

  // Keep active state saved locally and sync to server if authenticated with an active site
  useEffect(() => {
    try {
      const scopedKey = activeWorkspaceId ? `jetkur_active_site_config_${activeWorkspaceId}` : "jetkur_active_site_config";
      localStorage.setItem(scopedKey, JSON.stringify(siteConfig));
      localStorage.setItem("jetkur_active_site_config", JSON.stringify(siteConfig));
      checkAndCreateDailyBackup(siteConfig);
    } catch {
      // ignore
    }

    const targetSiteId = (siteConfig as any).siteId || siteConfig.id;
    if (isAuthenticated && targetSiteId && !targetSiteId.startsWith("site-fresh-")) {
      const handler = setTimeout(async () => {
        try {
          await fetch(`/api/tenants/sites/${targetSiteId}/sync`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(activeWorkspaceId ? { "x-workspace-id": activeWorkspaceId } : {}),
            },
            body: JSON.stringify({ siteConfig }),
          });
        } catch {
          // ignore background sync errors
        }
      }, 1000);

      return () => clearTimeout(handler);
    }
  }, [siteConfig, isAuthenticated, activeWorkspaceId]);

  // Listen for real leads sent from the embedded static HTML form via window.postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "HIZLIWEB_FORM_LEAD") {
        const leadData = event.data.data;
        const assignedVariant = (leadData.heroVariant as "A" | "B") || (Math.random() < 0.5 ? "A" : "B");
        const thankYouCfg = siteConfig.leadThankYouEmail || siteConfig.customForm?.thankYouEmail;
        const willSendThankYou = Boolean(thankYouCfg?.enabled && leadData.email);
        const currentTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const configuredDelay = Number(thankYouCfg?.delayMinutes ?? 5);
        const hasDelay = willSendThankYou && configuredDelay > 0;

        let scheduledMinutes = configuredDelay;
        let scheduledForStr: string | undefined = undefined;

        if (hasDelay) {
          if (thankYouCfg?.delayRandomWindow !== false) {
            const jitter = Math.round((Math.random() * 2 - 1) * 1.5);
            scheduledMinutes = Math.max(1, configuredDelay + jitter);
          }
          const scheduledDate = new Date(Date.now() + scheduledMinutes * 60 * 1000);
          const timeFormatted = scheduledDate.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
          scheduledForStr = `${timeFormatted} (${scheduledMinutes} dk doğal gecikme)`;
        }

        const newLead: FormLead = {
          id: `lead-${Date.now()}`,
          name: leadData.name || "Anonim Ziyaretçi",
          phone: leadData.phone || "0532 000 00 00",
          email: leadData.email || "",
          serviceOrProduct: leadData.serviceOrProduct || leadData.service || "Genel Bilgi & Teklif Talebi",
          message: leadData.message || "Web sitenizdeki form üzerinden gönderildi.",
          date: currentTime + " (Bugün)",
          status: "new",
          isRead: false,
          heroVariant: assignedVariant,
          sourcePage: leadData.sourcePage || "İletişim Formu",
          customFields: leadData.customFields,
          attachments: leadData.attachments,
          thankYouEmailSent: Boolean(leadData.thankYouEmailSent || (!hasDelay && willSendThankYou)),
          thankYouEmailSentAt: leadData.thankYouEmailSentAt || (!hasDelay && willSendThankYou ? `Bugün ${currentTime}` : undefined),
          thankYouEmailStatus: leadData.thankYouEmailStatus || (hasDelay ? "queued" : willSendThankYou ? "delivered" : undefined),
          thankYouEmailScheduledFor: scheduledForStr || leadData.thankYouEmailScheduledFor,
          thankYouEmailDelayMinutes: scheduledMinutes
        };

        // Lead Scoring Calculation
        const scoreResult = calculateLeadScore(newLead, siteConfig.leadNotifications?.scoring);
        newLead.leadScore = scoreResult.score;
        newLead.leadScorePriority = scoreResult.priority;
        newLead.leadScoreReasons = scoreResult.reasons;

        // Auto-dispatch high priority Slack and/or Email notification
        if (siteConfig.leadNotifications?.enabled ?? true) {
          dispatchLeadNotification(newLead, siteConfig)
            .then(res => {
              if (res.log) {
                setSiteConfig(prev => ({
                  ...prev,
                  leadNotifications: {
                    ...(prev.leadNotifications || ({} as any)),
                    history: [res.log!, ...(prev.leadNotifications?.history || [])]
                  }
                }));
              }
            })
            .catch(err => console.warn("Lead notification dispatch error:", err));
        }

        if (willSendThankYou && leadData.email) {
          fetch("/api/send-lead-thank-you-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lead: newLead,
              thankYouConfig: thankYouCfg,
              companyName: siteConfig.companyName,
              phone: siteConfig.phone,
              email: siteConfig.email,
              delayMinutes: hasDelay ? scheduledMinutes : 0
            })
          }).catch(err => console.warn("Thank you email autoresponder log:", err));
        }

        setSiteConfig(prev => {
          let updatedAb = prev.abTesting;
          if (updatedAb && updatedAb.enabled && updatedAb.status === "active") {
            const varKey = assignedVariant === "B" ? "variantB" : "variantA";
            updatedAb = {
              ...updatedAb,
              stats: {
                ...updatedAb.stats,
                [varKey]: {
                  ...updatedAb.stats[varKey],
                  leads: (updatedAb.stats[varKey]?.leads || 0) + 1
                }
              }
            };
          }
          return {
            ...prev,
            abTesting: updatedAb,
            leads: [newLead, ...prev.leads]
          };
        });
      }

      // Track A/B Test hero impressions from preview iframe
      if (event.data && event.data.type === "HIZLIWEB_AB_IMPRESSION") {
        const variant = event.data.variant === "B" ? "variantB" : "variantA";
        setSiteConfig(prev => {
          if (!prev.abTesting || !prev.abTesting.enabled || prev.abTesting.status !== "active") return prev;
          return {
            ...prev,
            abTesting: {
              ...prev.abTesting,
              stats: {
                ...prev.abTesting.stats,
                [variant]: {
                  ...prev.abTesting.stats[variant],
                  views: (prev.abTesting.stats[variant]?.views || 0) + 1
                }
              }
            }
          };
        });
      }

      // Listen for real newsletter subscriptions sent from static HTML
      if (event.data && event.data.type === "HIZLIWEB_NEWSLETTER_SUBSCRIBE") {
        const subData = event.data.data;
        const cleanEmail = (subData.email || "").trim().toLowerCase();
        if (cleanEmail) {
          const newSub: NewsletterSubscriber = {
            id: subData.id || `sub-${Date.now()}`,
            email: cleanEmail,
            name: subData.name || "",
            subscribedAt:
              subData.subscribedAt ||
              (new Date().toLocaleDateString("tr-TR") +
                " " +
                new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })),
            status: "active",
            source: subData.source || "Web Sitesi E-Bülten Formu",
            tags: ["Web Sitesi", "Organik"]
          };

          setSiteConfig(prev => {
            const existing = prev.subscribers || [];
            if (existing.some(s => s.email.toLowerCase() === cleanEmail)) {
              return prev;
            }
            return {
              ...prev,
              subscribers: [newSub, ...existing]
            };
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleSelectTemplate = (template: ThemeTemplate, palette?: ColorPalette) => {
    setSelectedTemplate(template);
    setSiteConfig(createDefaultSiteConfig(template, palette));
  };

  const handleChangePalette = (palette: ColorPalette) => {
    setSiteConfig((prev) => ({ ...prev, palette }));
  };

  const handleAddCustomTemplate = (newTemplate: ThemeTemplate) => {
    setTemplates((prev) => [newTemplate, ...prev]);
  };

  const handleWizardComplete = (newConfig: SiteConfig) => {
    setSiteConfig(newConfig);
    setCustomerDashboardTab("general");
    setCurrentView("customer-panel");
  };

  const handleAuthSuccess = (role: "admin" | "team_member" | "client") => {
    if (redirectAfterLoginView) {
      if (redirectAfterLoginView === "client-portal") {
        setCustomerDashboardTab("client-portal");
        setCurrentView("customer-panel");
      } else if (redirectAfterLoginView === "admin-auth" || redirectAfterLoginView === "user-auth") {
        setCurrentView("admin-panel");
      } else {
        setCurrentView(redirectAfterLoginView as PlatformView);
      }
      setRedirectAfterLoginView(null);
    } else {
      if (role === "admin" || role === "team_member") {
        // Superadmin & Team Members are redirected strictly to the distinct Admin Super Panel
        setCurrentView("admin-panel");
      } else {
        // Regular clients: if newly registered or site not yet established, launch 5-step wizard
        setCurrentView("wizard");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Header with Multi-View Switcher */}
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onQuickDeploy={() => setCurrentView("deploy")}
        companyName={siteConfig.companyName}
        onOpenCoolifyGuide={() => {
          setCustomerDashboardTab("coolify-deployment");
          setCurrentView("customer-panel");
        }}
        onOpenClientPortalTab={() => {
          setCustomerDashboardTab("client-portal");
          setCurrentView("customer-panel");
        }}
      />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {/* 1. MARKETING HOMEPAGE (JetKur.com.tr) */}
        {currentView === "marketing" && (
          <MarketingLanding
            onStartWizard={() => {
              if (!isAuthenticated) {
                openAuthModal("register");
              } else {
                setCurrentView("wizard");
              }
            }}
            onOpenCustomerPanel={() => {
              if (!isAuthenticated) {
                openAuthModal("register");
              } else {
                setCurrentView("customer-panel");
              }
            }}
            onOpenAdminPanel={() => {
              if (!isAuthenticated) {
                openAuthModal("admin");
              } else {
                setCurrentView("admin-panel");
              }
            }}
            onOpenCatalog={() => setCurrentView("catalog")}
            onSelectTemplate={(templateId) => {
              const tpl = templates.find((t) => t.id === templateId) || templates[0];
              handleSelectTemplate(tpl);
              if (!isAuthenticated) {
                openAuthModal("register");
              } else {
                setCurrentView("customer-panel");
              }
            }}
          />
        )}

        {/* 2. CUSTOMER ONBOARDING WIZARD */}
        {currentView === "wizard" && (
          !isAuthenticated ? (
            <TrialGatekeeper 
              onBackToMarketing={() => setCurrentView("marketing")} 
              targetViewName="Akıllı Web Sitesi Sihirbazı" 
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <CustomerWizard
                onComplete={handleWizardComplete}
                onCancelToDashboard={() => setCurrentView("customer-panel")}
              />
            </div>
          )
        )}

        {/* 3. CUSTOMER DASHBOARD (CMS & LEADS & PRODUCTS) */}
        {currentView === "customer-panel" && (
          !isAuthenticated ? (
            <TrialGatekeeper 
              onBackToMarketing={() => setCurrentView("marketing")} 
              targetViewName="Müşteri Yönetim Paneli" 
            />
          ) : (
            <CustomerDashboard
              config={siteConfig}
              onChange={setSiteConfig}
              onPreview={() => setCurrentView("preview")}
              onDeploy={() => setCurrentView("deploy")}
              initialTab={customerDashboardTab}
            />
          )
        )}

        {/* 4. SUPER ADMIN PANEL (PLATFORM OWNER) */}
        {currentView === "admin-panel" && (
          (!isAuthenticated || (!isAdmin && !isTeamMember)) ? (
            <TrialGatekeeper 
              onBackToMarketing={() => setCurrentView("marketing")} 
              targetViewName="Süper Admin Paneli" 
            />
          ) : (
            <AdminSuperPanel
              currentConfig={siteConfig}
              onImpersonateSite={(config) => {
                setSiteConfig(config);
                setCurrentView("customer-panel");
              }}
              onOpenAiFactory={() => setCurrentView("ai-factory")}
              onOpenMarketing={() => setCurrentView("marketing")}
            />
          )
        )}

        {/* 5. LIVE PREVIEW FRAME (INTERACTIVE BROWSER) */}
        {currentView === "preview" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <LivePreviewFrame
              config={siteConfig}
              onChangePalette={handleChangePalette}
              onOpenDeploy={() => setCurrentView("deploy")}
              onOpenEditor={() => setCurrentView("customer-panel")}
            />
          </div>
        )}

        {/* 6. STATIC DEPLOY & GLOBAL EDGE EXPORT */}
        {currentView === "deploy" && (
          !isAuthenticated ? (
            <TrialGatekeeper 
              onBackToMarketing={() => setCurrentView("marketing")} 
              targetViewName="Statik Dağıtım & Yayınlama Merkezi" 
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <StaticDeployModal
                config={siteConfig}
                onClose={() => setCurrentView("preview")}
                onOpenPreview={() => setCurrentView("preview")}
                onConfigChange={setSiteConfig}
              />
            </div>
          )
        )}

        {/* 7. STRATEGIC ANALYSIS & ARCHITECTURE COMPARISON */}
        {currentView === "strategy" && (
          !isAuthenticated ? (
            <TrialGatekeeper 
              onBackToMarketing={() => setCurrentView("marketing")} 
              targetViewName="Stratejik Analiz ve Pazar Raporu" 
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <StrategicAnalysisView
                siteConfig={siteConfig}
                onUpdateSiteConfig={setSiteConfig}
                onNavigateTab={(tab) => setCurrentView(tab as any)}
              />
            </div>
          )
        )}

        {/* 8. AI TEMPLATE FACTORY */}
        {currentView === "ai-factory" && (
          !isAuthenticated ? (
            <TrialGatekeeper 
              onBackToMarketing={() => setCurrentView("marketing")} 
              targetViewName="AI Şablon Fabrikası" 
            />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
              <AiTemplateFactory
                onAddCustomTemplate={handleAddCustomTemplate}
                onSelectAndEdit={(tpl) => {
                  handleSelectTemplate(tpl);
                  setCurrentView("customer-panel");
                }}
              />
            </div>
          )
        )}

        {/* 9. TEMPLATE CATALOG */}
        {currentView === "catalog" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            <TemplateCatalog
              templates={templates}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={(tpl, pal) => {
                handleSelectTemplate(tpl, pal);
                setCurrentView("customer-panel");
              }}
              onOpenEditor={() => setCurrentView("customer-panel")}
              onOpenPreview={() => setCurrentView("preview")}
            />
          </div>
        )}
      </main>

      {/* Global Authentication Modal (Email & Password, Multi-Role Login) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalInitialTab}
        onSuccessRedirect={handleAuthSuccess}
      />
    </div>
  );
}
