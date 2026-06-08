import { getStageLabel, getStatusColor, getStatusTextColor } from '@/lib/utils';

interface Props {
  status: string;
  stage?: string;
}

export default function StatusBadge({ status, stage }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span
        style={{
          background: getStatusColor(status),
          color: getStatusTextColor(status),
          borderRadius: 999,
          padding: '3px 9px',
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        {status}
      </span>
      {stage ? (
        <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>{getStageLabel(stage)}</span>
      ) : null}
    </div>
  );
}
