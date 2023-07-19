declare const module: any
import {
  ClassSerializerInterceptor,
  Logger,
  LogLevel,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { loggerMiddleWare } from './common/middleware/logging.middleware'
import helmet from 'helmet'
import compression from 'compression'
import { ConfigService } from '@nestjs/config'
import { PrismaClientExceptionFilter } from './common/filter/prisma-client-exception.filter'

// import { config } from 'aws-sdk'

async function bootstrap() {
  const logger = new Logger('main')
  logger.log('bootstrap with env:: ' + process.env.NODE_ENV)
  const loglevels: LogLevel[] = ['log', 'error', 'warn']
  if (process.env.NODE_ENV === 'development') {
    loglevels.push('debug', 'verbose')
  }

  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: loglevels,
  })
  app.enableCors({
    origin: '*',
    allowedHeaders: '*',
    credentials: false,
  })

  app.use(helmet(), loggerMiddleWare, compression())
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
  const { httpAdapter } = app.get(HttpAdapterHost)
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
  const configService = app.get(ConfigService)

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  )
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })

  if (configService.get<boolean>('ENABLE_SWAGGER')) {
    const swgConfig = new DocumentBuilder()
      .setTitle('Blog Web')
      .setDescription('The API')
      .setVersion('2.0')
      .addSecurityRequirements('bearer')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, swgConfig)
    SwaggerModule.setup('/', app, document)
    const env = configService.get<string>('NODE_ENV')
    if (env === 'development') {
      import('fs').then((fs) => {
        import('prettier').then((prettier) => {
          fs.writeFileSync(
            'swagger.json',
            prettier.format(JSON.stringify(document), {
              parser: 'json',
            }),
          )
        })
      })
    }
  }

  const port = configService.get<number>('PORT')
  await app.listen(port)
  logger.log(
    `app running on PORT: ${port} - with ENV: ${configService.get<string>(
      'NODE_ENV',
    )}`,
  )

  // HMR
  if (module.hot) {
    module.hot.accept()
    module.hot.dispose(() => app.close())
  }
}
bootstrap()
