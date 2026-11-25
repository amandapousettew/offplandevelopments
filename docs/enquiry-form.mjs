import {recordEnquirySource} from './enquiry-source.mjs';

recordEnquirySource();

for (const form of document.querySelectorAll('[data-enquiry-form]')) {
  const submit = form.querySelector('button[type=submit]');
  const sent = form.querySelector('[data-sent]');
  const error = form.querySelector('[data-error]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submit.disabled) return;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    error.hidden = true;

    const endpoint = new URL(form.action);
    endpoint.pathname = '/ajax' + endpoint.pathname;
    const details = Object.fromEntries(new FormData(form));
    details.source = recordEnquirySource();
    details.source_page = location.pathname;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Accept: 'application/json'},
        body: JSON.stringify(details),
      });
      const result = await response.json();
      if (!response.ok || ![true, 'true'].includes(result.success)) throw new Error('Enquiry failed');
      form.reset();
      form.querySelector('[data-fields]').hidden = true;
      sent.hidden = false;
      sent.focus();
    } catch {
      error.hidden = false;
    } finally {
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
}
