import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailSendDto } from './create-email-send.dto';

export class UpdateEmailSendDto extends PartialType(CreateEmailSendDto) {}
