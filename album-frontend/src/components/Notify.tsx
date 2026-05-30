type NotifyProps = {
  message: string;
};

function Notify({ message }: NotifyProps) {
  return (
    <div className="notify" role="status" aria-live="polite">
      <span>{message}</span>
    </div>
  );
}

export default Notify;
