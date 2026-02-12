import React, { useState, useEffect } from 'react';
import { Keypad } from './Keypad';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { supabase } from '@/lib/supabase';
import clockIcon from "figma:asset/a3497bedc319b7848aa5810d9c6a55111f0ef68d.png";
import timecutText from "figma:asset/c8efd5d814a51b9d425429ab41084213799e9200.png";

interface User {
  id: string;
  company_id: string;
  full_name: string;
  pin_ponto: string;
}

interface PinKioskProps {
  onSuccess: (user: User) => void;
}

export const PinKiosk = ({ onSuccess }: PinKioskProps) => {
  const [pin, setPin] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleConfirm = async () => {
    if (pin.length < 6) {
      toast.error('O PIN deve ter exatamente 6 dígitos');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, company_id, full_name, pin_ponto')
        .eq('pin_ponto', pin)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        onSuccess(data);
        setPin('');
      } else {
        toast.error('PIN incorreto. Tente novamente.');
        setPin('');
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error('Erro ao ligar à base de dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const dateString = format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });
  const timeString = format(currentTime, 'HH:mm:ss');

  return (
    <div className="w-full max-w-2xl mx-auto overflow-hidden rounded-[40px] bg-[rgb(255,255,255)] shadow-2xl border border-slate-100">
      {/* Top part of the square interior */}
      <div className="bg-[rgb(3,25,116)] p-10 text-center border-b border-slate-50 flex flex-col items-center">
        <h2 className="text-2xl font-medium text-white/80 mb-2 ">
          {dateString}
        </h2>
        <h1 className="text-[64px] font-bold text-white leading-none mb-6">
          {timeString}
        </h1>
        <div className="bg-white/10 px-6 py-2 rounded-full border border-white/20">
          <p className="text-xl text-white font-medium">{getGreeting()}, bem-vindo à Webminds</p>
        </div>
      </div>

      <div className="flex flex-col bg-[rgb(190,190,190)] p-10 pt-10 pb-6">
        <div className="flex flex-col md:flex-row gap-12 items-center justify-between w-full">
          {/* Left: PIN Display Area */}
          <div className="flex-1 flex flex-col items-center md:items-start w-full md:ml-[60px]">
            <p className="text-base md:text-xl text-[rgb(0,0,0)] font-medium mb-[16px] text-center md:text-left md:ml-[42px]">Digite o seu PIN</p>
            <div className="w-full max-w-[200px] md:max-w-[240px] h-14 md:h-16 bg-slate-50 rounded-2xl flex items-center justify-center gap-3 px-6 shadow-inner relative overflow-hidden mx-auto md:mx-0">
              {isLoading && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                  <div className="w-6 h-6 border-2 border-[rgb(3,25,116)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <AnimatePresence mode="popLayout">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                      i < pin.length ? 'bg-[#031974]' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
          {/* Right: Keypad */}
          <div className={`flex-shrink-0 transition-opacity ${isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <Keypad
              onNumberClick={handleNumberClick}
              onDelete={handleDelete}
              onConfirm={handleConfirm}
            />
          </div>
        </div>
        
        {/* Centered text inside the gray area */}
        <div className="mt-8 flex justify-center w-full">
          <p className="text-[rgb(3,25,116)] font-bold text-[10px]">
            Desenvolvido por Webminds Solutions
          </p>
        </div>
      </div>
    </div>
  );
};
