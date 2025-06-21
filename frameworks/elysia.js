import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import Piscina from 'piscina'
import path from 'path'

const piscina = new Piscina({
    filename: path.resolve('workers/hash-worker.js'),
    maxThreads: 4,
})

const app = new Elysia({ adapter: node() })
    .get('/', () => ({
        message: 'Hello from Elysia!',
        timestamp: new Date().toISOString()
    }))
    .get('/hash', async () => {
        try {
            const hash = await piscina.run()
            return { message: hash, timestamp: new Date().toISOString() }
        } catch (err) {
            console.error('Piscina error:', err)
            return { error: 'Hashing failed' }
        }
    })

app.listen(3006)
console.log('Elysia server running on http://localhost:3006')
