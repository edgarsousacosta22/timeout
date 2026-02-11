No portrait quero a imagem e resto mais para cima

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
    <div className="min-h-dvh w-full overflow-hidden bg-slate-50 font-sans text-slate-900">
      <Toaster position="top-center" richColors />
  
      <main className="
        w-full h-dvh
        flex flex-col items-center
        justify-center
        portrait:justify-start
        portrait:pt-6
        relative
      ">
        
        <div className="flex flex-col items-center w-full">
          {!currentUser ? (
            <>
              <div className="
                flex items-center justify-center
                portrait:-mt-10
              ">
                <img
                  src={logo}
                  alt="Logotipo"
                  className="
                    h-[380px] w-[380px]
                    portrait:h-[520px] portrait:w-[520px]
                  "
                />
              </div>
  
              <PinKiosk onSuccess={handleLoginSuccess} />
            </>
          ) : (
            <Dashboard user={currentUser} onLogout={handleLogout} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
