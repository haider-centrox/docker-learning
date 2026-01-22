import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['low', 'medium', 'high'])
  @IsOptional()
  priority?: 'low' | 'medium' | 'high';

  @IsEnum(['todo', 'in-progress', 'completed'])
  @IsOptional()
  status?: 'todo' | 'in-progress' | 'completed';

  @IsDateString()
  @IsOptional()
  dueDate?: string;
}
