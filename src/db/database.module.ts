import { Module, Global } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from '../../mikro-orm.config';
import { User } from '../entities/user.entity';

@Global()
@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    MikroOrmModule.forFeature([User]),
  ],
  exports: [MikroOrmModule],
})
export class DatabaseModule {}
