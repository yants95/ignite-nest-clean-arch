import { Module } from '@nestjs/common'
import { CreateAccountController } from 'src/controllers/create-account.controller'
import { PrismaService } from 'src/prisma/prisma.service'

@Module({
  imports: [],
  controllers: [CreateAccountController],
  providers: [PrismaService],
})
export class AppModule {}
