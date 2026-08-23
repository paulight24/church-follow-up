/**
 * Creative & Print API client.
 *
 * Follows the house convention: one object literal of methods returning the
 * raw `AxiosResponse`, with the shared client already unwrapping the
 * `{ success, data }` envelope. Callers do `.then(res => res.data)`.
 */
import type { AxiosResponse } from 'axios';
import api from '@/config/api';
import type { PaginatedResponse } from '@/types';
import type {
  BrandProfile,
  BrandProfileRequest,
  CreateFlyerRequest,
  FlyerDetail,
  FlyerStatus,
  FlyerSummary,
  Generation,
  PaperOption,
  PrintAdvice,
  PrintDocument,
  PrintMode,
  PrintOrder,
  PrintOrderDetail,
  PrintQuote,
  PrintSize,
  ProviderCapabilities,
  Urgency,
} from '@/types/creativePrint';

export const creativeApi = {
  getBrandProfile(): Promise<AxiosResponse<BrandProfile>> {
    return api.get('/creative/brand-profile');
  },
  updateBrandProfile(data: BrandProfileRequest): Promise<AxiosResponse<BrandProfile>> {
    return api.put('/creative/brand-profile', data);
  },

  getFlyers(filters?: {
    status?: FlyerStatus;
    eventId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AxiosResponse<PaginatedResponse<FlyerSummary>>> {
    return api.get('/creative/flyers', { params: filters });
  },
  getFlyer(id: string): Promise<AxiosResponse<FlyerDetail>> {
    return api.get(`/creative/flyers/${id}`);
  },
  createFlyer(data: CreateFlyerRequest): Promise<AxiosResponse<FlyerSummary>> {
    return api.post('/creative/flyers', data);
  },
  updateFlyer(
    id: string,
    data: Partial<CreateFlyerRequest>
  ): Promise<AxiosResponse<FlyerSummary>> {
    return api.patch(`/creative/flyers/${id}`, data);
  },
  archiveFlyer(id: string): Promise<AxiosResponse<null>> {
    return api.delete(`/creative/flyers/${id}`);
  },

  /** Returns 202 — poll `getGeneration` until it settles. */
  generate(
    id: string,
    data: { prompt?: string; conceptCount?: number }
  ): Promise<AxiosResponse<Generation>> {
    return api.post(`/creative/flyers/${id}/generate`, data);
  },
  revise(
    id: string,
    data: { instruction: string; fromVersionId?: string }
  ): Promise<AxiosResponse<Generation>> {
    return api.post(`/creative/flyers/${id}/revise`, data);
  },
  getGeneration(id: string): Promise<AxiosResponse<Generation>> {
    return api.get(`/creative/generations/${id}`);
  },

  /** A church's own finished design, as multipart — never base64 in JSON. */
  uploadDesign(flyerId: string, file: File): Promise<AxiosResponse<FlyerDetail>> {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/creative/flyers/${flyerId}/versions/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  selectVersion(flyerId: string, versionId: string): Promise<AxiosResponse<FlyerDetail>> {
    return api.post(`/creative/flyers/${flyerId}/versions/${versionId}/select`);
  },
  approve(
    flyerId: string,
    data: { flyerVersionId: string; checklist?: Record<string, boolean>; note?: string }
  ): Promise<AxiosResponse<FlyerDetail>> {
    return api.post(`/creative/flyers/${flyerId}/approve`, data);
  },
  unapprove(flyerId: string): Promise<AxiosResponse<FlyerDetail>> {
    return api.post(`/creative/flyers/${flyerId}/unapprove`);
  },
};

export const printApi = {
  getCapabilities(): Promise<AxiosResponse<ProviderCapabilities[]>> {
    return api.get('/print/providers/capabilities');
  },
  getPaperOptions(): Promise<AxiosResponse<PaperOption[]>> {
    return api.get('/print/paper-options');
  },
  getAdvice(params: { eventDate?: string; provider?: string }): Promise<AxiosResponse<PrintAdvice>> {
    return api.get('/print/advisor', { params });
  },

  createDocument(data: {
    flyerVersionId: string;
    /** Approved version of the back design, for double-sided printing. */
    backFlyerVersionId?: string;
    layout?: PrintSize;
    mode?: PrintMode;
    cutGuides?: boolean;
  }): Promise<AxiosResponse<PrintDocument>> {
    return api.post('/print/documents', data);
  },
  getDocument(id: string): Promise<AxiosResponse<PrintDocument>> {
    return api.get(`/print/documents/${id}`);
  },

  createQuote(data: {
    printDocumentId: string;
    quantity: number;
    paperPreset: string;
    sides: string;
    finish?: string;
    fulfillmentType: string;
    urgency: Urgency;
    destination?: { postalCode: string; stateOrProvince: string; country: string };
  }): Promise<AxiosResponse<PrintQuote>> {
    return api.post('/print/quotes', data);
  },

  createOrder(data: {
    quoteId: string;
    idempotencyKey: string;
    shippingAddress?: Record<string, string>;
  }): Promise<AxiosResponse<PrintOrder>> {
    return api.post('/print/orders', data);
  },
  getOrders(params?: {
    fulfillmentStatus?: string;
    page?: number;
    pageSize?: number;
  }): Promise<AxiosResponse<PaginatedResponse<PrintOrder>>> {
    return api.get('/print/orders', { params });
  },
  getOrder(id: string): Promise<AxiosResponse<PrintOrderDetail>> {
    return api.get(`/print/orders/${id}`);
  },
  cancelOrder(id: string): Promise<AxiosResponse<PrintOrder>> {
    return api.post(`/print/orders/${id}/cancel`);
  },
};

/**
 * The print-ready PDF is behind auth, so it cannot be a plain `<a href>` —
 * the browser would send no Authorization header. Fetch it as a blob and
 * hand it to the user from memory.
 */
export async function downloadPrintDocument(id: string, filename: string): Promise<void> {
  const response = await api.get(`/print/documents/${id}/download`, { responseType: 'blob' });
  const url = URL.createObjectURL(response.data as unknown as Blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    // Revoking immediately can cancel the download in some browsers; a
    // tick is enough for the click to have been handled.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
