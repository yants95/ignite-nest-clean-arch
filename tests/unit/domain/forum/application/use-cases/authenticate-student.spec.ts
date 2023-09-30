import { InMemoryStudentsRepository } from '#/unit/repositories/in-memory-students-repository'
import { FakeHasher } from '#/cryptography/fake-hasher'
import { FakeEncrypter } from '#/cryptography/fake-encrypter'
import { AuthenticateStudentUseCase } from '@/domain/forum/application/use-cases/authenticate-student'
import { makeStudent } from '#/unit/factories/make-student'

interface SutTypes {
  repository: InMemoryStudentsRepository
  fakeHasher: FakeHasher
  fakeEncrypter: FakeEncrypter
  sut: AuthenticateStudentUseCase
}

const makeSut = (): SutTypes => {
  const repository = new InMemoryStudentsRepository()
  const fakeHasher = new FakeHasher()
  const fakeEncrypter = new FakeEncrypter()
  const sut = new AuthenticateStudentUseCase(
    repository,
    fakeHasher,
    fakeEncrypter,
  )

  return { sut, repository, fakeHasher, fakeEncrypter }
}

describe('Authenticate student', () => {
  it('should be able to authenticate a student', async () => {
    const { sut, repository, fakeHasher } = makeSut()
    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await fakeHasher.hash('123456'),
    })

    repository.items.push(student)

    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      accessToken: expect.any(String),
    })
  })
})
