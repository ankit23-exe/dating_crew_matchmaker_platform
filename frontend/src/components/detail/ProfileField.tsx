interface Props {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}

export default function ProfileField({ label, value, fullWidth }: Props) {
  const empty =
    value === null ||
    value === undefined ||
    value === '' ||
    value === 'Not provided';

  return (
    <div className={`profile-field${fullWidth ? ' full' : ''}`}>
      <span className="profile-field-label">{label}</span>
      <span className={`profile-field-value${empty ? ' muted' : ''}`}>{value ?? 'Not provided'}</span>
    </div>
  );
}
