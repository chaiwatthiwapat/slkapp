import { useEffect, useId, useRef, type ReactNode } from 'react';
import { appearance, type Appearance } from './appearance';
import { Button } from './Button';
import { Icon } from './Icon';

export interface ModalProps extends Appearance {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}
export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  width = 640,
  height,
  color,
  backgroundColor,
  style,
}: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    const node = dialog.current;
    if (open && node && !node.open) node.showModal();
    if (!open && node?.open) node.close();
  }, [open]);
  return (
    <dialog
      ref={dialog}
      className="ui-modal"
      aria-labelledby={titleId}
      style={appearance({ width, height, color, backgroundColor, style })}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="modal-layout">
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <Button tone="neutral" variant="ghost" aria-label="ปิดหน้าต่าง" onClick={onClose}>
            <Icon name="close" />
          </Button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
