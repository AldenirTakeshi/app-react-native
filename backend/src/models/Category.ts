import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome da categoria é obrigatório'],
      trim: true,
      unique: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [50, 'Nome deve ter no máximo 50 caracteres'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Descrição deve ter no máximo 200 caracteres'],
    },
    color: {
      type: String,
      default: '#007AFF',
      match: [
        /^#[0-9A-F]{6}$/i,
        'Cor deve estar no formato hexadecimal (#RRGGBB)',
      ],
    },
    icon: {
      type: String,
      default: 'calendar',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

categorySchema.index({ name: 'text' });

const Category = model<ICategory>('Category', categorySchema);

export { Category };



