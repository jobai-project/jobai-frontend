import LoginCard from './LoginCard';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

// 모달 wrapper(§4-2-A). 현재는 여는 트리거가 미정이라 어디에도 연결하지 않음
// (빌드만 해두고, 트리거 확정 시 마운트). 페이지 진입은 LoginPage(/login) 사용.
export default function LoginModal({ open, onClose }: LoginModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose} // 바깥(dim) 클릭 시 닫힘
    >
      <div onClick={(e) => e.stopPropagation()}>
        <LoginCard onClose={onClose} />
      </div>
    </div>
  );
}
