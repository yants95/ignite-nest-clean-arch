import { PaginationParams } from '@/core/repositories/pagination-params'
import { AnswerCommentsRepository } from '@/domain/forum/application/repositories/answer-comments-repository'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'
import { PrismaAnswerCommentMapper } from '@/infra/database/prisma/mappers/prisma-answer-comment-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaAnswerCommentsRepository
  implements AnswerCommentsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AnswerComment | null> {
    const AnswerComment = await this.prisma.comment.findUnique({
      where: { id },
    })

    if (!AnswerComment) return null

    return PrismaAnswerCommentMapper.toDomain(AnswerComment)
  }

  async findManyByAnswerId(
    answerId: string,
    { page }: PaginationParams,
  ): Promise<AnswerComment[]> {
    const answers = await this.prisma.comment.findMany({
      where: { answerId },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
      skip: (page - 1) * 20,
    })

    return answers.map(PrismaAnswerCommentMapper.toDomain)
  }

  async create(AnswerComment: AnswerComment): Promise<void> {
    const AnswerCommentToCreate =
      PrismaAnswerCommentMapper.toPersistent(AnswerComment)

    await this.prisma.comment.create({
      data: AnswerCommentToCreate,
    })
  }

  async delete(AnswerComment: AnswerComment): Promise<void> {
    await this.prisma.comment.delete({
      where: { id: AnswerComment.id?.toString() },
    })
  }
}
