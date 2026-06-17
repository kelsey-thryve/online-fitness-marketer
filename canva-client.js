/* ============================================================
   TRAINER LAUNCH — Canva client helper

   Talks to the /api/canva-call edge proxy. The proxy attaches the
   user's stored Canva access token (refreshing it transparently if
   expired), so client code never touches OAuth tokens.
   ============================================================ */

import { supabase } from './auth.js';

async function getBearer() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not signed in to Supabase.');
  return session.access_token;
}

async function canvaCall(method, path, body) {
  const bearer = await getBearer();
  const res = await fetch('/api/canva-call', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${bearer}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ method, path, body })
  });
  const wrap = await res.json();
  if (!res.ok) throw new Error(wrap.error || `Canva proxy ${res.status}`);
  if (wrap.status >= 400) {
    const msg = wrap.body?.message || wrap.body?.error?.message || JSON.stringify(wrap.body).slice(0, 200);
    throw new Error(`Canva ${wrap.status}: ${msg}`);
  }
  return wrap.body;
}

export async function listBrandTemplates() {
  const out = await canvaCall('GET', '/v1/brand-templates');
  return out.items || [];
}

export async function getBrandTemplateDataset(templateId) {
  // Tells us the named fields inside the template (e.g. HEADLINE, BODY, IMAGE_1)
  return await canvaCall('GET', `/v1/brand-templates/${encodeURIComponent(templateId)}/dataset`);
}

/* Generate a Canva design from a brand template + data values.
   Polls until the autofill job finishes; returns the new design id. */
export async function autofillBrandTemplate(brandTemplateId, data, onProgress) {
  const start = await canvaCall('POST', '/v1/autofills', {
    brand_template_id: brandTemplateId,
    data
  });
  let jobId = start.job?.id;
  if (!jobId) throw new Error('Autofill did not return a job id.');
  let attempts = 0;
  while (attempts++ < 60) { // ~2 min cap
    onProgress?.(`Filling template… (${attempts})`);
    await sleep(2000);
    const poll = await canvaCall('GET', `/v1/autofills/${encodeURIComponent(jobId)}`);
    const status = poll.job?.status;
    if (status === 'success') {
      const designId = poll.job?.result?.design?.id;
      if (!designId) throw new Error('Autofill succeeded but no design id was returned.');
      return designId;
    }
    if (status === 'failed') {
      throw new Error('Autofill failed: ' + (poll.job?.error?.message || 'unknown'));
    }
  }
  throw new Error('Autofill timed out after 2 minutes.');
}

/* Export an existing design as PDF; polls until the export job
   finishes; returns the downloadable PDF URL. */
export async function exportDesignAsPdf(designId, onProgress) {
  const start = await canvaCall('POST', '/v1/exports', {
    design_id: designId,
    format: { type: 'pdf_standard' }
  });
  let jobId = start.job?.id;
  if (!jobId) throw new Error('Export did not return a job id.');
  let attempts = 0;
  while (attempts++ < 60) {
    onProgress?.(`Exporting PDF… (${attempts})`);
    await sleep(2000);
    const poll = await canvaCall('GET', `/v1/exports/${encodeURIComponent(jobId)}`);
    const status = poll.job?.status;
    if (status === 'success') {
      const urls = poll.job?.urls || poll.job?.result?.urls || [];
      const first = Array.isArray(urls) ? urls[0] : urls;
      if (!first) throw new Error('Export succeeded but returned no URL.');
      return first;
    }
    if (status === 'failed') {
      throw new Error('Export failed: ' + (poll.job?.error?.message || 'unknown'));
    }
  }
  throw new Error('Export timed out after 2 minutes.');
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
