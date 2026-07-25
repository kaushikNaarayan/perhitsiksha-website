import { useTranslation } from 'react-i18next';
import { useDonationDrawer } from '../../context/DonationContext';

export interface MobileCTAProps {
  hidden?: boolean;
}

/**
 * Sticky bottom "Contribute now" bar for small screens only (`lg:hidden`).
 * Opens the donation drawer (WhatsApp remains available inside it). Pass
 * `hidden` to suppress it (e.g. while the mobile menu is open). Respects the
 * iOS home-indicator safe area.
 */
const MobileCTA = ({ hidden = false }: MobileCTAProps) => {
  const { t } = useTranslation('donation');
  const { open } = useDonationDrawer();

  if (hidden) return null;

  return (
    <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 px-4 pt-3 pb-[env(safe-area-inset-bottom)] bg-gradient-to-t from-white via-white/95 to-transparent dark:from-[#141314] dark:via-[#141314]/95">
      <button
        type="button"
        onClick={open}
        className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3.5 rounded-full shadow-lg transition-colors duration-200"
      >
        {t('trigger')}
      </button>
    </div>
  );
};

export default MobileCTA;
