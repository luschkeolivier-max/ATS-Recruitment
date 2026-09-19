const Anthropic = require('@anthropic-ai/sdk').default;
const { zodOutputFormat } = require('@anthropic-ai/sdk/helpers/zod');
const { z } = require('zod');

const ResumeExtractionSchema = z.object({
  summary: z.string(),
  skills: z.array(z.string()),
  achievements: z.array(z.string()),
});

let client = null;
function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

// Reads a candidate's resume PDF and returns { summary, skills, achievements },
// or null if no ANTHROPIC_API_KEY is configured or extraction fails. Callers
// must treat a null result as "not parsed yet" rather than an error — resume
// parsing is a best-effort enhancement, not a requirement for profile creation.
async function parseResumePdf(pdfBuffer) {
  const anthropic = getClient();
  if (!anthropic) return null;

  try {
    const response = await anthropic.messages.parse({
      model: 'claude-opus-5',
      max_tokens: 4096,
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
                "This is a candidate's resume. Extract: a concise professional summary " +
                '(2-3 sentences), a list of tools/technologies/skills mentioned, and a list ' +
                'of concrete achievements or quantifiable accomplishments. If a section has ' +
                'nothing to extract, return an empty array rather than guessing.',
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
