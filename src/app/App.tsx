import React, { useState } from 'react';
import { Clock } from '@/app/components/Clock';
import { PinKiosk } from '@/app/components/PinKiosk';
import { Dashboard } from '@/app/components/Dashboard';
import { Toaster } from 'sonner';
import logo from "/assets/Logo.png";
import '../styles/index.css';
import '../styles/theme.css';
import '../styles/tailwind.css';
import '../styles/fonts.css';
interface User {
  id: string;
  company_id: string;
  full_name: string;
  pin_ponto: string;
}

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-slate-200">
      <Toaster position="top-center" richColors />
      
      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-screen bg-[rgb(255,255,255)] relative">
        <div className="flex-1 flex flex-col items-center justify-center w-full">
          {!currentUser ? (
            <>
              <div className="flex items-center justify-center mb-[-140px]">
                <img src={logo} alt="Logotipo" className="h-[400px] w-[400px]" />
              </div>
              <PinKiosk onSuccess={handleLoginSuccess} />
            </>
          ) : (
            <Dashboard user={currentUser} onLogout={handleLogout} />
          )}
        </div>
      </main>
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default App;
