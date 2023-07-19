export class TokenEntity {
    /**
     * Access Token
     * @example 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQU5BTFlTVCIsInVzZXJJZCI6MiwiaWF0IjoxNjUzNDczMjc2LCJleHAiOjE2NTM0NzMzMzZ9.0UmwzeISGncWzL1DzzrltQSpN9QgeU0blu_3-QxsJHs'
     */
    accessToken: string
  
    /**
     * Refresh Token
     * @example 'd50a44bc-5249-4406-83b1-afdea1887243'
     */
    refreshToken: string
  
    constructor(partial: Partial<TokenEntity>) {
      Object.assign(this, partial)
    }
  }
  