import { NextRequest, NextResponse } from 'next/server'
import { OpenAIStream } from '../../utils/OpenAIStream'
import cors from '../../utils/cors'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const done = (res: NextResponse) => cors(req, res)
  if (!process.env.OPENAI_API_KEY) {
    return done(
      NextResponse.json(
        {
          error:
            'OpenAI API key not configured, please follow instructions in README.md',
        },
        {
          status: 500,
        }
      )
    )
  }

  const content = (await (req.text() || '')).trim()
  if (!content) {
    return done(
      NextResponse.json(
        {
          error: 'Please enter a valid content',
        },
        {
          status: 400,
        }
      )
    )
  }

  try {
    const payload = {
      model: 'text-davinci-003',
      prompt: generatePrompt(content),
      temperature: 0.5,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 256,
      stream: true,
      n: 1,
    }

    const stream = await OpenAIStream(payload)
    return done(
      new NextResponse(stream, {
        status: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, s-maxage=3600, stale-while-revalidate=60',
        },
      })
    )
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data)
      return done(
        NextResponse.json(error.response, { status: error.response.status })
      )
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      return done(
        NextResponse.json(
          {
            error: 'An error occurred during your request.',
          },
          { status: error.response.status }
        )
      )
    }
  }
}

function generatePrompt(content: string) {
  return `${content}
write summary for above content:`
}
