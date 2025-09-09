import { Schema } from 'mongoose';

// Tax Document Schema
export const TaxDocumentSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['afip_certificate', 'monotributo_receipt', 'other'], 
    required: true 
  },
  fileKey: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  size: { type: Number, required: true },
  rejectionReason: { type: String },
}, { _id: false });

// Fiscal Info Schema
export const FiscalInfoSchema = new Schema({
  cuit: { type: String, required: false }, // Made optional to allow partial updates
  businessName: { type: String, required: false }, // Made optional to allow partial updates
  taxStatus: { 
    type: String, 
    enum: ['monotributista', 'responsable_inscripto', 'exento'], 
    required: false // Made optional to allow partial updates
  },
  taxCategory: { type: String }, // Only for monotributista
}, { _id: false });

// Banking Info Schema
export const BankingInfoSchema = new Schema({
  accountType: { 
    type: String, 
    enum: ['cbu', 'alias'], 
    required: false // Made optional to allow partial updates
  },
  cbu: { type: String, required: false }, // Made optional to allow partial updates
  bankName: { type: String, required: false }, // Made optional to allow partial updates
  accountHolder: { type: String, required: false }, // Made optional to allow partial updates
  alias: { type: String },
}, { _id: false });

// Main Billing Schema
export const BillingSchema = new Schema({
  status: { 
    type: String, 
    enum: ['pending', 'rejected', 'accepted'], 
    default: 'pending' 
  },
  fiscalInfo: { type: FiscalInfoSchema, required: false }, // Made optional to allow partial setups
  taxDocuments: { type: [TaxDocumentSchema], default: [] },
  bankingInfo: { type: BankingInfoSchema, required: false }, // Made optional to allow partial setups
  completedAt: { type: Date },
  lastUpdatedAt: { type: Date, default: Date.now },
}, { _id: false });