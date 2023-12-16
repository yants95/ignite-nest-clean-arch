import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryAnswerCommentsRepository } from '#/unit/repositories/in-memory-answer-comments-repository'
import { FetchAnswerCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-answer-comments'
import { makeAnswerComment } from '#/unit/factories/make-answer-comment'
import { InMemoryStudentsRepository } from '#/unit/repositories/in-memory-students-repository'
import { makeStudent } from '#/unit/factories/make-student'
import { Student } from '@/domain/forum/enterprise/entities/student'
import { AnswerComment } from '@/domain/forum/enterprise/entities/answer-comment'

interface Fixture {
  student: Student
  answerComment: AnswerComment
}

interface Sut {
  studentRepository: InMemoryStudentsRepository
  answerCommentsRepository: InMemoryAnswerCommentsRepository
  sut: FetchAnswerCommentsUseCase
}

const makeSut = (): Sut => {
  const studentRepository = new InMemoryStudentsRepository()
  const answerCommentsRepository = new InMemoryAnswerCommentsRepository(
    studentRepository,
  )
  const sut = new FetchAnswerCommentsUseCase(answerCommentsRepository)

  return { sut, answerCommentsRepository, studentRepository }
}

const makeFixture = (): Fixture => {
  const student = makeStudent()
  const answerComment = makeAnswerComment({
    answerId: new UniqueEntityID('answer-1'),
    authorId: student.id,
  })

  return { student, answerComment }
}

describe('Fetch Answer Comments', () => {
  it('should be able to fetch answer comments', async () => {
    const { student } = makeFixture()
    const { sut, answerCommentsRepository, studentRepository } = makeSut()

    studentRepository.items.push(student)

    const comment1 = makeAnswerComment({
      answerId: new UniqueEntityID('answer-1'),
      authorId: student.id,
    })
    const comment2 = makeAnswerComment({
      answerId: new UniqueEntityID('answer-1'),
      authorId: student.id,
    })
    const comment3 = makeAnswerComment({
      answerId: new UniqueEntityID('answer-1'),
      authorId: student.id,
    })

    await answerCommentsRepository.create(comment1)
    await answerCommentsRepository.create(comment2)
    await answerCommentsRepository.create(comment3)

    const result = await sut.execute({
      answerId: 'answer-1',
      page: 1,
    })

    expect(result.value?.comments).toHaveLength(3)
  })

  it('should be able to fetch paginated answer comments', async () => {
    const { student } = makeFixture()
    const { sut, studentRepository, answerCommentsRepository } = makeSut()

    studentRepository.items.push(student)

    for (let i = 1; i <= 22; i++) {
      await answerCommentsRepository.create(
        makeAnswerComment({
          answerId: new UniqueEntityID('answer-1'),
          authorId: student.id,
        }),
      )
    }

    const result = await sut.execute({
      answerId: 'answer-1',
      page: 2,
    })

    expect(result.value?.comments).toHaveLength(2)
  })
})
