export interface SendMatchEmailParams {
  toEmail: string;
  toName: string;
  candidateId: string;
  emailBody: string;
}

export const sendMatchEmail = async (
  params: SendMatchEmailParams,
): Promise<{ success: boolean }> => {
  console.log('\n[Mock Email Sent]');
  console.log(`To: ${params.toName} <${params.toEmail}>`);
  console.log('Subject: TDC Matchmaker - We found a potential match for you!');
  console.log(`Candidate ID: ${params.candidateId}`);
  console.log(`Body:\n${params.emailBody}`);
  console.log('='.repeat(40));

  return { success: true };
};
