import { Schema, model, Document } from 'mongoose';

export interface ILocation extends Document {
  _id: string;
  name: string;
  address?: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Nome do local é obrigatório'],
      trim: true,
      minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Endereço deve ter no máximo 200 caracteres'],
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude é obrigatória'],
      min: [-90, 'Latitude deve estar entre -90 e 90'],
      max: [90, 'Latitude deve estar entre -90 e 90'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude é obrigatória'],
      min: [-180, 'Longitude deve estar entre -180 e 180'],
      max: [180, 'Longitude deve estar entre -180 e 180'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'Cidade deve ter no máximo 50 caracteres'],
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'Estado deve ter no máximo 50 caracteres'],
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'País deve ter no máximo 50 caracteres'],
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [20, 'CEP deve ter no máximo 20 caracteres'],
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

locationSchema.index({ latitude: 1, longitude: 1 });
locationSchema.index({ name: 'text', address: 'text' });

const Location = model<ILocation>('Location', locationSchema);

export { Location };



