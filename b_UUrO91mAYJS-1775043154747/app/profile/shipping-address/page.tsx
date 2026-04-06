'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase, getSessionUser } from '@/lib/supabase';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ShippingAddressPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: '',
    street: '',
    locality: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // ... (useCurrentLocation logic remains same, but I'll make sure it clears errors)
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    setErrors({}); // Clear any previous manual errors
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
            { 
              headers: { 
                'Accept-Language': 'en',
                'User-Agent': 'FriendsOf4Boutique/1.0'
              } 
            }
          );
          const data = await res.json();
          if (data && data.address) {
            const a = data.address;
            setForm(prev => ({
              ...prev,
              street: a.road || a.pedestrian || a.footway || '',
              locality: [a.neighbourhood, a.suburb, a.hamlet, a.quarter].filter(Boolean).join(', ') || a.residential || '',
              address1: [a.house_number, a.road || a.pedestrian || a.footway].filter(Boolean).join(' ') || (data.display_name ? data.display_name.split(',')[0] : ''),
              address2: [a.neighbourhood, a.suburb, a.hamlet, a.quarter, a.residential].filter(Boolean).join(', ') || '',
              city: a.city || a.town || a.village || a.state_district || a.county || '',
              state: a.state || '',
              zip: a.postcode || '',
              country: a.country || 'India',
            }));
          } else if (data && data.display_name) {
            const parts = data.display_name.split(',').map((s: string) => s.trim());
            setForm(prev => ({
              ...prev,
              address1: parts[0] || '',
              address2: parts[1] || '',
              city: parts[2] || '',
              state: parts[parts.length - 3] || '',
              zip: parts[parts.length - 2] || '',
              country: parts[parts.length - 1] || 'India',
            }));
          } else {
            alert('Could not determine address. Please enter manually.');
          }
        } catch (err) {
          console.error('Reverse geocode failed:', err);
          alert('Could not determine address from your location. Please enter manually.');
        }
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        alert('Unable to retrieve your location. Please allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Custom Validation
    const newErrors: Record<string, string> = {};
    const required = [
      { key: 'fullName', label: 'Full Name' },
      { key: 'address1', label: 'House / Flat / Building No.' },
      { key: 'street', label: 'Street / Road' },
      { key: 'locality', label: 'Locality / Area' },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State' },
      { key: 'zip', label: 'ZIP / Postal Code' },
      { key: 'country', label: 'Country' },
      { key: 'phone', label: 'Phone Number' },
    ];

    required.forEach(field => {
      if (!form[field.key as keyof typeof form]?.trim()) {
        newErrors[field.key] = `${field.label} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      const firstErrorKey = Object.keys(newErrors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setSaving(true);

    const fullAddress = [
      form.address1,
      form.street,
      form.locality,
      form.address2,
      form.city,
      form.state,
      form.zip,
      form.country,
    ].filter(Boolean).join(', ');

    const { user } = await getSessionUser();
    if (user) {
      // Must upsert to users table first to prevent foreign key errors for Google OAuth users
      await supabase.from('users').upsert([{
        id: user.id,
        name: form.fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
        email: user.email,
        phone: form.phone || '',
      }], { onConflict: 'id' });

      const { error } = await supabase
        .from('profiles')
        .upsert([{
          id: user.id,
          name: form.fullName || user.user_metadata?.full_name || user.email?.split('@')[0],
          phone: form.phone || '',
          address: fullAddress,
          email: user.email,
        }], { onConflict: 'id' });
        
      if (error) {
        console.error('Failed to save address:', error);
        alert('Failed to save details: ' + error.message);
      }
    }

    setSaving(false);
    setSaved(true);

    setTimeout(() => {
      router.push('/checkout');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fdf9f2] flex flex-col">
      <Header />
      <main className="flex-1 pt-32 pb-24 px-6 md:px-12 max-w-2xl mx-auto w-full">

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#a3851a] mb-4">Delivery Details</p>
          <h1 className="font-headline text-4xl lg:text-5xl text-[#1c1c18]">Shipping Address</h1>
          <p className="font-body text-sm text-[#747878] mt-3">Confirm where you'd like your order delivered</p>
        </motion.div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-green-600 text-sm">check_circle</span>
            <p className="text-xs text-green-700 font-body">Address saved! Proceeding to Payment...</p>
          </motion.div>
        )}

        <motion.button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="w-full mb-8 flex items-center justify-center gap-3 py-4 border-2 border-dashed border-[#a3851a]/40 text-[#a3851a] font-body uppercase tracking-widest text-[10px] font-bold hover:bg-[#a3851a]/5 transition-all disabled:opacity-50"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className="material-symbols-outlined text-lg">{locating ? 'sync' : 'my_location'}</span>
          {locating ? 'Detecting Your Location...' : 'Use My Current Location'}
        </motion.button>

        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">Full Name</label>
            <input id="fullName" name="fullName" type="text" placeholder="Your full name" value={form.fullName} onChange={handleChange}
              className={`w-full bg-white border ${errors.fullName ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
            {errors.fullName && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
          </div>

          {/* Address Line 1 */}
          <div>
            <label htmlFor="address1" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">House / Flat / Building No.</label>
            <input id="address1" name="address1" type="text" placeholder="e.g. H.No 12-3-456, Flat 201" value={form.address1} onChange={handleChange}
              className={`w-full bg-white border ${errors.address1 ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
            {errors.address1 && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
          </div>

          {/* Street */}
          <div>
            <label htmlFor="street" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">Street / Road</label>
            <input id="street" name="street" type="text" placeholder="e.g. MG Road, Main Street" value={form.street} onChange={handleChange}
              className={`w-full bg-white border ${errors.street ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
            {errors.street && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
          </div>

          {/* Locality */}
          <div>
            <label htmlFor="locality" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">Locality / Area / Neighbourhood</label>
            <input id="locality" name="locality" type="text" placeholder="e.g. Banjara Hills, Jubilee Hills" value={form.locality} onChange={handleChange}
              className={`w-full bg-white border ${errors.locality ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
            {errors.locality && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
          </div>

          {/* Landmark (Address Line 2) */}
          <div>
            <label htmlFor="address2" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">Landmark (Optional)</label>
            <input id="address2" name="address2" type="text" placeholder="Near temple, opposite park, etc." value={form.address2} onChange={handleChange}
              className="w-full bg-white border border-[#1c1c18]/10 p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors" />
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">City</label>
              <input id="city" name="city" type="text" placeholder="City / Town" value={form.city} onChange={handleChange}
                className={`w-full bg-white border ${errors.city ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
              {errors.city && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">State / Province</label>
              <input id="state" name="state" type="text" placeholder="State" value={form.state} onChange={handleChange}
                className={`w-full bg-white border ${errors.state ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
              {errors.state && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
            </div>
          </div>

          {/* ZIP + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zip" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">ZIP / Postal Code</label>
              <input id="zip" name="zip" type="text" placeholder="123456" value={form.zip} onChange={handleChange}
                className={`w-full bg-white border ${errors.zip ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
              {errors.zip && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
            </div>
            <div>
              <label htmlFor="country" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">Country</label>
              <input id="country" name="country" type="text" placeholder="India" value={form.country} onChange={handleChange}
                className={`w-full bg-white border ${errors.country ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
              {errors.country && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-[10px] uppercase tracking-widest text-[#747878] mb-2 font-body font-bold">Phone Number</label>
            <input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange}
              className={`w-full bg-white border ${errors.phone ? 'border-red-500' : 'border-[#1c1c18]/10'} p-4 font-body text-sm outline-none focus:border-[#a3851a] transition-colors`} />
            {errors.phone && <p className="text-red-500 text-[10px] mt-1 font-body uppercase tracking-tighter">This field is required</p>}
          </div>

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={saving}
            className="w-full gold-satin text-white py-5 font-body uppercase tracking-[0.3em] text-[10px] font-bold shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="material-symbols-outlined text-sm">{saving ? 'sync' : 'shopping_cart_checkout'}</span>
            {saving ? 'Saving...' : 'Save Address & Proceed to Payment'}
          </motion.button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
