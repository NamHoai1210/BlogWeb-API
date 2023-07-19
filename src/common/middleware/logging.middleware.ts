import { Logger } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

const logger = new Logger('HTTP')

export function loggerMiddleWare( req: Request, res: Response, next: NextFunction){
  const { ip, method, originalUrl } = req
  const userAgent = req.get('user-agent') || ''

  res.on('finish', () => {
    const { statusCode } = res
    const contentLength = res.get('content-length')

    logger.log(
      `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
    )
  })
  next()
}

