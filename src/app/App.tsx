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
    <div className="min-h-dvh w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <Toaster position="top-center" richColors />
      
      <main className="
        w-full h-dvh
        flex flex-col items-center justify-center
        relative
      ">
        {!currentUser ? (
          <>
            <div className="flex items-center justify-center">
              <img 
                src={logo} 
                alt="Logotipo" 
                className="
                  h-[400px] w-[400px]
                  portrait:h-[550px] portrait:w-[550px]
                "
              />
            </div>
            <PinKiosk onSuccess={handleLoginSuccess} />
          </>
        ) : (
          <Dashboard user={currentUser} onLogout={handleLogout} />
        )}
      </main>
  
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default App;
