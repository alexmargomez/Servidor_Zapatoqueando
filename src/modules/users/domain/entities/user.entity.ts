export interface UserProps {
  id: number;
  username: string;
  passwordHash: string;
  role: string;
}

export class UserEntity {
  public readonly id: number;
  public readonly username: string;
  public readonly passwordHash: string;
  public readonly role: string;

  constructor(props: UserProps) {
    this.id = props.id;
    this.username = props.username;
    this.passwordHash = props.passwordHash;
    this.role = props.role || 'admin';
  }
}
