import { useState } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label: string;
  iconSrc: string;
}

export default function EditableField({ value, onSave, label, iconSrc }: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <>
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            className="px-3 py-1.5 border border-app-border rounded text-sm"
            autoFocus
          />
          <button
            onClick={handleCancel}
            className="px-3 py-1.5 text-sm font-semibold text-app-text-muted hover:text-app-text"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1.5 text-sm font-semibold bg-app-primary text-white rounded hover:opacity-90"
          >
            저장
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsEditing(true)}
          className="p-1.5 hover:opacity-80"
        >
          {iconSrc ? (
            <img src={iconSrc} alt="수정" className="w-5 h-5" />
          ) : (
            <span className="text-xs font-semibold text-app-primary">수정</span>
          )}
        </button>
      )}
    </>
  );
}