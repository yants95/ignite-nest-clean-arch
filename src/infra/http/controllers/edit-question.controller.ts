import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { EditQuestionUseCase } from '@/domain/forum/application/use-cases/edit-question'

const EditQuestionBodySchema = z.object({
  title: z.string(),
  content: z.string(),
  attachments: z.array(z.string().uuid()),
})

const bodyValidationpPipe = new ZodValidationPipe(EditQuestionBodySchema)

type EditQuestionBodySchema = z.infer<typeof EditQuestionBodySchema>

@Controller('/questions/:id')
export class EditQuestionController {
  constructor(private readonly usecase: EditQuestionUseCase) {}

  @Put()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationpPipe) body: EditQuestionBodySchema,
    @CurrentUser() user: UserPayload,
    @Param('id') questionId: string,
  ) {
    const userId = user.sub

    const result = await this.usecase.execute({
      ...body,
      authorId: userId,
      attachmentsIds: body.attachments,
      questionId,
    })

    if (result.isLeft()) throw new BadRequestException()
  }
}
