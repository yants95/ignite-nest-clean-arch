import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswersRepository } from '@/domain/forum/application/repositories/answers-repository'
import { Answer } from '@/domain/forum/enterprise/entities/answer'
import { PrismaAnswerMapper } from '@/infra/database/prisma/mappers/prisma-answer-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaAnswersRepository implements AnswersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly answerAttachmentRepository: AnswerAttachmentsRepository,
  ) {}

  async findById(id: string): Promise<Answer | null> {
    const answer = await this.prisma.answer.findUnique({
      where: { id },
    })

    if (!answer) return null

    return PrismaAnswerMapper.toDomain(answer)
  }

  async findManyByQuestionId(
    questionId: string,
    { page }: PaginationParams,
  ): Promise<Answer[]> {
    const answers = await this.prisma.answer.findMany({
      where: { questionId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return answers.map(PrismaAnswerMapper.toDomain)
  }

  async create(answer: Answer): Promise<void> {
    const answerToCreate = PrismaAnswerMapper.toPersistent(answer)

    await this.prisma.answer.create({
      data: answerToCreate,
    })

    await this.answerAttachmentRepository.createMany(
      answer.attachments.getItems(),
    )
  }

  async save(answer: Answer): Promise<void> {
    const answerToUpdate = PrismaAnswerMapper.toPersistent(answer)

    await Promise.all([
      this.prisma.answer.update({
        where: { id: answerToUpdate.id },
        data: answerToUpdate,
      }),
      this.answerAttachmentRepository.createMany(
        answer.attachments.getNewItems(),
      ),
      this.answerAttachmentRepository.createMany(
        answer.attachments.getRemovedItems(),
      ),
    ])
  }

  async delete(answer: Answer): Promise<void> {
    await this.prisma.answer.delete({
      where: { id: answer.id?.toString() },
    })
  }
}
