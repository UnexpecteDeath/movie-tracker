export {
    getAvailableGiftRecipients,
    getGifts,
    getGiftsByType,
    getWishes,
} from "./api/supabase";
export type { GiftItem, GiftRecipient, GiftType } from "./api/types";
export { Gift } from "./ui/gift";
export { GiftDetailsModal } from "./ui/giftDetailsModal";
