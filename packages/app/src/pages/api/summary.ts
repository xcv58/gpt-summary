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

  if (req.method === 'OPTIONS') {
    return done(NextResponse.json({}, { status: 200 }))
  }

  const payload = await req.json()
  const { apiKey = '' } = payload
  const content = (payload.content || '').trim()
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
      model: 'gpt-3.5-turbo',
      messages: generateMessage(content),
      temperature: 0.3,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: 256,
      stream: true,
      n: 1,
    }

    const stream = await OpenAIStream(payload, apiKey)
    return done(
      new NextResponse(stream, {
        status: 200,
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

function generateMessage(content: string) {
  return [
    {
      role: 'system',
      content: 'You are an assitant that summarize the content in concise way',
    },
    { role: 'user', content },
  ]
}
