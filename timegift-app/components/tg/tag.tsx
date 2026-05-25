type Status = 'pending' | 'accepted' | 'scheduled' | 'completed' | 'expired' | 'declined' | 'cancelled';

export function StatusTag({ status }: { status: Status | string }) {
  return (
    <span className={`tag ${status}`}>
      <span className="tag-dot" />
      {status}
    </span>
  );
}
