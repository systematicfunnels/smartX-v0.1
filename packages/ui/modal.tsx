// Modal Component
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: any;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return {
    isOpen,
    onClose,
    title,
    children
  };
}
