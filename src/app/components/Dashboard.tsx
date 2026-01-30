import React, { useState, useEffect } from 'react';
import { LogOut, UserCircle, CheckCircle, Utensils, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface DashboardProps {
  user: { id: string; full_name: string };
  onLogout: () => void;
}

interface PunchTimes {
  entrada: string | null;
  saida: string | null;
  almoco: string | null;
  voltaAlmoco: string | null;
}

export const Dashboard = ({ user, onLogout }: DashboardProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [punches, setPunches] = useState<PunchTimes>({
    entrada: null,
    saida: null,
    almoco: null,
    voltaAlmoco: null,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's record from Supabase
  useEffect(() => {
    const fetchTodayRecord = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      try {
        const { data, error } = await supabase
          .from('timesheet')
          .select('*')
          .eq('employee_id', user.id)
          .eq('data_ponto', today)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setPunches({
            entrada: data.hora_entrada,
            saida: data.hora_saida,
            almoco: data.hora_entrada_almoco,
            voltaAlmoco: data.hora_saida_almoco,
          });
        }
      } catch (err) {
        console.error('Error fetching today record:', err);
      }
    };

    fetchTodayRecord();
  }, [user.id]);

  // Activity monitor to return to PIN after 1 minute of inactivity
  useEffect(() => {
    const checkInactivity = setInterval(() => {
      const now = Date.now();
      const oneMinute = 60 * 1000;
      if (now - lastActivity >= oneMinute && !isProcessing) {
        onLogout();
      }
    }, 1000);

    return () => clearInterval(checkInactivity);
  }, [lastActivity, isProcessing, onLogout]);

  const resetActivity = () => {
    setLastActivity(Date.now());
  };

  // Countdown logic for already punched out users
  useEffect(() => {
    if (punches.saida && countdown === null && !isProcessing) {
      setCountdown(5);
    }
  }, [punches.saida, countdown, isProcessing]);

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearInterval(timer);
    } else {
      onLogout();
    }
  }, [countdown, onLogout]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handlePunch = async (key: keyof PunchTimes) => {
    if (punches[key] || isProcessing) return; 
    
    resetActivity();
    setIsProcessing(true);
    const timeStr = format(new Date(), 'HH:mm:ss');
    const today = format(new Date(), 'yyyy-MM-dd');

    // Column mapping
    const columnMap: Record<keyof PunchTimes, string> = {
      entrada: 'hora_entrada',
      saida: 'hora_saida',
      almoco: 'hora_entrada_almoco',
      voltaAlmoco: 'hora_saida_almoco',
    };

    const messages: Record<string, string> = {
      entrada: 'Entrada registada com sucesso!',
      saida: 'Saída registada com sucesso!',
      almoco: 'Início de almoço registado! Bom apetite.',
      voltaAlmoco: 'Regresso de almoço registado! Bom trabalho.',
    };

    try {
      // Check if entry exists for today
      const { data: existing } = await supabase
        .from('timesheet')
        .select('id')
        .eq('employee_id', user.id)
        .eq('data_ponto', today)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('timesheet')
          .update({ [columnMap[key]]: timeStr })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('timesheet')
          .insert({
            employee_id: user.id,
            data_ponto: today,
            [columnMap[key]]: timeStr
          });
        if (error) throw error;
      }

      setPunches((prev) => ({ ...prev, [key]: timeStr }));
      toast.success(messages[key] || 'Registo efetuado com sucesso!');
      
      setTimeout(() => {
        onLogout();
      }, 3000);
    } catch (err) {
      console.error('Error saving punch:', err);
      toast.error('Erro ao guardar na base de dados.');
      setIsProcessing(false);
    }
  };

  const dateString = format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });
  const timeString = format(currentTime, 'HH:mm:ss');

  // Logic for unlocking buttons based on the description
  const isSaidaBloqueada = !!punches.saida;
  
  const canEntrada = !punches.entrada && !isSaidaBloqueada && !isProcessing;
  const canSaida = !!punches.entrada && !punches.saida && !isProcessing;
  const canAlmoco = !!punches.entrada && !punches.almoco && !isSaidaBloqueada && !isProcessing;
  const canVoltaAlmoco = !!punches.almoco && !punches.voltaAlmoco && !isSaidaBloqueada && !isProcessing;

  const InfoRow = ({ label1, value1, label2, value2 }: { label1: string, value1: string | null, label2: string, value2: string | null }) => (
    <div className="grid grid-cols-2 gap-4 py-2 border-b border-slate-100 last:border-0">
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[rgb(3,25,116)] uppercase tracking-wider">{label1}</span>
        <span className={`text-base font-semibold ${value1 ? 'text-[#031974]' : 'text-slate-300 italic'}`}>
          {value1 || 'Ainda não'}
        </span>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold text-[rgb(3,25,116)] uppercase tracking-wider">{label2}</span>
        <span className={`text-base font-semibold ${value2 ? 'text-[#031974]' : 'text-slate-300 italic'}`}>
          {value2 || 'Ainda não'}
        </span>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-6xl mx-auto p-4 md:p-8 space-y-8 bg-[rgb(211,233,255)] rounded-[30px] relative overflow-hidden"
    >
      {/* Countdown Overlay for Finished Shift */}
      {countdown !== null && !isProcessing && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 bg-[rgb(3,25,116)]/90 flex flex-col items-center justify-center text-white text-center p-8 rounded-[30px]"
        >
          <div className="bg-white/5 p-8 rounded-full mb-6">
            <CheckCircle size={80} className="text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Turno Encerrado</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-md">
            Já registou a sua saída hoje. A sessão será encerrada automaticamente.
          </p>
          <div className="text-6xl font-bold bg-white text-[rgb(3,25,116)] w-24 h-24 rounded-full flex items-center justify-center shadow-2xl">
            {countdown}
          </div>
          <p className="mt-6 text-blue-200 animate-pulse">
            A regressar ao ecrã de PIN...
          </p>
        </motion.div>
      )}

      {/* Header Squares */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Square: Date & Time */}
        <div className="bg-[rgb(3,25,116)] rounded-[30px] p-6 shadow-lg border border-slate-100 flex flex-col items-center justify-center text-center min-h-[220px]">
          <span className="text-lg font-medium text-[rgb(255,255,255)] mb-2">
            {dateString}
          </span>
          <h2 className="text-[70px] font-bold text-[rgb(255,255,255)] leading-none">
            {timeString}
          </h2>
        </div>

        {/* Right Square: User Info & Punches */}
        <div className="bg-[rgb(255,255,255)] rounded-[30px] p-6 shadow-lg border border-slate-100 min-h-[220px]">
          <div className="flex items-center gap-4 mb-4 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-[#031974]">
              <UserCircle size={28} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#031974]">
                {getGreeting()}, {user.full_name}
              </h3>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <InfoRow label1="Entrada" value1={punches.entrada} label2="Saída" value2={punches.saida} />
            <InfoRow label1="Almoço" value1={punches.almoco} label2="Volta Almoço" value2={punches.voltaAlmoco} />
          </div>
        </div>
      </div>

      {/* Control Buttons Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Row 1: Entrada and Saida */}
        <Button 
          label="Entrada" 
          icon={<CheckCircle size={24} />} 
          isActive={canEntrada} 
          onClick={() => handlePunch('entrada')}
          variant="emerald"
        />
        <Button 
          label="Saída" 
          icon={<LogOut size={24} />} 
          isActive={canSaida} 
          onClick={() => handlePunch('saida')}
          variant="rose"
        />

        {/* Row 2: Almoco and Volta Almoco */}
        <Button 
          label="Almoço" 
          icon={<Utensils size={24} />} 
          isActive={canAlmoco} 
          onClick={() => handlePunch('almoco')}
          variant="indigo"
        />
        <Button 
          label="Volta Almoço" 
          icon={<ArrowRight size={24} />} 
          isActive={canVoltaAlmoco} 
          onClick={() => handlePunch('voltaAlmoco')}
          variant="slate"
        />
      </div>

      {/* Footer inside the dashboard container, centered at the bottom */}
      <div className="mt-4 flex justify-center w-full">
        <p className="text-[rgb(3,25,116)] font-bold text-[10px]">
          Desenvolvido por Webminds Solutions
        </p>
      </div>
    </motion.div>
  );
};

interface ButtonProps {
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  variant: 'emerald' | 'rose' | 'orange' | 'slate' | 'indigo';
}

const Button = ({ label, icon, isActive, onClick, variant }: ButtonProps) => {
  const variants = {
    emerald: 'bg-emerald-300 text-white shadow-emerald-200',
    rose: 'bg-rose-400 text-white shadow-rose-200',
    orange: 'bg-orange-300 text-white shadow-orange-200',
    slate: 'bg-slate-500 text-white shadow-slate-200',
    indigo: 'bg-indigo-400 text-white shadow-indigo-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={!isActive}
      className={`
        flex items-center justify-center gap-3 h-20 rounded-[20px] font-bold text-lg transition-all
        ${isActive 
          ? `${variants[variant]} active:scale-95 cursor-pointer` 
          : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200'}
      `}
    >
      {icon}
      {label}
    </button>
  );
};
