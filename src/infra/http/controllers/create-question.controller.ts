import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { CreateQuestionUseCase } from '@/domain/forum/application/use-cases/create-question'

const createQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
})

const bodyValidationpPipe = new ZodValidationPipe(createQuestionBodySchema)

type CreateQuestionBodySchema = z.infer<typeof createQuestionBodySchema>

@Controller('/questions')
@UseGuards(AuthGuard('jwt'))
export class CreateQuestionController {
  constructor(private readonly usecase: CreateQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationpPipe) body: CreateQuestionBodySchema,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.sub

    const result = await this.usecase.execute({
      ...body,
      authorId: userId,
      attachmentsIds: [],
    })

    if (result.isLeft()) throw new BadRequestException()
  }
}
