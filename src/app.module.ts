import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  //The @Module decorator is what makes this a NestJS module. The imports array boot up and wire together everything listed here.
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // loads .env file and makes env variables available globally via ConfigService
    //isGlobal: true, means you never need to import ConfigModule again in any other module. Without it, every module (AuthModule, ProductsModule) that needs an env variable would have to import ConfigModule themselves.
    TypeOrmModule.forRootAsync({
      //sets up your one global database connection for the entire app
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: config.get('NODE_ENV') !== 'production',
        ssl:
          config.get('NODE_ENV') === 'production'
            ? { rejectUnauthorized: false }
            : false,
      }),
      inject: [ConfigService],
    }),

    AuthModule,
    ProductsModule,
    UploadsModule,
  ],
})
export class AppModule {}
