import type { NextApiRequest, NextApiResponse } from 'next'
import { OpenAIStream } from '../../utils/OpenAIStream'
import Cors from 'cors'

export const config = {
  runtime: 'edge',
}

const cors = Cors({
  methods: ['POST', 'HEAD'],
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: Function
) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }
      return resolve(result)
    })
  })
}

type Data = {
  data?: string
  error?: { message: string }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  await runMiddleware(req, res, cors)
  if (!process.env.OPENAI_API_KEY) {
    res.status(500).json({
      error: {
        message:
          'OpenAI API key not configured, please follow instructions in README.md',
      },
    })
    return
  }

  const content = req.body.content || ''
  if (content.trim().length === 0) {
    res.status(400).json({
      error: {
        message: 'Please enter a valid content',
      },
    })
    return
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
    return new Response(stream, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, s-maxage=3600, stale-while-revalidate=60',
      },
    })
  } catch (error: any) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data)
      return new Response(error.response.data, {
        status: error.response.status,
      })
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`)
      return new Response('An error occurred during your request.', {
        status: error.response.status,
      })
    }
  }
}

function generatePrompt(content: string) {
  return `${content}
write summary for above content:`
}
