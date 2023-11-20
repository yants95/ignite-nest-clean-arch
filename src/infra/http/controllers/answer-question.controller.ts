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
import { CreateAnswerQuestionUseCase } from '@/domain/forum/application/use-cases/answer-question'

const answerQuestionBodySchema = z.object({
  content: z.string(),
  attachments: z.array(z.string().uuid()),
})

const bodyValidationpPipe = new ZodValidationPipe(answerQuestionBodySchema)

type AnswerQuestionBodySchema = z.infer<typeof answerQuestionBodySchema>

@Controller('/questions/:questionId/answers')
export class CreateAnswerQuestionController {
  constructor(private readonly usecase: CreateAnswerQuestionUseCase) {}

  @Post()
  async handle(
    @Body(bodyValidationpPipe) body: AnswerQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('questionId') questionId: string,
  ) {
    const userId = user.sub

    const result = await this.usecase.execute({
      ...body,
      questionId,
      authorId: userId,
      attachmentsIds: body.attachments,
    })

    if (result.isLeft()) throw new BadRequestException()
  }
}
