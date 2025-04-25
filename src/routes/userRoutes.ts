import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export function userRoutes(app: FastifyInstance) {
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const createUserSchema = z.object({
      name: z.string(),
      age: z.number(),
      weight: z.number(),
      height: z.number(),
    })

    const { name, age, weight, height } = createUserSchema.parse(request.body)

    let authId = request.cookies.authId

    authId = randomUUID()

    reply.cookie('authId', authId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 Days
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      age,
      weight,
      height,
      auth_id: authId,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex
      .select(
        'id',
        'name',
        'age',
        'weight',
        'height',
        'created_at',
        'updated_at',
      )
      .from('users')

    return { users }
  })

  app.get('/:userId', async (request: FastifyRequest) => {
    const paramsSchema = z.object({
      userId: z.string(),
    })

    const { userId } = paramsSchema.parse(request.params)

    const user = await knex('users')
      .where({ id: userId })
      .select(
        'id',
        'name',
        'age',
        'weight',
        'height',
        'created_at',
        'updated_at',
      )
      .first()

    return { user }
  })

  app.get(
    '/auth/:userId',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsSchema = z.object({
        userId: z.string(),
      })

      const { userId } = paramsSchema.parse(request.params)

      const user = await knex('users')
        .where({ id: userId })
        .select('auth_id')
        .first()

      let authId = request.cookies.sessionId

      if (!authId && user) {
        authId = user.auth_id

        reply.cookie('authId', authId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 Days
        })
      }
    },
  )
}
