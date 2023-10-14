import chalk from 'chalk'

import {ChatFlow, OpenAIProvider} from '../src'

console.log('🚀 starting chat\n')
console.time('🚀 chat finished')

const flow = new ChatFlow({
  nodes: {
    '🧑': '🤖',
  },
  config: {
    '🧑': {
      type: 'assistant',
      interrupt: 'NEVER',
      role: 'You are a human assistant. Reply "TERMINATE" in when there is a correct answer.',
    },
    '🤖': {type: 'agent'},
  },
})

flow.on('message', async message => {
  const replying = chalk.dim(`(to ${message.to})`)
  process.stdout.write(`${chalk.bold(message.from)} ${replying}: `)

  // Emulate streaming by breaking the cached response into chunks
  const chunks = message.content.split(' ')
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const bytes = new TextEncoder().encode(chunk + ' ')
        controller.enqueue(bytes)
        await new Promise(r =>
          setTimeout(
            r,
            // get a random number between 10ms and 50ms to simulate a random delay
            Math.floor(Math.random() * 40) + 10,
          ),
        )
      }
      controller.close()
    },
  })

  // Stream the response to the chat
  for await (const chunk of stream) {
    process.stdout.write(new TextDecoder().decode(chunk))
  }

  process.stdout.write('\n')
})

flow.on('terminate', message => {
  setTimeout(() => {
    console.log()
    console.timeEnd('🚀 chat finished')
    process.stdin.pause()
  }, 100)
})

await flow.start({
  from: '🧑',
  to: '🤖',
  content: '2 + 2 = 4?',
})

process.stdin.resume()

// const response = await openai.chat.completions.create({
//   model: "gpt-3.5-turbo",
//   stream: true,
//   messages: [
//   ],
// functions: [
//   {
//     name: "get_weather",
//     description: "Gets the weather in a given city.",
//     parameters: {
//       type: "object",
//       properties: {
//         city: {
//           type: "string",
//           description: "The city to get the weather for.",
//         },
//       },
//     }
//   }
// ]
// });
