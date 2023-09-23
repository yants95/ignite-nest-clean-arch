import {
  HttpCode,
  ConflictException,
  Body,
  Controller,
  Post,
  UsePipes,
} from '@nestjs/common'
import { PrismaService } from '@/infra/prisma/prisma.service'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'

const createAccountBodySchema = z.object({
  name: z.string(),
  email: z.string(),
  password: z.string(),
})

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>

@Controller('/accounts')
export class CreateAccountController {
  constructor(private readonly prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(createAccountBodySchema))
  async handle(@Body() body: CreateAccountBodySchema) {
    const { email } = body

    const userWithSameEmail = await this.prisma.user.findUnique({
      where: { email },
    })

    if (userWithSameEmail) {
      throw new ConflictException('User with same email already exists')
    }

    const hashedPassword = await hash(body.password, 8)

    await this.prisma.user.create({
      data: {
        ...body,
        password: hashedPassword,
      },
    })
  }
}
