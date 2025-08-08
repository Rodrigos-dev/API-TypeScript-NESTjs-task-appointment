import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ForgetPasswordDto } from './forget-password.dto';

describe('ForgetPasswordDto', () => {

    // --- Teste de Sucesso ---
    it('deve passar a validação com um email válido', async () => {
        const validDto = { email: 'teste@example.com' };
        const dto = plainToInstance(ForgetPasswordDto, validDto);
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
    });

    it('deve falhar se o email for uma string vazia', async () => {
        const invalidDto = { email: '' };
        const dto = plainToInstance(ForgetPasswordDto, invalidDto);
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
        expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('deve falhar se o email for nulo ou undefined', async () => {
            const invalidDto = { email: undefined };
            const dto = plainToInstance(ForgetPasswordDto, invalidDto);
            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].property).toBe('email');
            expect(errors[0].constraints).toHaveProperty('isNotEmpty');
        }
    );

    it('deve falhar se o email tiver um formato inválido', async () => {
        const invalidDto = { email: 'email-invalido' };
        const dto = plainToInstance(ForgetPasswordDto, invalidDto);
        const errors = await validate(dto);
        expect(errors).toHaveLength(1);
        expect(errors[0].property).toBe('email');
        expect(errors[0].constraints).toHaveProperty('isEmail');
    });
});