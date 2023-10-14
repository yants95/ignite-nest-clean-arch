import { BadRequestException, Controller, Get, Param } from '@nestjs/common'
import { GetQuestionBySlugUseCase } from '@/domain/forum/application/use-cases/get-question-by-slug'
import { QuestionPresenter } from '@/infra/http/presenters/question-presenter'

@Controller('/questions/:slug')
export class GetQuestionBySlugController {
  constructor(private readonly usecase: GetQuestionBySlugUseCase) {}

  @Get()
  async handle(@Param('slug') slug: string) {
    const result = await this.usecase.execute({ slug })

    if (result.isLeft()) throw new BadRequestException()

    return { question: QuestionPresenter.toHTTP(result.value.question) }
  }
}
