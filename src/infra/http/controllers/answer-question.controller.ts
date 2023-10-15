import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { AnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'

const answerQuestionBodySchema = z.object({
  content: z.string(),
})

const bodyValidationpPipe = new ZodValidationPipe(answerQuestionBodySchema)

type answerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>

@Controller('/questions/:questionId/answers')
export class answerQuestionController {
  constructor(private readonly usecase: AnswerQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationpPipe) body: answerQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('questionId') questionId: string,
  ) {
    const userId = user.sub

    const result = await this.usecase.execute({
      ...body,
      questionId,
      authorId: userId,
      attachmentsIds: [],
    })

    if (result.isLeft()) throw new BadRequestException()
  }
}
