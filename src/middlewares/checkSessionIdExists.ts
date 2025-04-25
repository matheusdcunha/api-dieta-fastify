import type { FastifyRequest, FastifyReply } from 'fastify'

export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authId = request.cookies.authId

  if (!authId) {
    return reply.status(401).send({
      error: 'Unauthorized',
    })
  }
}
