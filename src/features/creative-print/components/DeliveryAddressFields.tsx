import type { UseFormRegister, FieldErrors } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import type { OrderFormValues } from '../lib/orderConfig';

/**
 * Where the box goes.
 *
 * The postcode, state and country here are also what the quote is priced
 * against — shipping and tax are destination-dependent — so they are part
 * of the price fingerprint. One address, quoted and shipped to, so a church
 * cannot be quoted for one place and delivered to another.
 */
export function DeliveryAddressFields({
  register,
  errors,
}: {
  register: UseFormRegister<OrderFormValues>;
  errors: FieldErrors<OrderFormValues>;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Input
          label="Addressed to"
          placeholder="Grace Chapel — Church Office"
          error={errors.address?.name?.message}
          {...register('address.name')}
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          label="Street address"
          placeholder="2312 Whittier Blvd"
          error={errors.address?.line1?.message}
          {...register('address.line1')}
        />
      </div>
      <div className="sm:col-span-2">
        <Input
          label="Apartment, suite, etc. (optional)"
          error={errors.address?.line2?.message}
          {...register('address.line2')}
        />
      </div>
      <Input label="City" error={errors.address?.city?.message} {...register('address.city')} />
      <Input
        label="State or province"
        placeholder="CA"
        error={errors.address?.stateOrProvince?.message}
        {...register('address.stateOrProvince')}
      />
      <Input
        label="Postcode"
        placeholder="90023"
        error={errors.address?.postalCode?.message}
        {...register('address.postalCode')}
      />
      <Input
        label="Country"
        placeholder="US"
        maxLength={2}
        helpText="Two-letter code, e.g. US"
        error={errors.address?.country?.message}
        {...register('address.country')}
      />
      <Input
        label="Phone (optional)"
        helpText="Couriers ask for one when they cannot find the building."
        error={errors.address?.phone?.message}
        {...register('address.phone')}
      />
      <Input
        label="Email for delivery updates (optional)"
        type="email"
        error={errors.address?.email?.message}
        {...register('address.email')}
      />
    </div>
  );
}
