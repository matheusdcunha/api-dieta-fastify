import fastify from 'fastify'
import cookie from '@fastify/cookie'

import { userRoutes } from './routes/userRoutes'
import { mealRoutes } from './routes/mealRoutes'

export const app = fastify()

app.register(cookie)

app.register(userRoutes, { prefix: '/user' })
app.register(mealRoutes, { prefix: '/meal' })
