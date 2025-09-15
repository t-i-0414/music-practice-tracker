import { Body, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiStandardResponses } from '@/apis/utils/api-default-response';
import { ApiController } from '@/apis/utils/controllers/api.controller';
import { Public } from '@/apis/utils/decorators/public.decorator';
import { FirebaseAuthService } from '@/domain/aggregates/firebase-auth/firebase-auth.service';
import { FirebaseAuthVerifyTokenDto, VerifiedTokenResponseDto } from '@/domain/aggregates/firebase-auth/utils/dto';

@ApiTags('auth')
@ApiController('auth')
export class AppApiAuthController {
  public constructor(private readonly firebaseAuthService: FirebaseAuthService) {}

  @Post('verify')
  @Public()
  @ApiOperation({ summary: 'Verify Firebase ID token' })
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: FirebaseAuthVerifyTokenDto })
  @ApiResponse({ status: 200, description: 'Token verification result', type: VerifiedTokenResponseDto })
  @ApiStandardResponses()
  public async verify(@Body() dto: FirebaseAuthVerifyTokenDto): Promise<VerifiedTokenResponseDto> {
    const result = await this.firebaseAuthService.verifyIdToken(dto.idToken);
    return {
      uid: result.uid,
      email: result.email,
      emailVerified: result.email_verified === true,
      signInProvider: result.firebase.sign_in_provider,
    };
  }
}
