import { UseCaseError } from '@/core/errors/use-case-error'

export class StudentAlreadyExistsError extends Error implements UseCaseError {
  constructor() {
    super('Student with same e-mail adress already exists')
  }
}
