import { Encrypter } from '@/domain/forum/application/criptography/encrypter'
import { HashComparer } from '@/domain/forum/application/criptography/hash-comparer'
import { HashGenerator } from '@/domain/forum/application/criptography/hash-generator'
import { BcryptHasher } from '@/infra/cryptography/bcrypt-hasher'
import { JWTEncrypter } from '@/infra/cryptography/jwt-encrypter'
import { Module } from '@nestjs/common'

@Module({
  providers: [
    { provide: Encrypter, useClass: JWTEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
