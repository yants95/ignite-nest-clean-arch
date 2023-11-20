import { AnswerAttachmentsRepository } from '@/domain/forum/application/repositories/answer-attachments-repository'
import { AnswerAttachment } from '@/domain/forum/enterprise/entities/answer-attachment'
import { PrismaAnswerAttachmentMapper } from '@/infra/database/prisma/mappers/prisma-answer-attachment-mapper'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class PrismaAnswerAttachmentsRepository
  implements AnswerAttachmentsRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async findManyByAnswerId(answerId: string): Promise<AnswerAttachment[]> {
    const QuestionAttachments = await this.prisma.attachment.findMany({
      where: { answerId },
    })

    return QuestionAttachments.map(PrismaAnswerAttachmentMapper.toDomain)
  }

  async deleteManyByAnswerId(questionId: string): Promise<void> {
    await this.prisma.attachment.deleteMany({
      where: { questionId },
    })
  }

  async createMany(attachments: AnswerAttachment[]): Promise<void> {
    if (attachments.length === 0) return

    const data = PrismaAnswerAttachmentMapper.toPrismaUpdateMany(attachments)

    await this.prisma.attachment.updateMany(data)
  }

  async deleteMany(attachments: AnswerAttachment[]): Promise<void> {
    if (attachments.length === 0) return

    const attachmentsIds = attachments.map((attachment) =>
      attachment.attachmentId.toString(),
    )

    await this.prisma.attachment.deleteMany({
      where: {
        id: {
          in: attachmentsIds,
        },
      },
    })
  }
}
