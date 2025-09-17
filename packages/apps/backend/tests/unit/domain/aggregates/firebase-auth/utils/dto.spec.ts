import { validateSync } from 'class-validator';

import { FirebaseAuthVerifyTokenDto, VerifiedTokenResponseDto } from '@/domain/aggregates/firebase-auth/utils/dto';

describe('unit firebase auth dto', () => {
  describe('firebaseAuthVerifyTokenDto', () => {
    it('passes validation when idToken is a non-empty string', () => {
      expect.assertions(1);

      const dto = new FirebaseAuthVerifyTokenDto();
      dto.idToken = 'token-value';

      const result = validateSync(dto);

      expect(result).toHaveLength(0);
    });

    it('fails validation when idToken is missing', () => {
      expect.assertions(2);

      const dto = new FirebaseAuthVerifyTokenDto();

      const result = validateSync(dto);

      expect(result).toHaveLength(1);
      expect(result[0].constraints).toBeDefined();
    });
  });

  describe('verifiedTokenResponseDto', () => {
    it('passes validation when every required property is valid', () => {
      expect.assertions(1);

      const dto = new VerifiedTokenResponseDto();
      dto.uid = 'uid123';
      dto.email = 'user@example.com';
      dto.emailVerified = true;
      dto.signInProvider = 'google.com';

      const result = validateSync(dto);

      expect(result).toHaveLength(0);
    });

    it('fails validation when types are incorrect', () => {
      expect.assertions(2);

      const dto = new VerifiedTokenResponseDto();
      dto.uid = '' as unknown as string;
      dto.emailVerified = 'nope' as unknown as boolean;

      const result = validateSync(dto);

      expect(result).not.toHaveLength(0);
      expect(result.map((err) => err.property)).toStrictEqual(expect.arrayContaining(['uid', 'emailVerified']));
    });
  });
});
