---
name: siza-form-builder
description: Build complex forms with validation, multi-step flows, accessibility, and 8 preset patterns
version: 1.0.0
author: Forge Space
tags: [forms, validation, zod, yup, accessibility, react-hook-form, formik, multi-step]
---

# Siza Form Builder

## Overview
Build production-ready forms with proper validation, error handling, accessibility, and user experience patterns. Supports 8 common form presets and framework-specific form libraries.

## Instructions

### Form Preset Types

#### 1. Login Form
- Fields: email/username, password
- Features: remember me checkbox, forgot password link, social login buttons
- Validation: email format, password min length
- Security: autocomplete attributes, password visibility toggle
- Example structure:
  ```typescript
  interface LoginFormData {
    email: string;
    password: string;
    rememberMe?: boolean;
  }

  const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    rememberMe: z.boolean().optional(),
  });
  ```

#### 2. Signup/Registration Form
- Fields: name, email, password, password confirmation, terms acceptance
- Features: password strength meter, email verification notice
- Validation: password match, strong password requirements, terms required
- Security: password requirements display, breach check integration option
- Example password strength:
  ```typescript
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };
  ```

#### 3. Contact Form
- Fields: name, email, subject, message
- Features: file attachments, urgency level, department routing
- Validation: required fields, email format, message length limits
- UX: character count for message, attachment size limits
- Example:
  ```typescript
  interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    department?: 'sales' | 'support' | 'general';
    attachments?: File[];
  }

  const contactSchema = z.object({
    name: z.string().min(2, 'Name required'),
    email: z.string().email('Invalid email'),
    subject: z.string().min(5, 'Subject required'),
    message: z.string().min(20, 'Message must be at least 20 characters').max(1000),
    department: z.enum(['sales', 'support', 'general']).optional(),
    attachments: z.array(z.instanceof(File)).max(5, 'Maximum 5 files').optional(),
  });
  ```

#### 4. Checkout/Payment Form
- Fields: billing address, shipping address, payment method, card details
- Features: address autocomplete, same as billing checkbox, saved payment methods
- Validation: card number (Luhn algorithm), CVV, expiry date, postal code
- Security: no storing card details, PCI compliance considerations, 3D Secure integration
- Example:
  ```typescript
  interface CheckoutFormData {
    billingAddress: Address;
    shippingAddress: Address;
    sameAsBilling: boolean;
    paymentMethod: 'card' | 'paypal' | 'apple_pay';
    cardNumber?: string;
    cardExpiry?: string;
    cardCvv?: string;
  }

  const cardSchema = z.object({
    cardNumber: z.string().refine(validateLuhn, 'Invalid card number'),
    cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, 'Format: MM/YY'),
    cardCvv: z.string().regex(/^[0-9]{3,4}$/, 'Invalid CVV'),
  });
  ```

#### 5. Settings/Preferences Form
- Fields: notification preferences, display settings, privacy options, profile info
- Features: section grouping, toggle switches, instant save vs save button
- Validation: conditional fields based on toggles
- UX: unsaved changes warning, success toast on save
- Example:
  ```typescript
  interface SettingsFormData {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
      marketing: boolean;
    };
    display: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      timezone: string;
    };
    privacy: {
      profileVisibility: 'public' | 'private' | 'friends';
      showEmail: boolean;
    };
  }
  ```

#### 6. Search/Filter Form
- Fields: search query, category filters, price range, date range, sort options
- Features: tag-based filters, clear all filters, filter count badges
- Validation: min/max price validation, date range validation
- UX: instant search with debounce, URL sync for shareable filters
- Example:
  ```typescript
  interface SearchFormData {
    query: string;
    categories: string[];
    priceRange: { min: number; max: number };
    dateRange?: { start: Date; end: Date };
    sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'date';
  }

  const searchSchema = z.object({
    query: z.string().min(2, 'Search query too short').optional(),
    priceRange: z.object({
      min: z.number().min(0),
      max: z.number(),
    }).refine(data => data.max >= data.min, 'Max must be greater than min'),
  });
  ```

