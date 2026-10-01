import { ProductDocType } from '@/lib/types';

/** Customer-facing names for product document types (shared by server + client). */
export const DOC_TYPE_LABEL: Record<ProductDocType, string> = {
  COA: 'Certificate of analysis',
  SDS: 'Safety data sheet',
  TDS: 'Technical data sheet',
  SPEC_SHEET: 'Specification sheet',
  CERTIFICATE: 'Certificate',
  OTHER: 'Document',
};

export const DOC_TYPES = Object.keys(DOC_TYPE_LABEL) as ProductDocType[];
