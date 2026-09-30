# JetKur Cloudflare Production Publishing Activation Runbook (Sprint 16.2)

> **DİKKAT:** Bu belge JetKur kontrol düzlemi operatörleri içindir. Gizli anahtar veya token içermez.

---

## 1. Mevcut Doğrulanmış Cloudflare Durumu
- **Plan:** Cloudflare Free
- **Worker Adı:** `jetkur-customer-sites`
- **Workers.dev Adresi:** `https://jetkur-customer-sites.selimoyan.workers.dev`
- **Mevcut Durum:** Aktif, erişilebilir, `Hello World!` yanıtı dönüyor.
- **Root Zone DNS:** `jetkur.com.tr`, `www.jetkur.com.tr`, `preview.jetkur.com.tr` Proxied olarak VPS (`168.231.125.238`) adresini gösteriyor. **Kesinlikle dokunulmayacaktır.**

---

## 1.1 Doğrulanmış Cloudflare Workers Static Assets Limitleri
- **Worker Sürümü Başına Statik Dosya Limiti:** `20,000` dosya (`STATIC_ASSET_FILES_PER_WORKER_VERSION = 20,000`)
- **Tekil Statik Dosya Boyut Sınırı:** `25 MiB` (`MAX_INDIVIDUAL_STATIC_ASSET_SIZE = 25 MiB`)
- **Toplam Dağıtım Paketi Sınırı:** 25 MiB bir paket toplamı sınırı DEĞİLDİR; tekil dosya başına geçerlidir. Toplam paket için yapay bir 25 MiB kısıtı bulunmamaktadır (`TOTAL_DEPLOYMENT_25_MIB_LIMIT_EXISTS = false`).

---

## 2. Gerekli Cloudflare API Token İzinleri (Dar Kapsam / Least Privilege)

Aşağıdaki izinler aşamalı olarak ve minimum yetki ilkesiyle talep edilir:

### Aşama 1: Worker & Static Assets Dağıtımı (Workers.dev)
- **Minimum Token Kapsamı:** `Workers Scripts: Edit` (Hedef: Yalnızca mevcut `jetkur-customer-sites` Worker'ı, Rol: `Editor`)
- **Account Settings Read Gerekli mi:** **HAYIR** (`CLOUDFLARE_ACCOUNT_ID` ortam değişkeninden doğrudan sağlandığı için Account Settings izni gerekmez)
- **DNS İzni Gerekli mi:** **HAYIR**
- **Workers Routes İzni Gerekli mi:** **HAYIR**
- **SSL / Certificate İzni Gerekli mi:** **HAYIR**

### Aşama 2: Özel Alt Alan Adı Yönlendirmesi (demo.jetkur.com.tr)
- **Workers Routes:** `Edit` (Yalnızca `demo.jetkur.com.tr/*` Worker route eşleştirmesi için)
- **DNS Records:** `Edit` (Yalnızca `demo.jetkur.com.tr` CNAME kaydı için)

### Aşama 3: Müşteri Özel Alan Adları (Custom Domains)
- **SSL and Certificates:** `Edit` (Cloudflare SSL for SaaS custom hostname yönetimi için)

---

## 3. Gerekli JetKur Ortam Değişkenleri

| Değişken Adı | Varsayılan Değer | Açıklama |
|---|---|---|
| `CLOUDFLARE_WORKER_NAME` | `jetkur-customer-sites` | Hedef Worker adı (diğer Worker'ları korur) |
| `CLOUDFLARE_STATIC_ASSETS_MODE` | `DRY_RUN` | `REAL` yapılmadığı sürece harici API çağrısı yapılmaz |
| `CLOUDFLARE_ACCOUNT_ID` | Boş | Cloudflare hesap kimliği |
| `CLOUDFLARE_API_TOKEN` | Boş | Yalnızca sunucu tarafında tutulan API erişim belirteci |
| `CLOUDFLARE_WORKERS_DEV_HOSTNAME` | `jetkur-customer-sites.selimoyan.workers.dev` | Test ve duman doğrulaması için workers.dev adresi |

---

## 4. Coolify Secrets Yapılandırması

1. Coolify kontrol panelinde JetKur uygulamasına gidin.
2. **Environment Variables** sekmesini açın.
3. `CLOUDFLARE_API_TOKEN` ve `CLOUDFLARE_ACCOUNT_ID` değerlerini güvenli değişken olarak ekleyin.
4. `CLOUDFLARE_STATIC_ASSETS_MODE` başlangıçta `DRY_RUN` olarak bırakılmalıdır.
5. Değişiklikleri kaydedin ve konteyneri yeniden başlatın.

---

## 5. DRY_RUN Modu ve Koruma Kalkanı

- Sistem varsayılan olarak `DRY_RUN` modundadır.
- `DRY_RUN` modunda statik artefaktlar (`sites/<siteId>/v<version>/`) ve yönlendirme manifestosu bellek içinde hesaplanır.
- Cloudflare API'sine tek bir istek gönderilmez.
- Müşteri arayüzünde taslaklar kesinlikle "Yayında" (LIVE) olarak etiketlenmez.

---

## 6. İlk Gerçek Demo Dağıtımı Nasıl Yapılır?

1. Coolify üzerinde `CLOUDFLARE_STATIC_ASSETS_MODE=REAL` olarak ayarlayın.
2. JetKur kontrol panelinden demo site için yayınlama planını tetikleyin.
3. Adaptör:
   - Statik artefaktı doğrular (0 Tailwind CDN, 0 harici script sızıntısı).
   - Yalnızca `jetkur-customer-sites` hedefi için Cloudflare Assets upload session başlatır.
   - Script ve Asset bağlantısını yükler.
4. Dağıtım tamamlandıktan sonra otomatik duman testi çalışır.

---

## 7. Workers.dev Üzerinden Doğrulama

- Tarayıcıda `https://jetkur-customer-sites.selimoyan.workers.dev/` adresine gidin.
- HTTP `200 OK` yanıtı ve HTML içinde:
  - `<meta name="jetkur-site-id" content="site-demo-...">`
  - `<meta name="jetkur-deployment-version" content="...">`
  etiketlerini doğrulayın.

---

## 8. Acil Durum Geri Alma (Emergency Rollback)

Eğer yayınlanan yeni bir sürümde sorun yaşanırsa:
1. `POST /api/publishing/rollback` çağrısı yapın veya admin panelinden önceki sürüme tıklayın.
2. Yönlendirme manifestosu anında hedef versiyonun (`sites/<siteId>/v<eski>/`) önekine geri çevrilir.
3. Dosyaların yeniden üretilmesine veya baştan derlenmesine gerek kalmaz.

---

## 9. REAL Modunu Devre Dışı Bırakma

- Herhangi bir şüphe durumunda Coolify üzerinden `CLOUDFLARE_STATIC_ASSETS_MODE=DRY_RUN` yaparak tüm dış API çağrılarını anında durdurabilirsiniz.

---

## 10. DNS Tarafında Henüz Değiştirilmeyecek Kayıtlar

- **DEĞİŞTİRME:** `jetkur.com.tr` (A kaydı Coolify sunucusunu göstermeye devam etmelidir).
- **DEĞİŞTİRME:** `www.jetkur.com.tr` ve `preview.jetkur.com.tr`.
- **OLUŞTURMA:** `*.jetkur.com.tr` (Wildcard DNS bu aşamada oluşturulmaz).
- **OLUŞTURMA:** `demo.jetkur.com.tr` (Aşama 2 onaylanana kadar oluşturulmaz).