#### 7. Feedback/Survey Form
- Fields: rating scale, multiple choice, text responses, NPS score
- Features: progress indicator, skip option, conditional questions
- Validation: required questions, rating bounds
- UX: question numbering, auto-advance on selection, save draft
- Example:
  ```typescript
  interface FeedbackFormData {
    npsScore: number; // 0-10
    satisfaction: 1 | 2 | 3 | 4 | 5;
    features: string[]; // Multi-select
    improvements: string;
    wouldRecommend: boolean;
  }

  const feedbackSchema = z.object({
    npsScore: z.number().min(0).max(10),
    satisfaction: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    improvements: z.string().max(500, 'Maximum 500 characters'),
  });
  ```

#### 8. Newsletter Signup Form
- Fields: email, name (optional), preferences/interests
- Features: double opt-in notice, frequency selection, topic preferences
- Validation: email format, duplicate check
- UX: minimal fields (reduce friction), inline validation, success message
- Example:
  ```typescript
  interface NewsletterFormData {
    email: string;
    name?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    interests: string[];
  }

  const newsletterSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(2).optional(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).default('weekly'),
    interests: z.array(z.string()).min(1, 'Select at least one interest'),
  });
  ```

### Validation Patterns

#### Zod Validation
```typescript
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+').max(120),
  website: z.string().url().optional().or(z.literal('')),
  password: z.string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Requires uppercase')
    .regex(/[a-z]/, 'Requires lowercase')
    .regex(/[0-9]/, 'Requires number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;
```

#### Yup Validation
```typescript
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email required'),
  age: yup.number().min(18, 'Must be 18+').max(120).required(),
  website: yup.string().url('Invalid URL').notRequired(),
  password: yup.string()
    .min(8, 'Minimum 8 characters')
    .matches(/[A-Z]/, 'Requires uppercase')
    .matches(/[a-z]/, 'Requires lowercase')
    .matches(/[0-9]/, 'Requires number')
    .required(),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required(),
});
```

#### Native HTML Validation
```typescript
<input
  type="email"
  required
  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
  minLength={2}
  maxLength={100}
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
```

### Multi-Step Form Architecture

```typescript
interface StepConfig<T> {
  title: string;
  fields: (keyof T)[];
  validate?: (data: Partial<T>) => Promise<boolean>;
}

const useMultiStepForm = <T>(steps: StepConfig<T>[], initialData: Partial<T>) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<T>>(initialData);

  const nextStep = async () => {
    const step = steps[currentStep];
    if (step.validate) {
      const isValid = await step.validate(formData);
      if (!isValid) return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const updateFormData = (data: Partial<T>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return {
    currentStep,
    formData,
    nextStep,
    previousStep,
    updateFormData,
    isFirstStep,
    isLastStep,
    progress,
  };
};
```

### Error Display Patterns

#### Inline Errors
```typescript
<div className="form-field">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : undefined}
  />
  {errors.email && (
    <span id="email-error" className="error-message" role="alert">
      {errors.email.message}
    </span>
  )}
</div>
```

#### Toast Notifications
```typescript
const onSubmit = async (data: FormData) => {
  try {
    await submitForm(data);
    toast.success('Form submitted successfully');
  } catch (error) {
    toast.error('Failed to submit form. Please try again.');
  }
};
```

