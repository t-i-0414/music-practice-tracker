import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { ApiStandardResponses } from '@/apis/utils/api-default-response';
import { Public } from '@/apis/utils/decorators/public.decorator';
import { FirebaseAuthVerifyTokenDto, FirebaseAuthUserResponseDto } from '@/domain/aggregates/firebase-auth/utils/dto';
import { UserAuthService } from '@/domain/usecases/user-auth/user-auth.service';

@ApiTags('auth')
@Controller('auth')
export class AppApiAuthController {
  public constructor(private readonly userAuthService: UserAuthService) {}

  @Public()
  @Post('verify')
  @ApiOperation({ summary: 'Verify Firebase ID token and sync user' })
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: FirebaseAuthVerifyTokenDto })
  @ApiResponse({ status: 201, description: 'Token verified and user synced', type: FirebaseAuthUserResponseDto })
  @ApiStandardResponses()
  public async verify(@Body() dto: FirebaseAuthVerifyTokenDto): Promise<FirebaseAuthUserResponseDto> {
    return this.userAuthService.execute(dto.idToken);
  }
}
