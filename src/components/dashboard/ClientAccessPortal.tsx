import React, { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck,
  Key,
  User,
  Building2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  FileText,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Search,
  ExternalLink,
  ArrowRight,
  Send,
  Calendar,
  DollarSign,
  FileCheck,
  RefreshCw,
  Sliders,
  X,
  FileSpreadsheet,
  File,
  Phone,
  Mail,
  HelpCircle,
  LogOut,
  StickyNote,
  Save,
  Pin
} from "lucide-react";
import {
  SiteConfig,
  ClientAccessPortalConfig,
  PortalClient,
  ClientOrder,
  ClientDocument,
  ClientOrderStatus,
  ClientDocumentCategory,
  ClientOrderTimelineItem
} from "../../types";

interface ClientAccessPortalProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onNavigateToCatalog?: () => void;
}

export const ClientAccessPortal: React.FC<ClientAccessPortalProps> = ({
  config,
  onChange,
  onNavigateToCatalog
}) => {
  // Ensure portal config exists
  const portalConfig: ClientAccessPortalConfig = useMemo(() => {
    return (
      config.clientPortal || {
        enabled: true,
        portalTitle: "Müşteri Erişim Portalı (Client Access Portal)",
        portalWelcomeMessage:
          "Değerli Müşterimiz, sipariş ve operasyon durumlarınızı canlı takip edebilir, projelerinize ait sözleşme, şartname ve faturaları güvenle görüntüleyebilirsiniz.",
        supportEmail: config.email || "destek@yildizotokurtarma.com.tr",
        supportPhone: config.phone || "+90 850 300 00 00",
        allowClientDownloads: true,
        requirePasswordChangeOnFirstLogin: false,
        clients: []
      }
    );
  }, [config.clientPortal, config.email, config.phone]);

  const clients = portalConfig.clients || [];

  // Local states
  const [activeSubTab, setActiveSubTab] = useState<"clients" | "preview" | "settings">("clients");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "suspended">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Modals
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [clientDetailTab, setClientDetailTab] = useState<"orders" | "documents" | "notes">("orders");

  // Private Client Notes State (Internal CRM Reminders)
  const [inlineNotesDraft, setInlineNotesDraft] = useState("");
  const [noteSaveFeedback, setNoteSaveFeedback] = useState<string | null>(null);
  const [isNoteDirty, setIsNoteDirty] = useState(false);

  // Client preview simulation state
  const [previewClientId, setPreviewClientId] = useState<string>(clients[0]?.id || "");
  const [previewActiveTab, setPreviewActiveTab] = useState<"orders" | "documents">("orders");
  const [previewSearch, setPreviewSearch] = useState("");

  // New Client Form State
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPassword, setNewClientPassword] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientNotes, setNewClientNotes] = useState("");

  // Edit Client Form State
  const [editingClient, setEditingClient] = useState<PortalClient | null>(null);

  // New Order Form State
  const [newOrderTitle, setNewOrderTitle] = useState("");
  const [newOrderService, setNewOrderService] = useState("");
  const [newOrderAmount, setNewOrderAmount] = useState("");
  const [newOrderStatus, setNewOrderStatus] = useState<ClientOrderStatus>("in_progress");
  const [newOrderStartDate, setNewOrderStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newOrderEstDate, setNewOrderEstDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [newOrderNotes, setNewOrderNotes] = useState("");

  // New Document Form State
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocCategory, setNewDocCategory] = useState<ClientDocumentCategory>("contract");
  const [newDocFileType, setNewDocFileType] = useState<"pdf" | "docx" | "xlsx" | "image">("pdf");
  const [newDocFileSize, setNewDocFileSize] = useState("1.2 MB");
  const [newDocDescription, setNewDocDescription] = useState("");
  const [newDocUrl, setNewDocUrl] = useState("");
  const [newDocIsPublic, setNewDocIsPublic] = useState(true);

  // Helper to persist changes into SiteConfig
  const updatePortalConfig = (newPortalConfig: ClientAccessPortalConfig) => {
    onChange({
      ...config,
      clientPortal: newPortalConfig
    });
  };

  // Helper to generate secure password
  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  // Filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((cl) => {
      const matchesStatus = statusFilter === "all" || cl.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cl.name.toLowerCase().includes(q) ||
        cl.company.toLowerCase().includes(q) ||
        cl.email.toLowerCase().includes(q) ||
        cl.phone.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [clients, statusFilter, searchQuery]);

  // Selected client object
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  }, [clients, selectedClientId]);

  // Synchronize private notes draft whenever selected client changes
  useEffect(() => {
    if (selectedClient) {
      setInlineNotesDraft(selectedClient.notes || "");
      setIsNoteDirty(false);
      setNoteSaveFeedback(null);
    }
  }, [selectedClient?.id, selectedClient?.notes]);

  // Handler to save inline private notes
  const handleSaveInlineNotes = (clientId: string, noteText: string) => {
    const updated = clients.map((c) => (c.id === clientId ? { ...c, notes: noteText } : c));
    updatePortalConfig({
      ...portalConfig,
      clients: updated
    });
    setIsNoteDirty(false);
    setNoteSaveFeedback("Özel müşteri notu ve hatırlatıcı başarıyla kaydedildi!");
    setTimeout(() => {
      setNoteSaveFeedback(null);
    }, 3000);
  };

  // Handler to append preset tags/reminders
  const handleAppendTagToNotes = (tag: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("tr-TR");
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const tagPrefix = `[${tag} • ${dateStr} ${timeStr}]: `;
    const current = inlineNotesDraft ? inlineNotesDraft.trim() : "";
    const updated = current ? `${current}\n\n${tagPrefix}` : tagPrefix;
    setInlineNotesDraft(updated);
    setIsNoteDirty(true);
  };

  // Overall Stats
  const totalClients = clients.length;
  const activeOrdersCount = clients.reduce(
    (sum, c) => sum + (c.orders?.filter((o) => o.status === "in_progress" || o.status === "in_transit").length || 0),
    0
  );
  const totalDocumentsCount = clients.reduce((sum, c) => sum + (c.documents?.length || 0), 0);

  // Clipboard copy helper
  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  // Toggle client status
  const handleToggleStatus = (clientId: string) => {
    const updated = clients.map((cl) => {
      if (cl.id === clientId) {
        return {
          ...cl,
          status: cl.status === "active" ? ("suspended" as const) : ("active" as const)
        };
      }
      return cl;
    });
    updatePortalConfig({
      ...portalConfig,
      clients: updated
    });
  };

  // Delete client
  const handleDeleteClient = (clientId: string) => {
    if (confirm("Bu müşteriyi ve ilişkili tüm sipariş/doküman verilerini silmek istediğinize emin misiniz?")) {
      const updated = clients.filter((c) => c.id !== clientId);
      updatePortalConfig({
        ...portalConfig,
        clients: updated
      });
      if (selectedClientId === clientId) {
        setSelectedClientId(updated[0]?.id || null);
      }
    }
  };

  // Add Client Submission
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      alert("Lütfen en az müşteri adı ve e-posta adresini girin.");
      return;
    }

    const passwordToUse = newClientPassword || generatePassword();
    const newClient: PortalClient = {
      id: `cl-${Date.now()}`,
      name: newClientName,
      company: newClientCompany || "Bireysel",
      email: newClientEmail,
      password: passwordToUse,
      phone: newClientPhone || config.phone || "",
      status: "active",
      createdDate: new Date().toISOString().split("T")[0],
      notes: newClientNotes,
      orders: [],
      documents: []
    };

    const updated = [newClient, ...clients];
    updatePortalConfig({
      ...portalConfig,
      clients: updated
    });

    setSelectedClientId(newClient.id);
    setIsAddClientModalOpen(false);

    // Reset fields
    setNewClientName("");
    setNewClientCompany("");
    setNewClientEmail("");
    setNewClientPassword("");
    setNewClientPhone("");
    setNewClientNotes("");
  };

  // Update Client Submission
  const handleSaveEditClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;

    const updated = clients.map((c) => (c.id === editingClient.id ? editingClient : c));
    updatePortalConfig({
      ...portalConfig,
      clients: updated
    });
    setIsEditClientModalOpen(false);
    setEditingClient(null);
  };

  // Add Order Submission
  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newOrderTitle) return;

    const newOrder: ClientOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newOrderTitle,
      serviceOrProduct: newOrderService || "Genel Hizmet",
      amount: newOrderAmount || "0 ₺",
      status: newOrderStatus,
      startDate: newOrderStartDate,
      estimatedCompletionDate: newOrderEstDate,
      notes: newOrderNotes,
      timeline: [
        {
          id: `t-${Date.now()}`,
          date: new Date().toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          title: "Sipariş Kaydı Oluşturuldu",
          description: "Müşteri sipariş talebi sisteme işlendi.",
          status: "completed"
        },
        {
          id: `t-${Date.now() + 1}`,
          date: newOrderStartDate,
          title: "Operasyon Başlatıldı",
          description: "Uzman ekip görevlendirildi.",
          status: "current"
        }
      ]
    };

    const updatedClients = clients.map((c) => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          orders: [newOrder, ...(c.orders || [])]
        };
      }
      return c;
    });

    updatePortalConfig({
      ...portalConfig,
      clients: updatedClients
    });

    setIsAddOrderModalOpen(false);
    setNewOrderTitle("");
    setNewOrderService("");
    setNewOrderAmount("");
    setNewOrderNotes("");
  };

  // Update order status
  const handleUpdateOrderStatus = (orderId: string, newStatus: ClientOrderStatus) => {
    if (!selectedClient) return;

    const updatedOrders = (selectedClient.orders || []).map((ord) => {
      if (ord.id === orderId) {
        const completedDate = newStatus === "completed" ? new Date().toLocaleString("tr-TR") : ord.completedDate;
        return {
          ...ord,
          status: newStatus,
          completedDate
        };
      }
      return ord;
    });

    const updatedClients = clients.map((c) => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          orders: updatedOrders
        };
      }
      return c;
    });

    updatePortalConfig({
      ...portalConfig,
      clients: updatedClients
    });
  };

  // Delete Order
  const handleDeleteOrder = (orderId: string) => {
    if (!selectedClient) return;
    if (confirm("Bu siparişi silmek istediğinize emin misiniz?")) {
      const updatedOrders = (selectedClient.orders || []).filter((o) => o.id !== orderId);
      const updatedClients = clients.map((c) => {
        if (c.id === selectedClient.id) {
          return {
            ...c,
            orders: updatedOrders
          };
        }
        return c;
      });

      updatePortalConfig({
        ...portalConfig,
        clients: updatedClients
      });
    }
  };

  // Add Document Submission
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !newDocTitle) return;

    const newDoc: ClientDocument = {
      id: `doc-${Date.now()}`,
      title: newDocTitle,
      category: newDocCategory,
      fileType: newDocFileType,
      fileSize: newDocFileSize || "1.0 MB",
      uploadDate: new Date().toISOString().split("T")[0],
      fileUrl: newDocUrl || "https://example.com/demo-document.pdf",
      downloadCount: 0,
      isPublicToClient: newDocIsPublic,
      description: newDocDescription
    };

    const updatedClients = clients.map((c) => {
      if (c.id === selectedClient.id) {
        return {
          ...c,
          documents: [newDoc, ...(c.documents || [])]
        };
      }
      return c;
    });

    updatePortalConfig({
      ...portalConfig,
      clients: updatedClients
    });

    setIsAddDocModalOpen(false);
    setNewDocTitle("");
    setNewDocDescription("");
    setNewDocUrl("");
  };

  // Delete Document
  const handleDeleteDocument = (docId: string) => {
    if (!selectedClient) return;
    if (confirm("Bu dokümanı silmek istediğinize emin misiniz?")) {
      const updatedDocs = (selectedClient.documents || []).filter((d) => d.id !== docId);
      const updatedClients = clients.map((c) => {
        if (c.id === selectedClient.id) {
          return {
            ...c,
            documents: updatedDocs
          };
        }
        return c;
      });

      updatePortalConfig({
        ...portalConfig,
        clients: updatedClients
      });
    }
  };

  // Helper for status badge styling
  const getStatusBadge = (status: ClientOrderStatus) => {
    switch (status) {
      case "completed":
        return {
          label: "Tamamlandı",
          bg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle2
        };
      case "in_progress":
        return {
          label: "İşlemde / Hazırlanıyor",
          bg: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Clock
        };
      case "in_transit":
        return {
          label: "Yolda / Sevkiyatta",
          bg: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Truck
        };
      case "pending":
        return {
          label: "Beklemede",
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: AlertCircle
        };
      case "cancelled":
        return {
          label: "İptal Edildi",
          bg: "bg-rose-100 text-rose-800 border-rose-200",
          icon: X
        };
      default:
        return {
          label: status,
          bg: "bg-slate-100 text-slate-700 border-slate-200",
          icon: Clock
        };
    }
  };

  // Helper for document category icon & label
  const getDocCategoryInfo = (cat: ClientDocumentCategory) => {
    switch (cat) {
      case "contract":
        return { label: "Sözleşme & Anlaşma", color: "text-purple-600 bg-purple-50 border-purple-200", icon: FileCheck };
      case "invoice":
        return { label: "Fatura & Makbuz", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: DollarSign };
      case "spec":
        return { label: "Teknik Şartname", color: "text-blue-600 bg-blue-50 border-blue-200", icon: FileText };
      case "report":
        return { label: "Tutanak & Rapor", color: "text-amber-600 bg-amber-50 border-amber-200", icon: FileSpreadsheet };
      default:
        return { label: "Diğer Evrak", color: "text-slate-600 bg-slate-50 border-slate-200", icon: File };
    }
  };

  const portalDomainUrl = `${config.cloudflare?.deployedUrl || "https://yildiz-otokurtarma.hizliweb.me"}/portal`;

  // Pre-selected client for live simulator
  const activePreviewClient = useMemo(() => {
    return clients.find((c) => c.id === previewClientId) || clients[0] || null;
  }, [clients, previewClientId]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>B2B & Müşteri Giriş Portalı</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Müşteri Erişim Portalı (Client Access Portal)
            </h1>
            <p className="text-sm text-indigo-200/80 leading-relaxed">
              Müşterilerinize özel güvenli giriş şifreleri tanımlayın. Müşterileriniz kendilerine özel panelden sipariş ve operasyonlarının canlı durumunu takip etsin, resmi sözleşme ve faturalarını güvenle indirsin.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-slate-300 flex-wrap">
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700">
                <span className="text-slate-400">Portal Giriş Adresi:</span>
                <span className="font-mono text-indigo-300 font-semibold">{portalDomainUrl}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(portalDomainUrl, "portal-url")}
                  className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                  title="Portal linkini kopyala"
                >
                  {copiedKey === "portal-url" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => {
                setNewClientPassword(generatePassword());
                setIsAddClientModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Müşteri & Şifre Ekle</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (activeSubTab === "preview") {
                  setActiveSubTab("clients");
                } else {
                  setActiveSubTab("preview");
                  if (!previewClientId && clients.length > 0) {
                    setPreviewClientId(clients[0].id);
                  }
                }
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                activeSubTab === "preview"
                  ? "bg-amber-400 text-slate-950 border-amber-300 shadow-md font-extrabold"
                  : "bg-slate-800/80 hover:bg-slate-800 text-indigo-200 border-slate-700"
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>{activeSubTab === "preview" ? "Yönetici Görünümüne Dön" : "Müşteri Gözünden Canlı Önizle"}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Portal Ayarları"
            >
              <Sliders className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-900/50">
          <div className="bg-slate-800/40 backdrop-blur-xs p-3.5 rounded-2xl border border-indigo-500/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kayıtlı Müşteri</div>
            <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">{totalClients}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Güvenli erişim tanımlı</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xs p-3.5 rounded-2xl border border-indigo-500/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Aktif Sipariş / İş</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-1 font-mono">{activeOrdersCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">İşlemde veya yolda</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xs p-3.5 rounded-2xl border border-indigo-500/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Paylaşılan Belge</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-300 mt-1 font-mono">{totalDocumentsCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Sözleşme, fatura, rapor</div>
          </div>
          <div className="bg-slate-800/40 backdrop-blur-xs p-3.5 rounded-2xl border border-indigo-500/10">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Portal Durumu</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-bold text-emerald-300 font-mono">CANLI / AKTİF</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cloudflare Edge Korumalı</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === "preview" ? (
        /* LIVE CLIENT SIMULATOR MODE */
        <div className="space-y-6">
          {/* Simulator Bar */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-amber-900">
                  Canlı Müşteri Portalı Simülatörü (Müşteri Deneyimi)
                </div>
                <div className="text-[11px] text-amber-700">
                  Müşteriniz giriş yaptığında tam olarak bu ekranı görür. Farklı bir müşteriyi test etmek için listeden seçin:
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={previewClientId}
                onChange={(e) => setPreviewClientId(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 shadow-2xs"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setActiveSubTab("clients")}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                Geri Dön
              </button>
            </div>
          </div>

          {/* SIMULATED CLIENT PORTAL VIEWPORT */}
          {activePreviewClient ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              {/* Simulated Client Portal Header */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-lg shadow-lg">
                    {config.companyName?.charAt(0) || "Y"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">{config.companyName || "Yıldız Oto Kurtarma"}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        Güvenli Portal
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {portalConfig.portalTitle || "Müşteri Sipariş & Evrak Portalı"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end bg-slate-800/80 p-2.5 rounded-2xl border border-slate-700">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                      {activePreviewClient.name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-white">{activePreviewClient.name}</div>
                      <div className="text-[10px] text-slate-400">{activePreviewClient.company}</div>
                    </div>
                  </div>
                  <div className="border-l border-slate-700 pl-3">
                    <span className="px-2 py-1 rounded-lg bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-400" />
                      <span>Oturum Açık</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Welcome Message in Client Portal */}
              <div className="bg-indigo-50/70 border-b border-indigo-100 p-4 sm:p-5 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                <p className="text-xs text-indigo-950 font-medium">
                  {portalConfig.portalWelcomeMessage}
                </p>
              </div>

              {/* Client Portal Tab Switcher */}
              <div className="px-6 pt-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewActiveTab("orders")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                      previewActiveTab === "orders"
                        ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Siparişlerim & İş Takibi ({activePreviewClient.orders?.length || 0})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewActiveTab("documents")}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
                      previewActiveTab === "documents"
                        ? "border-indigo-600 text-indigo-600 bg-indigo-50/50"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Proje Belgelerim & Faturalar ({activePreviewClient.documents?.length || 0})</span>
                  </button>
                </div>

                <div className="text-xs text-slate-500 font-medium pb-2">
                  Destek Çağrı Hattı: <span className="font-bold font-mono text-slate-900">{portalConfig.supportPhone || config.phone}</span>
                </div>
              </div>

              {/* Client Portal Tab Body */}
              <div className="p-6 sm:p-8">
                {previewActiveTab === "orders" ? (
                  <div className="space-y-6">
                    {(activePreviewClient.orders || []).length === 0 ? (
                      <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Package className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-700">Henüz Kayıtlı Siparişiniz Bulunmuyor</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Yetkili ekibimiz yeni bir hizmet veya sipariş kaydı oluşturduğunda burada canlı olarak takip edebileceksiniz.
                        </p>
                      </div>
                    ) : (
                      activePreviewClient.orders.map((order) => {
                        const badge = getStatusBadge(order.status);
                        const StatusIcon = badge.icon;
                        return (
                          <div
                            key={order.id}
                            className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-6 space-y-5"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-mono text-xs font-bold text-slate-800">
                                    {order.orderNumber}
                                  </span>
                                  <span
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${badge.bg}`}
                                  >
                                    <StatusIcon className="w-3.5 h-3.5" />
                                    <span>{badge.label}</span>
                                  </span>
                                </div>
                                <h3 className="text-base font-bold text-slate-900">{order.title}</h3>
                                <p className="text-xs text-slate-500">Hizmet Türü: {order.serviceOrProduct}</p>
                              </div>

                              <div className="text-left sm:text-right">
                                <div className="text-xs text-slate-400 font-medium">Hizmet Bedeli</div>
                                <div className="text-lg font-black text-slate-900 font-mono">{order.amount}</div>
                                <div className="text-[11px] text-slate-500">
                                  Başlangıç: {order.startDate} • Tahmini Teslim: {order.estimatedCompletionDate}
                                </div>
                              </div>
                            </div>

                            {order.notes && (
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                                <span className="font-bold text-slate-900">Operasyon Notu: </span>
                                {order.notes}
                              </div>
                            )}

                            {/* Milestone Tracker Timeline */}
                            {order.timeline && order.timeline.length > 0 && (
                              <div className="space-y-3 pt-2">
                                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                                  Aşama ve İlerleme Süreci
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                                  {order.timeline.map((step, idx) => (
                                    <div
                                      key={step.id || idx}
                                      className={`p-3 rounded-xl border relative ${
                                        step.status === "completed"
                                          ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
                                          : step.status === "current"
                                          ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950"
                                          : "bg-slate-50/50 border-slate-200 text-slate-500 opacity-70"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-[10px] font-mono font-bold">{step.date}</span>
                                        {step.status === "completed" ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                        ) : step.status === "current" ? (
                                          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                                        ) : (
                                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                                        )}
                                      </div>
                                      <div className="text-xs font-bold leading-tight">{step.title}</div>
                                      <div className="text-[11px] text-slate-600 mt-1 leading-snug">
                                        {step.description}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* DOCUMENTS TAB IN CLIENT PORTAL */
                  <div className="space-y-4">
                    {(activePreviewClient.documents || []).length === 0 ? (
                      <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-slate-700">Henüz Evrak Yüklenmedi</h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Sözleşme ve faturalarınız yüklendiğinde buradan güvenle görüntüleyip indirebilirsiniz.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activePreviewClient.documents.map((doc) => {
                          const catInfo = getDocCategoryInfo(doc.category);
                          const CatIcon = catInfo.icon;
                          return (
                            <div
                              key={doc.id}
                              className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between gap-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                    <CatIcon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border mb-1 ${catInfo.color}`}
                                    >
                                      {catInfo.label}
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{doc.title}</h4>
                                    {doc.description && (
                                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                        {doc.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono uppercase font-bold text-slate-700">{doc.fileType}</span>
                                  <span>•</span>
                                  <span>{doc.fileSize}</span>
                                  <span>•</span>
                                  <span>{doc.uploadDate}</span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    alert(`"${doc.title}" belgesi başarıyla indirildi (Simülasyon).`);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>İndir</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Client Portal Footer */}
              <div className="bg-slate-50 p-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                <div>
                  Sorularınız için: <span className="font-semibold text-slate-700">{portalConfig.supportEmail || config.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Şifreli Müşteri Alanı</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* ADMIN MANAGEMENT VIEW (MAIN DASHBOARD TAB) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Client List & Controls (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Filter Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Müşteri adı, firma veya e-posta ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {(["all", "active", "pending", "suspended"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                      statusFilter === st
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st === "all"
                      ? `Tümü (${clients.length})`
                      : st === "active"
                      ? "Aktif"
                      : st === "pending"
                      ? "Beklemede"
                      : "Askıda"}
                  </button>
                ))}
              </div>
            </div>

            {/* Clients List Cards */}
            <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
              {filteredClients.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
                  <User className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">Müşteri Bulunamadı</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Aramayı temizleyin veya yeni bir müşteri ekleyin.</p>
                </div>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = selectedClient?.id === client.id;
                  const isPwdVisible = showPasswords[client.id];
                  return (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer text-left relative ${
                        isSelected
                          ? "bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isSelected
                                ? "bg-indigo-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900">{client.name}</h4>
                              <span
                                className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                  client.status === "active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : client.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800"
                                }`}
                              >
                                {client.status === "active" ? "Aktif" : client.status === "pending" ? "Bekliyor" : "Askıda"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                              {client.company || "Bireysel"}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono text-slate-400">
                            {client.orders?.length || 0} Sipariş
                          </span>
                        </div>
                      </div>

                      {/* Credentials Strip */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-600 bg-slate-50/80 px-2.5 py-1.5 rounded-xl">
                        <div className="flex items-center gap-1.5 truncate max-w-[190px]">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate font-mono">{client.email}</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-mono text-indigo-700 font-bold">
                            {isPwdVisible ? client.password : "••••••••"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPasswords((prev) => ({ ...prev, [client.id]: !prev[client.id] }));
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Şifreyi Göster / Gizle"
                          >
                            {isPwdVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(
                                `Müşteri Portalı Giriş Bilgileriniz:\nPortal: ${portalDomainUrl}\nKullanıcı / E-posta: ${client.email}\nŞifre: ${client.password}`,
                                `cred-${client.id}`
                              );
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="Giriş bilgilerini kopyala"
                          >
                            {copiedKey === `cred-${client.id}` ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Internal Notes / Private Reminder Snippet */}
                      {client.notes && client.notes.trim().length > 0 && (
                        <div className="mt-2 text-[11px] text-amber-900 bg-amber-50/90 border border-amber-200/80 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-2xs">
                          <StickyNote className="w-3 h-3 text-amber-600 shrink-0" />
                          <span className="truncate font-medium">{client.notes}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Client Workspace (7 Cols) */}
          <div className="lg:col-span-7">
            {selectedClient ? (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-6">
                {/* Client Profile Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md">
                      {selectedClient.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg font-black text-slate-900">{selectedClient.name}</h2>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            selectedClient.status === "active"
                              ? "bg-emerald-100 text-emerald-800"
                              : selectedClient.status === "pending"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {selectedClient.status === "active" ? "Aktif Hesap" : selectedClient.status === "pending" ? "Onay Bekliyor" : "Askıya Alındı"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-2 flex-wrap">
                        <span>{selectedClient.company}</span>
                        <span>•</span>
                        <span>{selectedClient.phone || "Telefon Yok"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingClient(selectedClient);
                        setIsEditClientModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Düzenle</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleStatus(selectedClient.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                        selectedClient.status === "active"
                          ? "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                      }`}
                    >
                      {selectedClient.status === "active" ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Askıya Al</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Aktifleştir</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteClient(selectedClient.id)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-100 transition-colors cursor-pointer"
                      title="Müşteriyi Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Share Credentials Banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Güvenli Giriş Kimlik Bilgileri</span>
                    </div>
                    <div className="text-xs text-indigo-800 flex items-center gap-2 flex-wrap font-mono">
                      <span>E-posta: <strong>{selectedClient.email}</strong></span>
                      <span>•</span>
                      <span>Şifre: <strong>{selectedClient.password}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const msg = `Merhaba ${selectedClient.name},\n${config.companyName || "Firmamız"} Müşteri Portalı giriş bilgileriniz aşağıdadır:\n\n🌐 Portal Adresi: ${portalDomainUrl}\n📧 Kullanıcı / E-posta: ${selectedClient.email}\n🔑 Şifre: ${selectedClient.password}\n\nSipariş durumunuzu ve belgelerinizi güvenle takip edebilirsiniz.`;
                        handleCopy(msg, `full-cred-${selectedClient.id}`);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {copiedKey === `full-cred-${selectedClient.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Kopyalandı</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Bilgileri Kopyala</span>
                        </>
                      )}
                    </button>

                    {selectedClient.phone && (
                      <a
                        href={`https://wa.me/${selectedClient.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                          `Merhaba ${selectedClient.name},\n${config.companyName || "Firmamız"} Müşteri Portalı giriş bilgileriniz aşağıdadır:\n\n🌐 Portal Adresi: ${portalDomainUrl}\n📧 Kullanıcı: ${selectedClient.email}\n🔑 Şifre: ${selectedClient.password}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp'tan Gönder</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Tab Switcher for Client Details */}
                <div className="flex items-center justify-between border-b border-slate-200 flex-wrap gap-2">
                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setClientDetailTab("orders")}
                      className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        clientDetailTab === "orders"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>Siparişler ({selectedClient.orders?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientDetailTab("documents")}
                      className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        clientDetailTab === "documents"
                          ? "border-indigo-600 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Proje Belgeleri ({selectedClient.documents?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setClientDetailTab("notes")}
                      className={`px-3.5 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                        clientDetailTab === "notes"
                          ? "border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-lg"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <StickyNote className="w-4 h-4 text-amber-600" />
                      <span>Dahili Notlar & Hatırlatıcılar</span>
                      {selectedClient.notes && selectedClient.notes.trim().length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-amber-500" title="Aktif not mevcut" />
                      )}
                    </button>
                  </div>

                  <div>
                    {clientDetailTab === "orders" ? (
                      <button
                        type="button"
                        onClick={() => setIsAddOrderModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer mb-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Yeni Sipariş Ekle</span>
                      </button>
                    ) : clientDetailTab === "documents" ? (
                      <button
                        type="button"
                        onClick={() => setIsAddDocModalOpen(true)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer mb-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Yeni Belge Yükle</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveInlineNotes(selectedClient.id, inlineNotesDraft)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer mb-2 shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Notu Kaydet</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Client Detail Tab Content */}
                {clientDetailTab === "orders" ? (
                  <div className="space-y-4">
                    {/* Sticky Note Banner in Orders View */}
                    {selectedClient.notes && selectedClient.notes.trim().length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-start justify-between gap-3 shadow-2xs">
                        <div className="flex items-start gap-2.5">
                          <StickyNote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                              <span>Dahili Müşteri Notu & Hatırlatıcı</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/80 font-bold text-amber-900">
                                Yalnızca Firma Yöneticisi Görür
                              </span>
                            </div>
                            <p className="text-xs text-amber-900 font-medium whitespace-pre-line line-clamp-2">
                              {selectedClient.notes}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setClientDetailTab("notes")}
                          className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer pt-0.5 whitespace-nowrap"
                        >
                          Düzenle / Tamamı →
                        </button>
                      </div>
                    )}
                    {(selectedClient.orders || []).length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Henüz Kayıtlı Sipariş Yok</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Müşteri için sipariş veya operasyon kaydı oluşturarak durumunu güncelleyin.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsAddOrderModalOpen(true)}
                          className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>İlk Siparişi Oluştur</span>
                        </button>
                      </div>
                    ) : (
                      selectedClient.orders.map((order) => {
                        const badge = getStatusBadge(order.status);
                        return (
                          <div
                            key={order.id}
                            className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-4"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                    {order.orderNumber}
                                  </span>
                                  <span className="text-xs text-slate-400 font-medium">
                                    Hizmet: <strong>{order.serviceOrProduct}</strong>
                                  </span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 mt-1">{order.title}</h4>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-mono text-sm font-bold text-slate-900">{order.amount}</span>
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    handleUpdateOrderStatus(order.id, e.target.value as ClientOrderStatus)
                                  }
                                  className="px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-300 bg-white cursor-pointer"
                                >
                                  <option value="pending">Beklemede</option>
                                  <option value="in_progress">Hazırlanıyor / İşlemde</option>
                                  <option value="in_transit">Yolda / Sevkiyatta</option>
                                  <option value="completed">Tamamlandı</option>
                                  <option value="cancelled">İptal Edildi</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Siparişi Sil"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600">
                              <div>
                                <span className="text-slate-400">Başlangıç:</span> {order.startDate}
                              </div>
                              <div>
                                <span className="text-slate-400">Tahmini Teslim:</span> {order.estimatedCompletionDate}
                              </div>
                              {order.completedDate && (
                                <div className="text-emerald-700">
                                  <span className="text-slate-400">Tamamlandı:</span> {order.completedDate}
                                </div>
                              )}
                            </div>

                            {order.notes && (
                              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                {order.notes}
                              </p>
                            )}

                            {order.timeline && (
                              <div className="text-[11px] text-slate-500 font-medium pt-1">
                                <span className="font-bold text-slate-700">Canlı Takip:</span> {order.timeline.length} operasyon adımı tanımlı (Portalde müşteriye canlı gösterilir).
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : clientDetailTab === "documents" ? (
                  /* DOCUMENTS TAB IN ADMIN VIEW */
                  <div className="space-y-4">
                    {/* Sticky Note Banner in Documents View */}
                    {selectedClient.notes && selectedClient.notes.trim().length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 flex items-start justify-between gap-3 shadow-2xs">
                        <div className="flex items-start gap-2.5">
                          <StickyNote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="space-y-0.5">
                            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                              <span>Dahili Müşteri Notu & Hatırlatıcı</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/80 font-bold text-amber-900">
                                Yalnızca Firma Yöneticisi Görür
                              </span>
                            </div>
                            <p className="text-xs text-amber-900 font-medium whitespace-pre-line line-clamp-2">
                              {selectedClient.notes}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setClientDetailTab("notes")}
                          className="text-xs font-bold text-amber-800 hover:text-amber-950 underline shrink-0 cursor-pointer pt-0.5 whitespace-nowrap"
                        >
                          Düzenle / Tamamı →
                        </button>
                      </div>
                    )}

                    {(selectedClient.documents || []).length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">Henüz Belge Yüklenmedi</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Sözleşme, fatura, şartname veya tutanak ekleyerek müşterinin erişimine açın.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsAddDocModalOpen(true)}
                          className="mt-3 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>İlk Belgeyi Yükle</span>
                        </button>
                      </div>
                    ) : (
                      selectedClient.documents.map((doc) => {
                        const catInfo = getDocCategoryInfo(doc.category);
                        const CatIcon = catInfo.icon;
                        return (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                                <CatIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-bold text-slate-900">{doc.title}</h4>
                                  <span className={`px-2 py-0.2 rounded text-[10px] font-bold border ${catInfo.color}`}>
                                    {catInfo.label}
                                  </span>
                                  {doc.isPublicToClient && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                      Müşteri Görebilir
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                                  <span className="font-mono uppercase font-bold">{doc.fileType}</span>
                                  <span>•</span>
                                  <span>{doc.fileSize}</span>
                                  <span>•</span>
                                  <span>Yüklendi: {doc.uploadDate}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => alert(`"${doc.title}" dosyası indirildi (Simülasyon).`)}
                                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                                title="İndir"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                title="Belgeyi Sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : (
                  /* PRIVATE NOTES & INTERNAL CRM REMINDERS TAB */
                  <div className="space-y-5">
                    {/* Privacy and Security Callout */}
                    <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-200/70 text-amber-800 flex items-center justify-center shrink-0">
                          <StickyNote className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                            <span>Dahili Müşteri Notları & Özel Hatırlatıcılar</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-bold">
                              Yalnızca Siz Görürsünüz
                            </span>
                          </div>
                          <p className="text-xs text-amber-800 font-medium">
                            Bu alana eklenen notlar <strong>müşteri portalında kesinlikle gösterilmez</strong>. Şirket içi ödeme takipleri, müşteri tercihleri ve özel hatırlatmalar için kullanılır.
                          </p>
                        </div>
                      </div>

                      {noteSaveFeedback && (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>{noteSaveFeedback}</span>
                        </div>
                      )}
                    </div>

                    {/* Fast Preset Tag Insertions */}
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                        <Pin className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Hızlı Hatırlatıcı ve Durum Etiketi Ekle:</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { label: "💳 Ödeme Takibi", tag: "Ödeme Takibi" },
                          { label: "⭐ VIP Müşteri", tag: "VIP Müşteri" },
                          { label: "📞 Takip Araması", tag: "Takip Araması" },
                          { label: "📋 Sözleşme Şartı", tag: "Sözleşme Şartı" },
                          { label: "⏰ Teslimat Hatırlatması", tag: "Teslimat Hatırlatması" },
                          { label: "⚠️ Özel Talimat", tag: "Özel Talimat" },
                          { label: "🏷️ İskonto Anlaşması", tag: "İskonto Anlaşması" }
                        ].map((item) => (
                          <button
                            key={item.tag}
                            type="button"
                            onClick={() => handleAppendTagToNotes(item.tag)}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-200 border border-slate-200 text-slate-700 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <span>+</span>
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea Workspace */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{selectedClient.name} İçin Özel Not Defteri</span>
                          {isNoteDirty && (
                            <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                              Kaydedilmemiş Değişiklik
                            </span>
                          )}
                        </label>

                        <span className="text-[11px] font-mono text-slate-400">
                          {inlineNotesDraft.length} karakter • {inlineNotesDraft.trim() ? inlineNotesDraft.trim().split(/\s+/).length : 0} kelime
                        </span>
                      </div>

                      <textarea
                        rows={7}
                        value={inlineNotesDraft}
                        onChange={(e) => {
                          setInlineNotesDraft(e.target.value);
                          setIsNoteDirty(true);
                        }}
                        placeholder="Örn:&#10;- 15 Eylül'de yeni filo teslimatı için arama yapılacak.&#10;- Ödemenin %50'si avans olarak tahsil edildi, kalan bakiye teslim tutanağı ile alınacak.&#10;- Müşteri yalnızca hafta içi saat 10:00 - 17:00 arasında aranmak istiyor."
                        className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 leading-relaxed font-sans transition-all"
                      />

                      {/* Action Bar */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const now = new Date();
                              const dateStr = now.toLocaleDateString("tr-TR");
                              const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
                              const prefix = `\n\n[Not Tarihi: ${dateStr} ${timeStr}]: `;
                              setInlineNotesDraft((prev) => `${prev.trim()}${prefix}`);
                              setIsNoteDirty(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Tarih / Saat Damgası Ekle</span>
                          </button>

                          {inlineNotesDraft.trim() && (
                            <button
                              type="button"
                              onClick={() => {
                                setInlineNotesDraft("");
                                setIsNoteDirty(true);
                              }}
                              className="px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Temizle
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveInlineNotes(selectedClient.id, inlineNotesDraft)}
                            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>Özel Notu Kaydet</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Best Practices Advice Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Dahili Not Alanı Nasıl Kullanılır?</span>
                      </div>
                      <ul className="list-disc list-inside space-y-1 text-slate-500 text-[11px] leading-relaxed">
                        <li><strong>Ödeme Anlaşmaları:</strong> Müşteriyle sözlü kararlaştırılan vade günleri ve avans tutarlarını kaydedin.</li>
                        <li><strong>Takip & Hatırlatmalar:</strong> Müşteriyi aramanız gereken kritik tarihleri ve görüşme özetlerini not edin.</li>
                        <li><strong>Hizmet Hassasiyetleri:</strong> Müşterinin özel talep ve tercihlerini (örn: teslimat saati, teslim alacak yetkili) ekleyin.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                <User className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">Hiç Müşteri Seçilmedi</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sol taraftaki listeden bir müşteri seçin veya yeni bir müşteri hesabı oluşturun.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CLIENT */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Yeni Müşteri & Giriş Şifresi Ekle</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddClientModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Müşteri Ad Soyad *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ahmet Yılmaz"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Firma / Kurum Adı</label>
                <input
                  type="text"
                  placeholder="Örn: Yılmaz Holding A.Ş. veya Bireysel"
                  value={newClientCompany}
                  onChange={(e) => setNewClientCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giriş E-posta Adresi (Kullanıcı Adı) *</label>
                <input
                  type="email"
                  required
                  placeholder="Örn: ahmet@firma.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Portal Giriş Şifresi *</label>
                  <button
                    type="button"
                    onClick={() => setNewClientPassword(generatePassword())}
                    className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Güçlü Şifre Üret</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newClientPassword}
                  onChange={(e) => setNewClientPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-indigo-900 bg-indigo-50/50 font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası (WhatsApp Paylaşımı İçin)</label>
                <input
                  type="text"
                  placeholder="+90 5XX XXX XX XX"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Dahili Notlar & Hatırlatıcılar</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-bold border border-amber-200/60">
                    Yalnızca Siz Görürsünüz
                  </span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Müşteri hakkında özel şirket içi notlar, ödeme anlaşması veya hatırlatmalar..."
                  value={newClientNotes}
                  onChange={(e) => setNewClientNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Müşteriyi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CLIENT */}
      {isEditClientModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Müşteri Bilgilerini Düzenle</h3>
              <button
                type="button"
                onClick={() => setIsEditClientModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditClient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Müşteri Adı</label>
                <input
                  type="text"
                  required
                  value={editingClient.name}
                  onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Firma / Kurum</label>
                <input
                  type="text"
                  value={editingClient.company}
                  onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Giriş E-posta Adresi</label>
                <input
                  type="email"
                  required
                  value={editingClient.email}
                  onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Şifre</label>
                  <button
                    type="button"
                    onClick={() => setEditingClient({ ...editingClient, password: generatePassword() })}
                    className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Yeni Şifre Üret
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={editingClient.password}
                  onChange={(e) => setEditingClient({ ...editingClient, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-indigo-900 bg-indigo-50/50 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası</label>
                <input
                  type="text"
                  value={editingClient.phone}
                  onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Dahili Notlar & Hatırlatıcılar</label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded font-bold border border-amber-200/60">
                    Yalnızca Siz Görürsünüz
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Bu müşteri hakkında şirket içi özel notlar, takip hatırlatmaları, ödeme planı..."
                  value={editingClient.notes || ""}
                  onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditClientModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Değişiklikleri Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD ORDER */}
      {isAddOrderModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Yeni Sipariş / İş Durumu Ekle</h3>
                  <p className="text-[11px] text-slate-500">Müşteri: {selectedClient.name} ({selectedClient.company})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOrderModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sipariş / Proje Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 3 Adet VIP Araç Transferi (İstanbul - İzmir)"
                  value={newOrderTitle}
                  onChange={(e) => setNewOrderTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hizmet / Ürün Türü</label>
                  <input
                    type="text"
                    placeholder="Örn: Kapalı Kasa Çekici"
                    value={newOrderService}
                    onChange={(e) => setNewOrderService(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tutar (Fiyat)</label>
                  <input
                    type="text"
                    placeholder="Örn: 12.500 ₺"
                    value={newOrderAmount}
                    onChange={(e) => setNewOrderAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Başlangıç Durumu</label>
                  <select
                    value={newOrderStatus}
                    onChange={(e) => setNewOrderStatus(e.target.value as ClientOrderStatus)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  >
                    <option value="pending">Beklemede</option>
                    <option value="in_progress">Hazırlanıyor</option>
                    <option value="in_transit">Yolda / Sevkiyatta</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Başlama Tarihi</label>
                  <input
                    type="date"
                    value={newOrderStartDate}
                    onChange={(e) => setNewOrderStartDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tahmini Teslim</label>
                  <input
                    type="date"
                    value={newOrderEstDate}
                    onChange={(e) => setNewOrderEstDate(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operasyon Notu & Açıklama</label>
                <textarea
                  rows={2}
                  placeholder="Müşterinin portalde göreceği detaylı operasyon notu..."
                  value={newOrderNotes}
                  onChange={(e) => setNewOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOrderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Siparişi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD DOCUMENT */}
      {isAddDocModalOpen && selectedClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Yeni Proje Belgesi / Fatura Yükle</h3>
                  <p className="text-[11px] text-slate-500">Müşteri: {selectedClient.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDocModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Belge / Dosya Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: 2026 Kurumsal Taşıma Sözleşmesi (İmzalı)"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Belge Kategorisi</label>
                  <select
                    value={newDocCategory}
                    onChange={(e) => setNewDocCategory(e.target.value as ClientDocumentCategory)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                  >
                    <option value="contract">Sözleşme & Anlaşma</option>
                    <option value="invoice">Fatura & Makbuz</option>
                    <option value="spec">Teknik Şartname</option>
                    <option value="report">Tutanak & Rapor</option>
                    <option value="other">Diğer Evrak</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosya Türü & Boyutu</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={newDocFileType}
                      onChange={(e) => setNewDocFileType(e.target.value as any)}
                      className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold font-mono text-slate-900"
                    >
                      <option value="pdf">PDF</option>
                      <option value="docx">DOCX</option>
                      <option value="xlsx">XLSX</option>
                      <option value="image">Görsel (JPG/PNG)</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Boyut (Örn: 1.8 MB)"
                      value={newDocFileSize}
                      onChange={(e) => setNewDocFileSize(e.target.value)}
                      className="w-1/2 px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-mono text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Belge Açıklaması</label>
                <textarea
                  rows={2}
                  placeholder="Müşterinin okuyabileceği açıklama veya şartname notu..."
                  value={newDocDescription}
                  onChange={(e) => setNewDocDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="doc-is-public"
                  checked={newDocIsPublic}
                  onChange={(e) => setNewDocIsPublic(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="doc-is-public" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Müşteri Portali Üzerinden İndirilebilir ve Görülebilir Olsun
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Belgeyi Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PORTAL GENERAL SETTINGS */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">Müşteri Portalı Ayarları</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Portal Başlığı</label>
                <input
                  type="text"
                  value={portalConfig.portalTitle}
                  onChange={(e) =>
                    updatePortalConfig({
                      ...portalConfig,
                      portalTitle: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Karşılama / Bilgilendirme Mesajı</label>
                <textarea
                  rows={3}
                  value={portalConfig.portalWelcomeMessage}
                  onChange={(e) =>
                    updatePortalConfig({
                      ...portalConfig,
                      portalWelcomeMessage: e.target.value
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destek E-posta</label>
                  <input
                    type="email"
                    value={portalConfig.supportEmail || ""}
                    onChange={(e) =>
                      updatePortalConfig({
                        ...portalConfig,
                        supportEmail: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destek Telefonu</label>
                  <input
                    type="text"
                    value={portalConfig.supportPhone || ""}
                    onChange={(e) =>
                      updatePortalConfig({
                        ...portalConfig,
                        supportPhone: e.target.value
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portalConfig.allowClientDownloads}
                    onChange={(e) =>
                      updatePortalConfig({
                        ...portalConfig,
                        allowClientDownloads: e.target.checked
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-700">Müşterilerin dosyaları indirmesine izin ver</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={portalConfig.requirePasswordChangeOnFirstLogin}
                    onChange={(e) =>
                      updatePortalConfig({
                        ...portalConfig,
                        requirePasswordChangeOnFirstLogin: e.target.checked
                      })
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-medium text-slate-700">İlk girişte şifre değiştirme zorunluluğu</span>
                </label>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Kapat & Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
