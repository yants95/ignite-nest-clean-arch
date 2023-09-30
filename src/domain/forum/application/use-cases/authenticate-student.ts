import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { StudentsRepository } from '@/domain/forum/application/repositories/student-repository'
import { HashComparer } from '@/domain/forum/application/criptography/hash-comparer'
import { Encrypter } from '@/domain/forum/application/criptography/encrypter'
import { WrongCredentialsError } from '@/domain/forum/application/use-cases/errors/wrong-credentials-error'

interface AuthenticateStudentUseCaseRequest {
  email: string
  password: string
}

type AuthenticateStudentUseCaseResponse = Either<
  WrongCredentialsError,
  {
    accessToken: string
  }
>

@Injectable()
export class AuthenticateStudentUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly hashComparer: HashComparer,
    private readonly encrypter: Encrypter,
  ) {}

  async execute(
    auth: AuthenticateStudentUseCaseRequest,
  ): Promise<AuthenticateStudentUseCaseResponse> {
    const student = await this.studentsRepository.findByEmail(auth.email)

    if (!student) return left(new WrongCredentialsError())

    const isPasswordValid = await this.hashComparer.compare(
      auth.password,
      student.password,
    )

    if (!isPasswordValid) return left(new WrongCredentialsError())

    const accessToken = await this.encrypter.encrypt({
      sub: student.id.toString(),
    })

    return right({ accessToken })
  }
}
