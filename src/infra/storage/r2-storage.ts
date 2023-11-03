import {
  UploadParams,
  Uploader,
} from '@/domain/forum/application/storage/uploader'
import { EnvService } from '@/infra/env/env.service'

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'

@Injectable()
export class R2Storage implements Uploader {
  private client: S3Client

  constructor(private readonly envService: EnvService) {
    const accountId = this.envService.get('CLOUDFLARE_ACCOUNT_ID')

    this.client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      region: 'auto',
      credentials: {
        accessKeyId: this.envService.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.envService.get('AWS_SECRET_ACCESS_KEY'),
      },
    })
  }

  async upload(params: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID()
    const uniqueFileName = `${uploadId}-${params.fileName}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.envService.get('AWS_BUCKET_NAME'),
        Key: uniqueFileName,
        ContentType: params.fileType,
        Body: params.body,
      }),
    )

    return {
      url: uniqueFileName,
    }
  }
}
