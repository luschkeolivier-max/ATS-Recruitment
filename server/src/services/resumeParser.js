const Anthropic = require('@anthropic-ai/sdk').default;
const { zodOutputFormat } = require('@anthropic-ai/sdk/helpers/zod');
const { z } = require('zod');

const ResumeExtractionSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  achievements: z.array(z.string()),
  redactedResumeText: z.string(),
});

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

// Reads a candidate's resume PDF and returns
// { summary, skills, achievements, redactedResumeText }, or null if no
// ANTHROPIC_API_KEY is configured or extraction fails. Callers must treat a
// null result as "not parsed yet" rather than an error — resume parsing is a
// best-effort enhancement, not a requirement for profile creation.
//
// redactedResumeText is a plain-text rendition of the resume with the
// candidate's name, email, phone, address, and social/portfolio links
// removed (replaced with "[redacted]" inline) — everything else (roles,
// employers, dates, skills, education) is preserved. It's a text rewrite
// rather than a redacted PDF: shown to hiring managers on the client
// showcase page so they can evaluate a candidate's background without
// contact details that would let them bypass the agency.
async function parseResumePdf(pdfBuffer) {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 6000,
      output_config: {
        effort: 'low',
        format: zodOutputFormat(ResumeExtractionSchema),
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: pdfBuffer.toString('base64'),
              },
            },
            {
              type: 'text',
              text:
                "This is a candidate's resume. Extract four things:\n" +
                '1. summary: a concise professional summary (2-3 sentences).\n' +
                '2. skills: a list of tools/technologies/skills mentioned.\n' +
                '3. achievements: a list of concrete achievements or quantifiable accomplishments.\n' +
                '4. redactedResumeText: the full resume rewritten as plain text, preserving all ' +
                'work history, employers, dates, responsibilities, skills, and education, but ' +
                'with the candidate\'s name, email address, phone number, physical address, and ' +
                'any social/portfolio links (LinkedIn, GitHub, personal site) replaced with ' +
                '"[redacted]". Keep employer and institution names as-is — only the candidate\'s ' +
                'own contact details should be redacted.\n' +
                'If a section has nothing to extract, return an empty array (or empty string) ' +
                'rather than guessing.',
            },
          ],
        },
      ],
    });
    return response.parsed_output;
  } catch (err) {
    console.error('Resume parsing failed:', err.message);
    return null;
  }
}

module.exports = { parseResumePdf };
