import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments'
import { CommentPresenter } from '@/infra/http/presenters/comment-presenter'

const pageQueryParamSchema = z
  .string()
  .optional()
  .default('1')
  .transform(Number)
  .pipe(z.number().min(1))

const queryValidationPipe = new ZodValidationPipe(pageQueryParamSchema)

type PageQueryParamSchema = z.infer<typeof pageQueryParamSchema>

@Controller('/answers/:id/comments')
export class FetchAnswerCommentsController {
  constructor(private readonly usecase: FetchAnswerCommentsUseCase) {}

  @Get()
  async handle(
    @Query('page', queryValidationPipe) page: PageQueryParamSchema,
    @Param('id') answerId: string,
  ) {
    const result = await this.usecase.execute({ answerId, page })

    if (result.isLeft()) throw new BadRequestException()

    const answerComments = result.value.answerComments

    return { answerComments: answerComments.map(CommentPresenter.toHTTP) }
  }
}
