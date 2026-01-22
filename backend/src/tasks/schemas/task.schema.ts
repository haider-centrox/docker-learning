import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskDocument = Task & Document;

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: 'low' | 'medium' | 'high';

  @Prop({ enum: ['todo', 'in-progress', 'completed'], default: 'todo' })
  status: 'todo' | 'in-progress' | 'completed';

  @Prop()
  dueDate: Date;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
