import { useState } from 'react';

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  label: string;
}

export default function EditableField({ value, onSave, label }: EditableFieldProps) {
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
          className="px-3 py-1.5 text-xs font-semibold text-app-primary hover:opacity-80"
        >
          수정
        </button>
      )}
    </>
  );
}