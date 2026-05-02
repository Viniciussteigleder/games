interface StatusToastProps {
  message?: string;
}

export function StatusToast({ message }: StatusToastProps) {
  return (
    <div className={`status-toast ${message ? "is-visible" : ""}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
