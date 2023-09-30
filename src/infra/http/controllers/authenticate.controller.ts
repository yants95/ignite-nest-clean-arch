import {
  HttpCode,
  Body,
  Controller,
  Post,
  UsePipes,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student'
import { WrongCredentialsError } from '@/domain/forum/application/use-cases/errors/wrong-credentials-error'

const authenticateBodySchema = z.object({
  email: z.string(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/login')
export class AuthenticateController {
  constructor(private readonly usecase: AuthenticateStudentUseCase) {}

  @Post()
  @HttpCode(201)
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const result = await this.usecase.execute(body)

    if (result.isLeft()) {
      const error = result.value

      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException()
      }
    }

    const { accessToken } = result.value

    return { access_token: accessToken }
  }
}
