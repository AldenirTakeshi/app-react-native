import { Schema, model, Document } from 'mongoose';

export interface IEvent extends Document {
  _id: string;
  name: string;
  description: string;
  date: Date;
  time: string;
  price: number;
  category: string;
  location: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do evento é obrigatório'],
      trim: true,
      minlength: [3, 'Nome deve ter pelo menos 3 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    description: {
      type: String,
      required: [true, 'Descrição é obrigatória'],
      trim: true,
      minlength: [10, 'Descrição deve ter pelo menos 10 caracteres'],
      maxlength: [1000, 'Descrição deve ter no máximo 1000 caracteres'],
    },
    date: {
      type: Date,
      required: [true, 'Data é obrigatória'],
    },
    time: {
      type: String,
      required: [true, 'Hora é obrigatória'],
      match: [
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido (HH:MM)',
      ],
    },
    price: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      min: [0, 'Preço não pode ser negativo'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Categoria é obrigatória'],
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Local é obrigatório'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Criador é obrigatório'],
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

eventSchema.index({ name: 'text', description: 'text' });
eventSchema.index({ date: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ createdBy: 1 });

const Event = model<IEvent>('Event', eventSchema);

export { Event };
