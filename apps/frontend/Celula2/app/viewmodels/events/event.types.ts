// viewmodels/events/event.types.ts

export interface WizardFormData {
  imageFile:        File | null;
  imagePreviewUrl:  string | null;
  name:             string;
  startDate:        string;
  startTime:        string;
  endDate:          string;
  endTime:          string;
  locationName:     string;
  locationAddress:  string;
  description:      string;
  pricingType:      'free' | 'paid';
  price:            string;
  currency:         string;
  capacity:         string;
  category:         string | number;
}

export type StepErrors = Partial<Record<keyof WizardFormData, string>>;