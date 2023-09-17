import {
  HttpCode,
  Body,
  Controller,
  Post,
  UsePipes,
  UnauthorizedException,
} from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { compare } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '@/pipes/zod-validation-pipe'
import { JwtService } from '@nestjs/jwt'

const authenticateBodySchema = z.object({
  email: z.string(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/login')
export class AuthenticateController {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    })

    if (!user) throw new UnauthorizedException('User credentials do not match.')

    const isPasswordValid = await compare(body.password, user.password)

    if (!isPasswordValid)
      throw new UnauthorizedException('User credentials do not match.')

    const accessToken = this.jwt.sign({ sub: user.id })

    return { access_token: accessToken }
  }
}
