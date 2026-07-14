interface EditableFieldProps {
  onEdit: () => void;
  iconSrc: string;
}

export default function EditableField({ onEdit, iconSrc }: EditableFieldProps) {
  return (
    <button
      onClick={onEdit}
      aria-label="수정"
      className="p-1.5 hover:opacity-80"
    >
      {iconSrc ? (
        <img src={iconSrc} alt="수정" className="w-5 h-5" />
      ) : (
        <span className="text-xs font-semibold text-app-primary">수정</span>
      )}
    </button>
  );
}