'use client';

import { useState } from 'react';

interface Props {
  candidateId: string;
  candidateName: string;
  emailDraft: string;
  onConfirm: (candidateId: string, emailBody: string) => Promise<void>;
  onClose: () => void;
}

export default function SendMatchModal({
  candidateId,
  candidateName,
  emailDraft,
  onConfirm,
  onClose,
}: Props) {
  const [body, setBody] = useState(emailDraft);
  const [sending, setSending] = useState(false);

  const handleConfirm = async () => {
    setSending(true);
    await onConfirm(candidateId, body);
    setSending(false);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,28,30,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
    >
      <div
        style={{
          background: 'var(--warm-white)',
          borderRadius: 16,
          width: '100%',
          maxWidth: 520,
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(28,28,30,0.3)',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div className="serif" style={{ fontSize: 19, fontWeight: 500 }}>
              Send Introduction
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Match with {candidateName} · Edit the AI draft before sending
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '.08em',
              marginBottom: 8,
            }}
          >
            AI-Generated Intro Email
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={7}
            style={{
              width: '100%',
              padding: 14,
              background: 'var(--cream)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              outline: 'none',
              resize: 'none',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: 11,
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'none',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={sending}
              className="btn-primary"
              style={{ flex: 2, borderRadius: 8, opacity: sending ? 0.7 : 1 }}
            >
              {sending ? 'Sending...' : '✓ Confirm & Send Match'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
