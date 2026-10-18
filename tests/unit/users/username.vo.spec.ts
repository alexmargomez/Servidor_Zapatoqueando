import { UsernameVO } from '../../../src/modules/users/domain/value-objects/username.vo';
import { MissingCredentialsException } from '../../../src/modules/users/domain/exceptions/invalid-credentials.exception';

describe('UsernameVO', () => {
  it('should trim whitespace and store valid username', () => {
    const vo = new UsernameVO('  admin  ');
    expect(vo.value).toBe('admin');
  });

  it('should throw MissingCredentialsException when username is empty', () => {
    expect(() => new UsernameVO('')).toThrow(MissingCredentialsException);
  });

  it('should throw MissingCredentialsException when username is only whitespace', () => {
    expect(() => new UsernameVO('   ')).toThrow(MissingCredentialsException);
  });
});
