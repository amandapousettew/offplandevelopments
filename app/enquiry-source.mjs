export function recordEnquirySource() {
  const source = new URLSearchParams(location.search).get('utm_source')?.trim().slice(0, 80);
  const referrer = document.referrer ? new URL(document.referrer) : null;
  const referral = source || (referrer?.origin !== location.origin ? referrer?.hostname : '');
  try {
    if (referral) sessionStorage.setItem('offplan-enquiry-source', referral);
    return sessionStorage.getItem('offplan-enquiry-source') || '';
  } catch {
    return referral || '';
  }
}
