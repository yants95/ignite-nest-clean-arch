import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'
import { Comment as PrismaComment, Prisma } from '@prisma/client'

export class PrismaQuestionCommentMapper {
  static toDomain(raw: PrismaComment): QuestionComment {
    if (!raw.questionId) throw new Error('Invalid comment type.')

    return QuestionComment.create(
      {
        content: raw.content,
        authorId: new UniqueEntityID(raw.authorId),
        questionId: new UniqueEntityID(raw.questionId),
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPersistent(
    QuestionComment: QuestionComment,
  ): Prisma.CommentUncheckedCreateInput {
    return {
      id: QuestionComment.id.toString(),
      authorId: QuestionComment.authorId.toString(),
      questionId: QuestionComment.questionId.toString(),
      content: QuestionComment.content,
      createdAt: QuestionComment.createdAt,
      updatedAt: QuestionComment.updatedAt,
    }
  }
}
