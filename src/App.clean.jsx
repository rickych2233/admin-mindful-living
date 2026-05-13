/**
 * Example App using Clean Dashboard
 * Ini adalah contoh implementasi lengkap dashboard dengan clean code dan global theme
 */
import React from "react";
import DashboardClean from "./components/dashboard/DashboardClean";

// Import theme CSS (jangan lupa import di index.css atau App.css utama)
// import "./styles/theme.css";

function App() {
  return (
    <div className="app">
      <DashboardClean />
    </div>
  );
}

export default App;

/*
CARA PENGGUNAAN:

1. Pastikan sudah import theme.css di file CSS utama:
   Di src/index.css atau src/App.css:
   ```css
   @import "./styles/theme.css";
   ```

2. Gunakan komponen DashboardClean:
   ```jsx
   import DashboardClean from "./components/dashboard/DashboardClean";
   ```

3. Atau gunakan SidebarNavClean untuk custom page:
   ```jsx
   import SidebarNavClean from "./components/dashboard/SidebarNavClean";

   function MyCustomPage() {
     const [activeItem, setActiveItem] = useState("dashboard");
     const [isSidebarOpen, setSidebarOpen] = useState(false);

     return (
       <div className="my-page">
         <SidebarNavClean
           activeItem={activeItem}
           isOpen={isSidebarOpen}
           onClose={() => setSidebarOpen(false)}
           onSelectItem={setActiveItem}
           onLogout={() => console.log("Logout")}
           userProfile={{
             name: "Nama User",
             email: "email@example.com",
             avatar: null
           }}
         />
         <main>
           {/* Content kamu */}
         </main>
       </div>
     );
   }
   ```

4. Mengubah warna tema:
   - Buka file src/styles/theme.css
   - Ubah nilai --color-primary dan variabel warna lainnya
   - Atau gunakan ThemeSwitcher component untuk runtime theme change

5. Menambah halaman baru:
   - Edit src/components/dashboard/sidebarItems.js
   - Tambah item baru ke array sidebarMainItems

FITUR YANG TERSEDIA:
- ✅ Responsive sidebar (desktop selalu muncul, mobile toggle)
- ✅ Global theme variables (mudah ganti warna)
- ✅ Theme switcher dengan 10+ preset colors
- ✅ Clean code structure
- ✅ User profile section
- ✅ Mobile-friendly design
- ✅ Accessible components
- ✅ Smooth animations dan transitions
- ✅ Dark mode ready (opsional)
*/