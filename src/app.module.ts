import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { PrismaModule } from './db/prisma.module';
import { prismaLoggerMiddleware } from './db/prisma.logging.middleware';
import { JsonBodyMiddleware } from './common/filter/json-body.middleware';
import { PrismaService } from './db/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/guard/roles.guard';
// import { JwtAuthGuard } from './auth/guard/jwt-guard.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from './users/users.module';
import { CommentModule } from './comment/comment.module';
import { JwtAuthGuard } from './auth/guard/jwt-guard.guard';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BlogModule } from './blog/blog.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../', 'public'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validationOptions: {
        allowUnknow: false,
        abortEarly: true,
      },
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3001),
        ENABLE_SWAGGER: Joi.boolean().default(false),
        JWT_ACCESS_SECRET: Joi.string(),
        JWT_ACCESS_EXPIRES_IN: Joi.string().default('5m'),
        JWT_REFRESH_EXPIRES_IN: Joi.string().default('1d'),
        REGISTER_TOKEN_EXPIRES_IN: Joi.string().default('1d'),
        SALT_ROUND: Joi.number().default(10),
      }),
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'adadadada',
      signOptions: { expiresIn: '360s' },
    }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [prismaLoggerMiddleware()],
        prismaOptions: {
          log: ['error', 'warn'],
        },
        explicitConnect: true,
      },
    }),
    MulterModule.registerAsync({
      useFactory: () => ({
        storage: diskStorage({
          destination: './public/avatars',
          filename: (req, file, callback) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            callback(null, `${uniqueSuffix}-${file.originalname}`);
          },
        }),
      }),
    }),
    AuthModule,
    HttpModule,
    UsersModule,
    BlogModule,
    CommentModule,
    BlogModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JsonBodyMiddleware).forRoutes('*');
  }
}
