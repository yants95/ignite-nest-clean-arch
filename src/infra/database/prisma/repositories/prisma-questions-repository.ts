import { PaginationParams } from '@/core/repositories/pagination-params'
import { QuestionAttachmentsRepository } from '@/domain/forum/application/repositories/question-attachments-repository'
import { QuestionsRepository } from '@/domain/forum/application/repositories/questions-repository'
import { Question } from '@/domain/forum/enterprise/entities/question'
import { PrismaQuestionMapper } from '@/infra/database/prisma/mappers/prisma-question-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaQuestionsRepository implements QuestionsRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly questionAttachmentsRepository: QuestionAttachmentsRepository,
  ) {}

  async findById(id: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { id },
    })

    if (!question) return null

    return PrismaQuestionMapper.toDomain(question)
  }

  async findBySlug(slug: string): Promise<Question | null> {
    const question = await this.prisma.question.findUnique({
      where: { slug },
    })

    if (!question) return null

    return PrismaQuestionMapper.toDomain(question)
  }

  async findManyRecent({ page }: PaginationParams): Promise<Question[]> {
    const questions = await this.prisma.question.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return questions.map(PrismaQuestionMapper.toDomain)
  }

  async create(question: Question): Promise<void> {
    const questionToCreate = PrismaQuestionMapper.toPersistent(question)

    await this.prisma.question.create({
      data: questionToCreate,
    })

    await this.questionAttachmentsRepository.createMany(
      question.attachments.getItems(),
    )
  }

  async save(question: Question): Promise<void> {
    const questionToUpdate = PrismaQuestionMapper.toPersistent(question)

    await Promise.all([
      this.prisma.question.update({
        where: { id: questionToUpdate.id },
        data: questionToUpdate,
      }),
      this.questionAttachmentsRepository.createMany(
        question.attachments.getNewItems(),
      ),
      this.questionAttachmentsRepository.createMany(
        question.attachments.getRemovedItems(),
      ),
    ])
  }

  async delete(question: Question): Promise<void> {
    const questionToDelete = PrismaQuestionMapper.toPersistent(question)

    await this.prisma.question.delete({
      where: { id: questionToDelete.id },
    })
  }
}
