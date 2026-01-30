import React from 'react';
import { Delete, CheckCircle2 } from 'lucide-react';

interface KeypadProps {
  onNumberClick: (num: string) => void;
  onDelete: () => void;
  onConfirm: () => void;
}

export const Keypad = ({ onNumberClick, onDelete, onConfirm }: KeypadProps) => {
  const numbers = ['9', '8', '7', '6', '5', '4', '3', '2', '1', '0'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-[500px] max-h-[400px]">
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => onNumberClick(num)}
          className="flex h-15 w-15 items-center justify-center rounded-2xl bg-slate-100 text-3xl font-semibold text-[rgb(0,0,0)] transition-all active:scale-95 active:bg-slate-200"
        >
          {num}
        </button>
      ))}
      <button
        onClick={onDelete}
        className="flex h-15 w-15 items-center justify-center rounded-2xl bg-rose-400 text-[rgb(255,255,255)] transition-all active:scale-95 active:bg-rose-600 pt-[0px] pr-[3px] pb-[0px] pl-[0px]"
        aria-label="Eliminar"
      >
        <Delete size={32} />
      </button>
      <button
        onClick={onConfirm}
        className="flex h-15 w-15 items-center justify-center rounded-2xl bg-emerald-500 text-white transition-all active:scale-95 active:bg-emerald-600"
        aria-label="Confirmar"
      >
        <CheckCircle2 size={32} />
      </button>
    </div>
  );
};
