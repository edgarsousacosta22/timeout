import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

export const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = format(time, 'HH:mm:ss');
  // "Dia da semana, dia do mês do ano" -> "Segunda-feira, 27 de Janeiro de 2026"
  const dateString = format(time, "EEEE, d 'de' MMMM 'de' yyyy", { locale: pt });

  // Capitalize first letter of the weekday
  const capitalizedDateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);

  return (
    <div className="flex flex-col items-center justify-center text-center mb-8">
      <h1 className="text-[36px] font-bold leading-none tracking-tighter text-[rgb(0,0,0)]">
        {timeString}
      </h1>
      <p className="text-2xl text-[rgb(0,0,0)] font-medium mt-2 text-[20px]">
        {capitalizedDateString}
      </p>
    </div>
  );
};
