# Update Warna Theme - Earth & Stone Palette

Warna theme sudah diupdate sesuai dengan gambar yang dikirim. Theme sekarang menggunakan palette warna **Stone/Earth** yang soft dan natural.

## 🎨 Perubahan Warna Utama:

### Primary Colors
| Sebelum | Sesudah | Keterangan |
|---------|---------|------------|
| `#717b8d` | `#78716c` | Primary color (warm stone gray) |
| `#636c7d` | `#57534e` | Primary hover (darker stone) |
| `#eef1f4` | `#f5f5f4` | Primary light (light stone) |

### Background Colors
| Sebelum | Sesudah | Keterangan |
|---------|---------|------------|
| `#eef0f4` | `#f5f5f4` | Root background |
| `#fbfbfc` | `#fafaf9` | Surface background |
| `#f3f5f8` | `#f5f5f4` | Secondary background |

### Text Colors
| Sebelum | Sesudah | Keterangan |
|---------|---------|------------|
| `#161d29` | `#1c1917` | Primary text (warm dark) |
| `#5e6878` | `#57534e` | Secondary text (warm gray) |
| `#6a7384` | `#78716c` | Tertiary text (stone) |

### Border Colors
| Sebelum | Sesudah | Keterangan |
|---------|---------|------------|
| `#e5e8ee` | `#e7e5e4` | Subtle border |
| `#e2e6ec` | `#e7e5e4` | Default border |
| `#dde2e8` | `#d6d3d1` | Medium border |

### Sidebar Colors
| Sebelum | Sesudah | Keterangan |
|---------|---------|------------|
| `#fbfbfc` | `#fafaf9` | Sidebar background |
| `#e5e8ee` | `#e7e5e4` | Sidebar border |
| `#f1f3f6` | `#f5f5f4` | Menu hover |
| `#eceef1` | `#e7e5e4` | Menu active |

### Button Colors
| Sebelum | Sesudah | Keterangan |
|---------|---------|------------|
| `#717b8d` | `#78716c` | Primary button |
| `#f4f7fb` | `#fafaf9` | Primary button text |
| `#5e6878` | `#57534e` | Secondary button text |

## 🌈 Accent Colors Baru:

Accent colors yang lebih vibrant dan natural:
- **Teal**: `#14b8a6` - Untuk elemen hijau/teal
- **Emerald**: `#10b981` - Untuk elemen hijau
- **Purple**: `#a855f7` - Untuk elemen ungu
- **Pink**: `#ec4899` - Untuk elemen pink
- **Orange**: `#f97316` - Untuk elemen oranye
- **Blue**: `#3b82f6` - Untuk elemen biru
- **Yellow**: `#eab308` - Untuk elemen kuning

## 📋 Theme Presets yang Tersedia:

Di `themes.js` sekarang ada 13 theme presets:

1. **Stone (Default)** - Earth & warm gray (sesuai gambar)
2. **Modern Blue** - Clean blue
3. **Fresh Green** - Natural green
4. **Elegant Purple** - Modern purple
5. **Warm Orange** - Energetic orange
6. **Professional Navy** - Deep navy
7. **Soft Pink** - Gentle pink
8. **Teal** - Calming teal
9. **Indigo** - Rich indigo
10. **Rose** - Soft rose
11. **Earth (Stone)** - Warm stone gray
12. **Emerald** - Vibrant green
13. Dan masih banyak lagi...

## 🎯 Cara Menggunakan:

### 1. Gunakan Theme Default (Stone)
```jsx
import DashboardClean from "./components/dashboard/DashboardClean";

// Otomatis menggunakan theme Stone/Earth
<DashboardClean />
```

### 2. Ganti ke Theme Lain
```jsx
import { applyTheme } from "./styles/themes";

// Ganti ke Emerald
applyTheme("emerald");

// Ganti ke Modern Blue
applyTheme("blue");

// Ganti ke Teal
applyTheme("teal");
```

### 3. Gunakan Theme Switcher
```jsx
import ThemeSwitcher from "./components/dashboard/ThemeSwitcher";

<ThemeSwitcher
  currentTheme="stone"
  onThemeChange={(theme) => console.log(theme)}
/>
```

## ✨ Hasil:

Dashboard sekarang memiliki tampilan yang lebih **warm, natural, dan earthy** dengan karakteristik:
- ✅ Soft stone gray backgrounds
- ✅ Warm text colors (tidak terlalu cool/cool gray)
- ✅ Subtle borders yang lembut
- ✅ Professional dan calming
- ✅ Sesuai dengan gambar yang dikirim
- ✅ Eye-friendly dan comfortable

## 🔄 Jika Ingin Kembali ke Warna Lama:

Edit `src/styles/theme.css` dan ubah kembali ke nilai original, atau gunakan theme preset lain di `themes.js`.