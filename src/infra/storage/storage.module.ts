import { Uploader } from '@/domain/forum/application/storage/uploader'
import { EnvService } from '@/infra/env/env.service'
import { R2Storage } from '@/infra/storage/r2-storage'
import { Module } from '@nestjs/common'

@Module({
  imports: [EnvService],
  providers: [{ provide: Uploader, useClass: R2Storage }],
  exports: [Uploader],
})
export class StorageModule {}
