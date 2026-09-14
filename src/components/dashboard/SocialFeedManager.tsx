import React, { useState } from "react";
import { SiteConfig, SocialMediaFeedConfig, SocialFeedPost } from "../../types";
import { DEFAULT_SOCIAL_FEED_CONFIG } from "../../data/mockData";
import {
  Instagram,
  Twitter,
  RefreshCw,
  Plus,
  Trash2,
  Pin,
  ExternalLink,
  CheckCircle2,
  Sliders,
  LayoutGrid,
  Columns,
  Sparkles,
  Eye,
  Check,
  Search,
  MessageCircle,
  Heart,
  Repeat2,
  ShieldCheck,
  Smartphone,
  Calendar,
  AlertCircle,
  Clock,
  Layers
} from "lucide-react";

interface SocialFeedManagerProps {
  config: SiteConfig;
  onChange: (updatedConfig: SiteConfig) => void;
  onPreview?: () => void;
}

export const SocialFeedManager: React.FC<SocialFeedManagerProps> = ({
  config,
  onChange,
  onPreview
}) => {
  const feed: SocialMediaFeedConfig = config.socialFeed || DEFAULT_SOCIAL_FEED_CONFIG;

  const [activeTab, setActiveTab] = useState<"posts" | "accounts" | "layout" | "preview">("posts");
  const [platformFilter, setPlatformFilter] = useState<"all" | "instagram" | "twitter">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // New Post Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPostPlatform, setNewPostPlatform] = useState<"instagram" | "twitter">("instagram");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostMediaUrl, setNewPostMediaUrl] = useState("");
  const [newPostAuthorName, setNewPostAuthorName] = useState(config.companyName || "Yıldız Oto Kurtarma");
  const [newPostAuthorHandle, setNewPostAuthorHandle] = useState(
    feed.instagramHandle ? `@${feed.instagramHandle.replace('@', '')}` : "@yildizkurtarma"
  );
  const [newPostLikes, setNewPostLikes] = useState(150);
  const [newPostComments, setNewPostComments] = useState(12);
  const [newPostRetweets, setNewPostRetweets] = useState(24);
  const [newPostUrl, setNewPostUrl] = useState("");
  const [newPostHashtags, setNewPostHashtags] = useState("#yolyardım #çekici #hizmet");

  // Account connection verification test states
  const [verifiedAccounts, setVerifiedAccounts] = useState<{ [key: string]: boolean }>({
    instagram: true,
    twitter: true
  });
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null);

  const updateFeed = (updatedFeed: Partial<SocialMediaFeedConfig>) => {
    const nextFeed: SocialMediaFeedConfig = {
      ...feed,
      ...updatedFeed
    };

    // Also synchronize homepageSection enabled state
    const nextSections = config.homepageSections ? config.homepageSections.map(sec => {
      if (sec.id === "socialFeed") {
        return { ...sec, enabled: nextFeed.enabled };
      }
      return sec;
    }) : undefined;

    onChange({
      ...config,
      socialFeed: nextFeed,
      homepageSections: nextSections
    });
  };

  // Handler for simulating live API fetch
  const handleSyncLiveFeeds = () => {
    setIsSyncing(true);
    setSyncSuccessMsg(null);

    setTimeout(() => {
      setIsSyncing(false);
      const simulatedNewPost: SocialFeedPost = {
        id: `post-synced-${Date.now()}`,
        platform: Math.random() > 0.5 ? "instagram" : "twitter",
        authorName: config.companyName || "Yıldız Oto Kurtarma",
        authorHandle: feed.instagramHandle ? `@${feed.instagramHandle.replace('@', '')}` : "@yildizkurtarma",
        authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
        isVerified: true,
        content: `Yeni canlı operasyon: Kadıköy ve çevresi nöbetçi kurtarma ekibimiz saat 15:20 itibarıyla aktif görev başında. Güvenli yolculuklar dileriz! 🚀🛠️`,
        mediaUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80",
        mediaType: "image",
        timestamp: "Az önce",
        likesCount: Math.floor(Math.random() * 80) + 120,
        commentsCount: Math.floor(Math.random() * 20) + 8,
        retweetsCount: Math.floor(Math.random() * 30) + 10,
        postUrl: "https://instagram.com",
        pinned: false,
        hashtags: ["#canlıoperasyon", "#yolyardım", "#güncel"]
      };

      const nextPosts = [simulatedNewPost, ...feed.posts];
      updateFeed({
        posts: nextPosts,
        lastSyncedAt: "Az önce güncellendi"
      });

      setSyncSuccessMsg("Instagram Graph API ve X API v2 üzerinden en son gönderiler başarıyla çekildi!");
      setTimeout(() => setSyncSuccessMsg(null), 4000);
    }, 1200);
  };

  // Verification test
  const handleVerifyAccount = (platform: "instagram" | "twitter") => {
    setVerifyingPlatform(platform);
    setTimeout(() => {
      setVerifyingPlatform(null);
      setVerifiedAccounts(prev => ({ ...prev, [platform]: true }));
    }, 800);
  };

  // Add Post
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const parsedTags = newPostHashtags
      .split(/[\s,]+/)
      .map(tag => (tag.startsWith("#") ? tag : `#${tag}`))
      .filter(tag => tag.length > 1);

    const newPost: SocialFeedPost = {
      id: `post-custom-${Date.now()}`,
      platform: newPostPlatform,
      authorName: newPostAuthorName.trim() || config.companyName || "İşletme Adı",
      authorHandle: newPostAuthorHandle.trim() || (newPostPlatform === "instagram" ? "@instagram" : "@x"),
      authorAvatar: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80",
      isVerified: true,
      content: newPostContent.trim(),
      mediaUrl: newPostMediaUrl.trim() || (newPostPlatform === "instagram" ? "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" : undefined),
      mediaType: newPostMediaUrl.trim() ? "image" : undefined,
      timestamp: "Az önce",
      likesCount: Number(newPostLikes) || 0,
      commentsCount: Number(newPostComments) || 0,
      retweetsCount: newPostPlatform === "twitter" ? Number(newPostRetweets) || 0 : undefined,
      postUrl: newPostUrl.trim() || (newPostPlatform === "instagram" ? (feed.instagramProfileUrl || "https://instagram.com") : (feed.twitterProfileUrl || "https://x.com")),
      pinned: false,
      hashtags: parsedTags
    };

    updateFeed({
      posts: [newPost, ...feed.posts]
    });

    // Reset & close
    setNewPostContent("");
    setNewPostMediaUrl("");
    setIsAddModalOpen(false);
  };

  // Toggle Pin
  const handleTogglePin = (postId: string) => {
    const nextPosts = feed.posts.map(p => {
      if (p.id === postId) {
        return { ...p, pinned: !p.pinned };
      }
      return p;
    });
    updateFeed({ posts: nextPosts });
  };

  // Delete Post
  const handleDeletePost = (postId: string) => {
    const nextPosts = feed.posts.filter(p => p.id !== postId);
    updateFeed({ posts: nextPosts });
  };

  // Filtered posts for list
  const filteredPosts = feed.posts.filter(post => {
    const matchesPlatform = platformFilter === "all" || post.platform === platformFilter;
    const matchesSearch =
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.authorHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (post.hashtags && post.hashtags.some(h => h.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesPlatform && matchesSearch;
  });

  const instagramPostsCount = feed.posts.filter(p => p.platform === "instagram").length;
  const twitterPostsCount = feed.posts.filter(p => p.platform === "twitter").length;

  return (
    <div className="space-y-6" id="social-feed-manager">
      {/* Top Banner & Main Toggle */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
            <Instagram className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Canlı Sosyal Medya Akışı & Entegrasyon
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-100 text-pink-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Instagram & X (Twitter)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              İşletmenizin en yeni Instagram fotoğraf ve hikaye paylaşımları ile X (Twitter) duyurularını ana sayfanızda canlı, etkileşimli bir medya duvarı olarak sergileyin.
            </p>
          </div>
        </div>

        {/* Master Enabled Switch & Live Preview Trigger */}
        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          {onPreview && (
            <button
              type="button"
              onClick={onPreview}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-slate-500" />
              <span>Sitede İncele</span>
            </button>
          )}

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={feed.enabled}
              onChange={(e) => updateFeed({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
            <span className="ml-2.5 text-xs font-bold text-slate-800">
              {feed.enabled ? "Akış Aktif" : "Pasif"}
            </span>
          </label>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{syncSuccessMsg}</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-mono">200 OK</span>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("posts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "posts"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Gönderi Yönetimi ({feed.posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "accounts"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Hesap Bağlantıları</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("layout")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "layout"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Vitrin & Düzen</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "preview"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Canlı Önizleme</span>
          </button>
        </div>

        {/* Sync Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSyncLiveFeeds}
            className="px-3.5 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Instagram ve X hesaplarınızdan en son gönderileri tara ve senkronize et"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Senkronize Ediliyor..." : "Yeni Gönderileri Çek (Sync API)"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manuel Gönderi Ekle</span>
          </button>
        </div>
      </div>

      {/* TAB 1: POSTS CURATION */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          {/* Sub-toolbar: Platform filter & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setPlatformFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  platformFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Tümü ({feed.posts.length})
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter("instagram")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  platformFilter === "instagram"
                    ? "bg-pink-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Instagram className="w-3 h-3" />
                <span>Instagram ({instagramPostsCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setPlatformFilter("twitter")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  platformFilter === "twitter"
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <Twitter className="w-3 h-3" />
                <span>X (Twitter) ({twitterPostsCount})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Gönderi içeriği veya etiket ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          {/* Posts Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPosts.map((post) => {
              const isIg = post.platform === "instagram";
              return (
                <div
                  key={post.id}
                  className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden shadow-2xs hover:shadow-md ${
                    post.pinned ? "border-amber-400 ring-1 ring-amber-400" : "border-slate-200"
                  }`}
                >
                  {/* Card Top */}
                  <div>
                    {/* Header */}
                    <div className="p-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0 text-[10px] font-bold ${
                            isIg
                              ? "bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600"
                              : "bg-slate-950"
                          }`}
                        >
                          {isIg ? <Instagram className="w-3.5 h-3.5" /> : <Twitter className="w-3 h-3" />}
                        </span>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {post.authorHandle}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {post.timestamp}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleTogglePin(post.id)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            post.pinned
                              ? "bg-amber-100 text-amber-700"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                          title={post.pinned ? "Sabitlemeyi Kaldır" : "En Başa Sabitle"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Gönderiyi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Media Thumbnail if present */}
                    {post.mediaUrl && (
                      <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-100">
                        <img
                          src={post.mediaUrl}
                          alt={post.authorName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        {post.pinned && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                            <Pin className="w-3 h-3" />
                            <span>Sabitlendi</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content text */}
                    <div className="p-3.5">
                      <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">
                        {post.content}
                      </p>

                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.hashtags.slice(0, 3).map((h, i) => (
                            <span key={i} className="text-[10px] font-medium text-pink-600">
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
                    <div className="flex items-center gap-3 text-[11px] font-mono">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        <span>{post.likesCount || 0}</span>
                      </span>
                      {isIg ? (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                          <span>{post.commentsCount || 0}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Repeat2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{post.retweetsCount || 0}</span>
                        </span>
                      )}
                    </div>

                    <a
                      href={post.postUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-slate-700 hover:text-pink-600 flex items-center gap-1 transition-colors"
                    >
                      <span>Orijinal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <Instagram className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Filtreye uygun gönderi bulunamadı</p>
              <p className="text-xs text-slate-400 mt-1">Arama terimini değiştirin veya yeni bir gönderi ekleyin.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONNECTED ACCOUNTS & API SETTINGS */}
      {activeTab === "accounts" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Instagram Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <Instagram className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Instagram Hesabı</h3>
                  <p className="text-xs text-pink-100">Fotoğraf ve Reels Vitrini</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Bağlı
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instagram Kullanıcı Adı (Handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={feed.instagramHandle || ""}
                    onChange={(e) => updateFeed({ instagramHandle: e.target.value.replace('@', '') })}
                    placeholder="yildizotokurtarma"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-pink-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instagram Profil Bağlantısı (URL)
                </label>
                <input
                  type="text"
                  value={feed.instagramProfileUrl || ""}
                  onChange={(e) => updateFeed({ instagramProfileUrl: e.target.value })}
                  placeholder="https://instagram.com/yildizotokurtarma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-pink-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Görüntülenecek Takipçi Sayısı
                </label>
                <input
                  type="text"
                  value={feed.instagramFollowers || ""}
                  onChange={(e) => updateFeed({ instagramFollowers: e.target.value })}
                  placeholder="Örn: 14.8K"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-pink-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleVerifyAccount("instagram")}
                  disabled={verifyingPlatform === "instagram"}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{verifyingPlatform === "instagram" ? "Kontrol ediliyor..." : "Bağlantıyı Doğrula"}</span>
                </button>

                <a
                  href={feed.instagramProfileUrl || `https://instagram.com/${feed.instagramHandle || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
                >
                  <span>Profile Git</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* X (Twitter) Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="bg-slate-950 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <Twitter className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold">X (Twitter) Hesabı</h3>
                  <p className="text-xs text-slate-400">Canlı Duyurular & Durum Paylaşımları</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Bağlı
              </span>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  X Kullanıcı Adı (Handle)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">@</span>
                  <input
                    type="text"
                    value={feed.twitterHandle || ""}
                    onChange={(e) => updateFeed({ twitterHandle: e.target.value.replace('@', '') })}
                    placeholder="yildizkurtarma"
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  X Profil Bağlantısı (URL)
                </label>
                <input
                  type="text"
                  value={feed.twitterProfileUrl || ""}
                  onChange={(e) => updateFeed({ twitterProfileUrl: e.target.value })}
                  placeholder="https://x.com/yildizkurtarma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Görüntülenecek Takipçi Sayısı
                </label>
                <input
                  type="text"
                  value={feed.twitterFollowers || ""}
                  onChange={(e) => updateFeed({ twitterFollowers: e.target.value })}
                  placeholder="Örn: 9.2K"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:ring-1 focus:ring-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleVerifyAccount("twitter")}
                  disabled={verifyingPlatform === "twitter"}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{verifyingPlatform === "twitter" ? "Kontrol ediliyor..." : "Bağlantıyı Doğrula"}</span>
                </button>

                <a
                  href={feed.twitterProfileUrl || `https://x.com/${feed.twitterHandle || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
                >
                  <span>Profile Git</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LAYOUT & DISPLAY CUSTOMIZER */}
      {activeTab === "layout" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Vitrin Başlıkları ve Metinler</h3>
            <p className="text-xs text-slate-500">Ana sayfadaki sosyal medya bölümünün başlık ve açıklama etiketleri.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Üst Rozet (Badge)</label>
              <input
                type="text"
                value={feed.badge || ""}
                onChange={(e) => updateFeed({ badge: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Ana Başlık</label>
              <input
                type="text"
                value={feed.title || ""}
                onChange={(e) => updateFeed({ title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1">Açıklama / Alt Başlık</label>
              <textarea
                rows={2}
                value={feed.subtitle || ""}
                onChange={(e) => updateFeed({ subtitle: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900 focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 mb-3">Düzen Formatı (Layout Style)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => updateFeed({ layout: "grid" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  (feed.layout || "grid") === "grid"
                    ? "border-pink-600 bg-pink-50/50 ring-1 ring-pink-600"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <LayoutGrid className="w-5 h-5 text-pink-600 mb-2" />
                <span className="text-xs font-bold text-slate-900 block">Klasik Izgara (Grid)</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Eşit 3 kolonlu modern kart dizilimi</span>
              </button>

              <button
                type="button"
                onClick={() => updateFeed({ layout: "carousel" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  feed.layout === "carousel"
                    ? "border-pink-600 bg-pink-50/50 ring-1 ring-pink-600"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <Repeat2 className="w-5 h-5 text-pink-600 mb-2" />
                <span className="text-xs font-bold text-slate-900 block">Kaydırılabilir (Carousel)</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Yatay kaydırmalı akış kartları</span>
              </button>

              <button
                type="button"
                onClick={() => updateFeed({ layout: "masonry" })}
                className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                  feed.layout === "masonry"
                    ? "border-pink-600 bg-pink-50/50 ring-1 ring-pink-600"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <Columns className="w-5 h-5 text-pink-600 mb-2" />
                <span className="text-xs font-bold text-slate-900 block">Mozaik (Masonry)</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Dinamik yükseklikli Pinterest tarzı</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Gösterilecek Maksimum Gönderi Sayısı: <span className="text-pink-600">{feed.postsLimit || 6}</span>
              </label>
              <div className="flex items-center gap-2">
                {[3, 4, 6, 8, 12].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => updateFeed({ postsLimit: num })}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      (feed.postsLimit || 6) === num
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {num} Gönderi
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Görünürlük ve Etkileşim Seçenekleri
              </label>
              
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feed.showEngagement !== false}
                  onChange={(e) => updateFeed({ showEngagement: e.target.checked })}
                  className="rounded-sm border-slate-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-xs font-medium text-slate-700">Beğeni ve Yorum Sayılarını Göster</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={feed.showCaptions !== false}
                  onChange={(e) => updateFeed({ showCaptions: e.target.checked })}
                  className="rounded-sm border-slate-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="text-xs font-medium text-slate-700">Gönderi Açıklama Metnini Göster</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INTERACTIVE PREVIEW */}
      {activeTab === "preview" && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
              <span>📱</span>
              <span>{feed.badge}</span>
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{feed.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">{feed.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {feed.posts.slice(0, feed.postsLimit || 6).map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                        <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{post.authorHandle}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{post.timestamp}</span>
                      </div>
                    </div>
                    {post.platform === "instagram" ? (
                      <Instagram className="w-4 h-4 text-pink-600" />
                    ) : (
                      <Twitter className="w-3.5 h-3.5 text-slate-900" />
                    )}
                  </div>

                  {post.mediaUrl && (
                    <div className="aspect-video bg-slate-100 overflow-hidden">
                      <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-4">
                    <p className="text-xs text-slate-700 line-clamp-3 leading-relaxed">{post.content}</p>
                  </div>
                </div>

                <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Heart className="w-3.5 h-3.5 text-rose-500" />
                      <span>{post.likesCount}</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <MessageCircle className="w-3.5 h-3.5 text-slate-400" />
                      <span>{post.commentsCount || post.retweetsCount}</span>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-pink-600">İncele →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: MANUAL POST ADDITION */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-600" />
                <span>Manuel Gönderi Ekle</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Platform Seçin</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPostPlatform("instagram");
                      setNewPostAuthorHandle(feed.instagramHandle ? `@${feed.instagramHandle.replace('@', '')}` : "@instagram");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      newPostPlatform === "instagram"
                        ? "bg-pink-50 border-pink-600 text-pink-700 ring-1 ring-pink-600"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewPostPlatform("twitter");
                      setNewPostAuthorHandle(feed.twitterHandle ? `@${feed.twitterHandle.replace('@', '')}` : "@x");
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      newPostPlatform === "twitter"
                        ? "bg-slate-900 border-slate-900 text-white"
                        : "bg-white border-slate-200 text-slate-700"
                    }`}
                  >
                    <Twitter className="w-4 h-4" />
                    <span>X (Twitter)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kullanıcı Adı (Handle)
                </label>
                <input
                  type="text"
                  required
                  value={newPostAuthorHandle}
                  onChange={(e) => setNewPostAuthorHandle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gönderi / Tweet Metni
                </label>
                <textarea
                  required
                  rows={3}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Gönderinizde paylaşmak istediğiniz açıklama veya durum güncellemesi..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Görsel Bağlantısı (URL)
                </label>
                <input
                  type="url"
                  value={newPostMediaUrl}
                  onChange={(e) => setNewPostMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Beğeni Sayısı</label>
                  <input
                    type="number"
                    value={newPostLikes}
                    onChange={(e) => setNewPostLikes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {newPostPlatform === "instagram" ? "Yorum Sayısı" : "Retweet Sayısı"}
                  </label>
                  <input
                    type="number"
                    value={newPostPlatform === "instagram" ? newPostComments : newPostRetweets}
                    onChange={(e) =>
                      newPostPlatform === "instagram"
                        ? setNewPostComments(Number(e.target.value))
                        : setNewPostRetweets(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Etiketler (Hashtags)</label>
                <input
                  type="text"
                  value={newPostHashtags}
                  onChange={(e) => setNewPostHashtags(e.target.value)}
                  placeholder="#yolyardım #çekici #hizmet"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Gönderiyi Kaydet & Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
