import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { Student } from '@/domain/forum/enterprise/entities/student'
import { StudentsRepository } from '@/domain/forum/application/repositories/student-repository'
import { HashGenerator } from '@/domain/forum/application/criptography/hash-generator'
import { StudentAlreadyExistsError } from '@/domain/forum/application/use-cases/errors/student-already-exists-error'

interface RegisterStudentUseCaseRequest {
  name: string
  email: string
  password: string
}

type RegisterStudentUseCaseResponse = Either<
  StudentAlreadyExistsError,
  {
    student: Student
  }
>

@Injectable()
export class RegisterStudentUseCase {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly hashGenerator: HashGenerator,
  ) {}

  async execute(
    request: RegisterStudentUseCaseRequest,
  ): Promise<RegisterStudentUseCaseResponse> {
    const studentExists = await this.studentsRepository.findByEmail(
      request.email,
    )

    if (studentExists) return left(new StudentAlreadyExistsError())

    const hashedPassword = await this.hashGenerator.hash(request.password)

    const student = Student.create({
      ...request,
      password: hashedPassword,
    })

    await this.studentsRepository.create(student)

    return right({ student })
  }
}
