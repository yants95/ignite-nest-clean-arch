import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InMemoryQuestionCommentsRepository } from '#/unit/repositories/in-memory-question-comments-repository'
import { FetchQuestionCommentsUseCase } from '@/domain/forum/application/use-cases/fetch-question-comments'
import { makeQuestionComment } from '#/unit/factories/make-question-comment'
import { InMemoryStudentsRepository } from '#/unit/repositories/in-memory-students-repository'
import { makeStudent } from '#/unit/factories/make-student'
import { Student } from '@/domain/forum/enterprise/entities/student'
import { QuestionComment } from '@/domain/forum/enterprise/entities/question-comment'

interface Fixture {
  student: Student
  comment: QuestionComment
}

interface Sut {
  studentRepository: InMemoryStudentsRepository
  questionCommentsRepository: InMemoryQuestionCommentsRepository
  sut: FetchQuestionCommentsUseCase
}

const makeSut = (): Sut => {
  const studentRepository = new InMemoryStudentsRepository()
  const questionCommentsRepository = new InMemoryQuestionCommentsRepository(
    studentRepository,
  )
  const sut = new FetchQuestionCommentsUseCase(questionCommentsRepository)

  return { sut, questionCommentsRepository, studentRepository }
}

const makeFixture = (): Fixture => {
  const student = makeStudent()
  const comment = makeQuestionComment({
    questionId: new UniqueEntityID('question-1'),
    authorId: student.id,
  })

  return { student, comment }
}

describe('Fetch Question Comments', () => {
  it('should be able to fetch question comments', async () => {
    const { student } = makeFixture()
    const { sut, studentRepository, questionCommentsRepository } = makeSut()

    studentRepository.items.push(student)

    const comment1 = makeQuestionComment({
      questionId: new UniqueEntityID('question-1'),
      authorId: student.id,
    })

    const comment2 = makeQuestionComment({
      questionId: new UniqueEntityID('question-1'),
      authorId: student.id,
    })

    const comment3 = makeQuestionComment({
      questionId: new UniqueEntityID('question-1'),
      authorId: student.id,
    })

    await questionCommentsRepository.create(comment1)
    await questionCommentsRepository.create(comment2)
    await questionCommentsRepository.create(comment3)

    const result = await sut.execute({
      questionId: 'question-1',
      page: 1,
    })

    expect(result.value?.comments).toHaveLength(3)
  })

  it('should be able to fetch paginated question comments', async () => {
    const { student } = makeFixture()
    const { studentRepository, sut, questionCommentsRepository } = makeSut()

    studentRepository.items.push(student)

    for (let i = 1; i <= 22; i++) {
      await questionCommentsRepository.create(
        makeQuestionComment({
          questionId: new UniqueEntityID('question-1'),
          authorId: student.id,
        }),
      )
    }

    const result = await sut.execute({
      questionId: 'question-1',
      page: 2,
    })

    expect(result.value?.comments).toHaveLength(2)
  })
})
