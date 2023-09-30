import { RegisterStudentUseCase } from '@/domain/forum/application/use-cases/register-student'
import { InMemoryStudentsRepository } from '#/unit/repositories/in-memory-students-repository'
import { FakeHasher } from '#/cryptography/fake-hasher'

interface SutTypes {
  repository: InMemoryStudentsRepository
  fakeHasher: FakeHasher
  sut: RegisterStudentUseCase
}

const makeSut = (): SutTypes => {
  const repository = new InMemoryStudentsRepository()
  const fakeHasher = new FakeHasher()
  const sut = new RegisterStudentUseCase(repository, fakeHasher)

  return { sut, repository, fakeHasher }
}

describe('Register student', () => {
  it('should be able to create a student', async () => {
    const { sut, repository } = makeSut()

    const result = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      student: repository.items[0],
    })
  })

  it('should hash student password upon registration', async () => {
    const { sut, repository, fakeHasher } = makeSut()

    const result = await sut.execute({
      name: 'john doe',
      email: 'johndoe@example.com',
      password: '123456',
    })

    const hashedPassword = await fakeHasher.hash('123456')

    expect(result.isRight()).toBe(true)
    expect(repository.items[0].password).toEqual(hashedPassword)
  })
})
