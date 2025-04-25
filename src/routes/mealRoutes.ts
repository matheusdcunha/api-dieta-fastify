import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { formatDate } from '../utils/formatDate'
import { knex } from '../database'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists'

interface CountResult {
  total: number | string
}

export function mealRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const createMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        inDiet: z.boolean(),
      })

      const { name, description, date, inDiet } = createMealSchema.parse(
        request.body,
      )

      const authId = request.cookies.authId

      const user = await knex('users')
        .where({ auth_id: authId })
        .select('*')
        .first()

      await knex('meals').insert({
        name,
        user_id: user?.id,
        description,
        date: new Date(formatDate(date)).toISOString(),
        in_diet: inDiet,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest) => {
      const authId = request.cookies.authId

      const user = await knex('users')
        .where({ auth_id: authId })
        .select('id')
        .first()

      const meals = await knex
        .where({ user_id: user?.id })
        .select('id', 'name', 'description', 'date', 'in_diet')
        .from('meals')

      return { meals }
    },
  )

  app.get(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest) => {
      const paramsSchema = z.object({
        mealId: z.coerce.number(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({ id: mealId })
        .select('id', 'name', 'description', 'date', 'in_diet')
        .first()

      return { meal }
    },
  )

  app.put(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsSchema = z.object({
        mealId: z.coerce.number(),
      })

      const bodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date: z.string().optional(),
        inDiet: z.boolean().optional(),
      })

      const { mealId } = paramsSchema.parse(request.params)
      const { name, description, date, inDiet } = bodySchema.parse(request.body)

      const authId = request.cookies.authId

      const user = await knex('users')
        .where({ auth_id: authId })
        .select('id')
        .first()

      await knex('meals').where({ user_id: user?.id, id: mealId }).update({
        name,
        description,
        date,
        in_diet: inDiet,
      })

      return reply.status(200).send()
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const paramsSchema = z.object({
        mealId: z.coerce.number(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const authId = request.cookies.authId

      const user = await knex('users')
        .where({ auth_id: authId })
        .select('id')
        .first()

      await knex('meals').where({ user_id: user?.id, id: mealId }).delete()

      return reply.status(200).send()
    },
  )

  app.get(
    '/summary',
    { preHandler: [checkSessionIdExists] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authId = request.cookies.authId

      const user = await knex('users').where({ auth_id: authId }).first()

      const totalMeals = await knex('meals')
        .where({ user_id: user?.id })
        .orderBy('date', 'desc')

      const inDiet = (await knex('meals')
        .where({ user_id: user?.id, in_diet: true })
        .count('* as total')
        .first()) as unknown as CountResult

      const outDiet = (await knex('meals')
        .where({ user_id: user?.id, in_diet: false })
        .count('* as total')
        .first()) as unknown as CountResult

      const { bestDietStreak } = totalMeals.reduce(
        (acc, meal) => {
          if (meal.in_diet) {
            acc.currentStreak += 1
          } else {
            acc.currentStreak = 0
          }

          if (acc.currentStreak > acc.bestDietStreak) {
            acc.bestDietStreak = acc.currentStreak
          }

          return acc
        },
        { bestDietStreak: 0, currentStreak: 0 },
      )

      return reply.status(200).send({
        totalMeals: totalMeals?.length,
        inDiet: inDiet?.total,
        outDiet: outDiet?.total,
        bestDietStreak,
      })
    },
  )
}