#### Summary at Top
```typescript
{errors.length > 0 && (
  <div role="alert" className="error-summary">
    <h3>Please fix the following errors:</h3>
    <ul>
      {Object.entries(errors).map(([field, error]) => (
        <li key={field}>
          <a href={`#${field}`}>{error.message}</a>
        </li>
      ))}
    </ul>
  </div>
)}
```

### Accessibility for Forms

1. **Labels**
   - Every input must have associated label
   - Use `<label for="id">` or wrap input in label
   - For icon-only inputs, use `aria-label`

2. **Descriptions**
   - Use `aria-describedby` for help text
   - Link multiple descriptions with space-separated IDs

3. **Error Association**
   - Use `aria-invalid="true"` on invalid fields
   - Link error message with `aria-describedby`
   - Add `role="alert"` to error messages for screen reader announcement

4. **Required Fields**
   - Use `required` attribute
   - Indicate required fields visually (asterisk) and in label text
   - Add `aria-required="true"` for consistency

5. **Fieldsets**
   - Group related inputs with `<fieldset>`
   - Use `<legend>` for group label
   - Radio buttons and checkboxes must be in fieldset

6. **Focus Management**
   - Focus first error field on submit
   - Don't trap focus unless in modal
   - Provide clear focus indicators

### Framework-Specific Form Libraries

#### React Hook Form
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: { email: '' },
});

const onSubmit = (data: FormData) => {
  console.log(data);
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('email')} aria-invalid={!!errors.email} />
    {errors.email && <span role="alert">{errors.email.message}</span>}
  </form>
);
```

#### Formik
```typescript
import { Formik, Form, Field, ErrorMessage } from 'formik';

<Formik
  initialValues={{ email: '' }}
  validationSchema={schema}
  onSubmit={onSubmit}
>
  {({ isSubmitting }) => (
    <Form>
      <Field name="email" type="email" aria-describedby="email-error" />
      <ErrorMessage name="email" component="span" id="email-error" role="alert" />
      <button type="submit" disabled={isSubmitting}>Submit</button>
    </Form>
  )}
</Formik>
```

#### Vue VeeValidate
```vue
<script setup lang="ts">
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';

const { handleSubmit, errors } = useForm({
  validationSchema: toTypedSchema(schema),
});

const onSubmit = handleSubmit((values) => {
  console.log(values);
});
</script>

<template>
  <form @submit="onSubmit">
    <Field name="email" type="email" :aria-invalid="!!errors.email" />
    <ErrorMessage name="email" as="span" role="alert" />
  </form>
</template>
```

#### Angular Reactive Forms
```typescript
import { FormBuilder, Validators } from '@angular/forms';

const form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(8)]],
});

onSubmit() {
  if (this.form.valid) {
    console.log(this.form.value);
  }
}
```

## Examples

### Example 1: Login Form with React Hook Form + Zod

**Prompt:** "Create a login form with email, password, remember me, and forgot password link"

**Expected Output:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
          {...register('email')}
        />
        {errors.email && (
          <span id="email-error" className="error-message" role="alert">
            {errors.email.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? 'password-error' : undefined}
          {...register('password')}
        />
        {errors.password && (
          <span id="password-error" className="error-message" role="alert">
            {errors.password.message}
          </span>
        )}
      </div>

      <div className="form-field">
        <label>
          <input type="checkbox" {...register('rememberMe')} />
          Remember me
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>

      <a href="/forgot-password">Forgot password?</a>
    </form>
  );
};
```

### Example 2: Multi-Step Checkout Form

**Prompt:** "Create a 3-step checkout form: shipping address, payment method, review/confirm"

**Expected Output:** Multi-step form with progress indicator, step validation, back/next buttons, and data persistence across steps.

### Example 3: Search Filter Form with URL Sync

**Prompt:** "Create a search form with category filters and price range that syncs with URL params"

**Expected Output:** Form with debounced search, multi-select categories, price range slider, and useSearchParams for URL sync.

## Quality Rules

1. **All inputs must have labels** - No placeholder-only inputs
2. **Validate on blur and submit** - Not on every keystroke (UX friction)
3. **Show inline errors** - Associate with `aria-describedby`
4. **Disable submit during submission** - Prevent double-submit
5. **Focus first error on submit** - Improve accessibility and UX
6. **Preserve data on validation failure** - Never clear the form
7. **Provide clear error messages** - "Invalid email" not "Error"
8. **Use autocomplete attributes** - Help password managers and autofill
9. **Mark required fields clearly** - Visual indicator + aria-required
10. **Test keyboard navigation** - Tab through entire form, submit with Enter
