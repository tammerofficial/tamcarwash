# Tenant Branding JSON API

Single source of truth for tenant colors, logo, and social links. Data is read from `tenants.settings` / `tenants.metadata` via `App\Support\BrandingHelper` — the same storage used by the web Appearance page and Blade CSS variables.

## Endpoints

| URL | Auth | Response shape | Notes |
|-----|------|----------------|-------|
| `GET /api/v1/storefront/branding` | None | `{ success, data, message }` | Standard API envelope |
| `GET /api/v1/branding.json` | None | Flat JSON object | CDN-friendly; `Cache-Control: public, max-age=300`; CORS `*` |

## Tenant resolution

Same as other storefront routes:

1. **Subdomain** — `https://{tenant-slug}.tamcarwash.test/api/v1/storefront/branding`
2. **Custom domain** — tenant mapped in landlord DB
3. **Header** — `X-Tenant-Slug: alwadi-wash2df` (required on central domain / Flutter)
4. **Local fallback** — `?tenant_slug=alwadi-wash2df` when `APP_ENV=local`

## JSON schema (`data` or flat `branding.json`)

```json
{
  "tenant_slug": "alwadi-wash2df",
  "business_name": "الوادي للغسيل",
  "primary_color": "#47004d",
  "secondary_color": "#14b8a6",
  "primary_color_dark": "#2e0032",
  "logo_url": "https://example.com/storage/tenants/1/branding/logo.png",
  "tagline": "غسيل سيارات احترافي",
  "about": null,
  "social": {
    "instagram": "https://instagram.com/...",
    "twitter": "https://x.com/..."
  }
}
```

## Flutter example

```dart
final uri = Uri.parse('https://alwadi-wash2df.tamcarwash.test/api/v1/branding.json');
// On central domain without subdomain, add header: X-Tenant-Slug: alwadi-wash2df
final response = await http.get(uri, headers: {'Accept': 'application/json'});
final branding = jsonDecode(response.body);
final primary = Color(int.parse(branding['primary_color'].substring(1), radix: 16) + 0xFF000000);
```

## curl (local, central domain)

```bash
curl -s -H "Accept: application/json" -H "X-Tenant-Slug: alwadi-wash2df" \
  http://127.0.0.1:8000/api/v1/storefront/branding | jq .

curl -s -H "Accept: application/json" -H "X-Tenant-Slug: alwadi-wash2df" \
  http://127.0.0.1:8000/api/v1/branding.json | jq .
```

Web SPA continues to inject CSS variables from Blade (`--brand-primary`, `--brand-secondary`). React may optionally call `useStorefrontBranding()` to refresh branding at runtime without a full page reload.
