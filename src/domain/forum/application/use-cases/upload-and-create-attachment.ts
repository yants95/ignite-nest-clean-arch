import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { InvalidAttachmentTypeError } from '@/domain/forum/application/use-cases/errors/invalid-attachment-type-error'
import { Attachment } from '@/domain/forum/enterprise/entities/attachment'
import { AttachmentsRepository } from '@/domain/forum/application/repositories/attachments-repository'
import { Uploader } from '@/domain/forum/application/storage/uploader'

interface UploadAndCreateAttachmentUseCaseRequest {
  fileName: string
  fileType: string
  body: Buffer
}

type UploadAndCreateAttachmentUseCaseResponse = Either<
  InvalidAttachmentTypeError,
  { attachment: Attachment }
>

@Injectable()
export class UploadAndCreateAttachmentUseCase {
  constructor(
    private readonly attachmentsRepository: AttachmentsRepository,
    private readonly uploader: Uploader,
  ) {}

  async execute(
    request: UploadAndCreateAttachmentUseCaseRequest,
  ): Promise<UploadAndCreateAttachmentUseCaseResponse> {
    const { fileType, fileName } = request
    const isInvalidMimeType = this.validateMimeType(fileType)

    if (isInvalidMimeType) return left(new InvalidAttachmentTypeError(fileType))

    const { url } = await this.uploader.upload(request)

    const attachment = Attachment.create({
      title: fileName,
      url,
    })

    await this.attachmentsRepository.create(attachment)

    return right({ attachment })
  }

  private validateMimeType(fileType: string): boolean {
    return !/^(image\/(jpeg|png))$|^application\/pdf$/.test(fileType)
  }
}
