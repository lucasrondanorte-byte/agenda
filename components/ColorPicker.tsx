import React from 'react';

const colors = [
  '#6366F1', // indigo-500
  '#EC4899', // pink-500
  '#22C55E', // green-500
  '#64748B', // slate-500
  '#EF4444', // red-500
  '#F97316', // orange-500
  '#EAB308', // yellow-500
  '#3B82F6', // blue-500
  '#8B5CF6', // violet-500
  '#14B8A6', // teal-500
];

interface ColorPickerProps {
  selectedColor?: string;
  onChange: (color: string) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-2">Color</label>
      <div className="flex flex-wrap gap-3">
        {colors.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`w-8 h-8 rounded-full transition-all focus:outline-none border-2 ${
              selectedColor === color ? 'ring-2 ring-offset-2 ring-teal-500 border-white' : 'border-transparent hover:scale-110'
            }`}
            style={{ backgroundColor: color }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
};