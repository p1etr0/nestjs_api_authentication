import { IsString } from 'class-validator';

export class ActivateDto {
  @IsString()
  confirmationCode: string;
}
