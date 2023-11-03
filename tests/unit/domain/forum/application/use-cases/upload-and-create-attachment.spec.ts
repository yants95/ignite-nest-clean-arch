import { UploadAndCreateAttachmentUseCase } from '@/domain/forum/application/use-cases/upload-and-create-attachment'
import { FakeStorage } from '#/unit/storage/fake-storage'
import { InMemoryAttachmentsRepository } from '#/unit/repositories/in-memory-attachments-repository'

interface SutTypes {
  repository: InMemoryAttachmentsRepository
  storage: FakeStorage
  sut: UploadAndCreateAttachmentUseCase
}

const makeSut = (): SutTypes => {
  const repository = new InMemoryAttachmentsRepository()
  const storage = new FakeStorage()
  const sut = new UploadAndCreateAttachmentUseCase(repository, storage)

  return { sut, repository, storage }
}

describe('Upload attachment', () => {
  it('should be able to upload and create attachment', async () => {
    const { sut, repository, storage } = makeSut()

    const result = await sut.execute({
      fileName: 'profile.png',
      fileType: 'image/png',
      body: Buffer.from(''),
    })

    expect(result.isRight()).toBe(true)
    expect(result.value).toEqual({
      attachment: repository.items[0],
    })
    expect(storage.uploads).toHaveLength(1)
  })

  it('should not be able to upload and create attachment with invalid type', async () => {
    const { sut } = makeSut()

    const result = await sut.execute({
      fileName: 'profile.mp3',
      fileType: 'audio/mp3',
      body: Buffer.from(''),
    })

    expect(result.isLeft()).toBe(true)
  })
})
