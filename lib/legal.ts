import { BUSINESS as B, SITE } from './data';

/**
 * Policy pages. Plain words, no legalese for its own sake. Every promise here is a real commitment:
 * change the text if the business does something different.
 */
export type Policy = { slug: string; title: string; description: string; intro: string; sections: { h: string; p: string[] }[] };

export const UPDATED = '24 October 2026';
const addr = `${B.street}, ${B.city}, ${B.district} district, ${B.state} ${B.pin}, India`;
const contact = `Call or WhatsApp ${B.phone}, or write to ${B.legalName}, ${addr}.`;
const who = `${SITE.url.replace('https://', '')} is run by ${B.legalName}, a partnership firm registered in India. ADRENL is its brand. Where these pages say "we" or "us", they mean ${B.legalName}.`;

export const LEGAL: Policy[] = [
  {
    slug: 'privacy',
    title: 'Privacy policy',
    description: 'What ADRENL (NINETY4 VENTURES) collects, why, who it is shared with, and your rights.',
    intro: 'We collect only what we need to make, send and support your order. We do not sell your data.',
    sections: [
      { h: 'Who we are', p: [who] },
      { h: 'What we collect', p: [
        'When you order: your name, phone number, email address, delivery address and what you bought.',
        'Payments are handled by Zoho Payments. You enter card, UPI or bank details on their secure page; we never see or store them.',
        'When you browse: this site keeps your bag and which hero film you last saw in your own browser. To see where the shop is hard to use, we also record anonymous usage on our own server: a random ID stored in your browser, the pages and buttons you use, the steps of checkout you reach, how fast pages load, and errors. It never includes your name, phone number, email or address, and it is not shared with anyone. We use no advertising or third-party tracking. Our hosting provider keeps standard server logs (such as IP address and browser type) for security.',
      ] },
      { h: 'How we use it', p: [
        'To take and deliver your order, send order and delivery updates, handle exchanges and refunds, answer your questions, prevent fraud, and keep the records Indian tax law requires.',
        'Anonymous usage records are used only to find and fix what makes the shop hard to use, and are deleted after 400 days.',
        'We send offers or launch news only if you ask for them, and you can stop them at any time.',
      ] },
      { h: 'Who we share it with', p: [
        'Only those who help us run the shop: Zoho Payments (payments), courier partners (delivery), and our hosting and IT providers. Each gets only what it needs for its job. We share information with authorities only when the law requires it.',
      ] },
      { h: 'How long we keep it', p: [
        'Order and invoice records are kept for as long as Indian tax law requires. Everything else is deleted once it is no longer needed.',
      ] },
      { h: 'Your rights', p: [
        'Under the Digital Personal Data Protection Act, 2023 you can ask to see, correct or delete your personal data, withdraw consent, and raise a grievance. Ask us using the contact details below; we acknowledge within 2 working days and resolve within 30 days.',
      ] },
      { h: 'Keeping it safe', p: ['The site is served only over HTTPS, and access to order data is limited to the people who fulfil orders.'] },
      { h: 'Children', p: ['The shop is meant for adults. If you are under 18, please order with a parent or guardian.'] },
      { h: 'Changes', p: ['If this policy changes, the new version is posted here with a new date.'] },
      { h: 'Contact and grievances', p: [contact] },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of service',
    description: 'The terms for using adrenl.com and buying from ADRENL (NINETY4 VENTURES).',
    intro: 'By using this site or placing an order, you agree to these terms.',
    sections: [
      { h: 'Who we are', p: [who] },
      { h: 'Products and pictures', p: [
        'Until photos of the finished tees are published, product pictures are design previews of the intended fit, colours and graphics. Colours can look slightly different on different screens.',
      ] },
      { h: 'Preorders', p: [
        'Batch 01 is made after the drop opens, not taken from existing stock. The expected dispatch date is shown before you pay. If it slips, we tell you and you can cancel for a full refund.',
      ] },
      { h: 'Prices and payment', p: [
        'Prices are in Indian rupees (INR) and include applicable taxes unless stated otherwise. Any shipping charge is shown before you pay. You pay the price shown when you place the order.',
        'Payments are processed by Zoho Payments, using the methods shown at checkout.',
      ] },
      { h: 'Orders', p: [
        'An order is confirmed once payment succeeds and you receive a confirmation. We may cancel an order, with a full refund, if an item is unavailable, a price was shown in error, or a payment looks fraudulent.',
      ] },
      { h: 'Shipping, exchanges and refunds', p: [
        'Delivery is covered by our shipping and delivery policy. Cancellations, exchanges and refunds are covered by our refunds and cancellation policy. Both are part of these terms.',
      ] },
      { h: 'Our designs', p: [
        `The ADRENL name and mark, the RIDGE, GARUD and MARCOS graphics, and the text, photos and video on this site belong to ${B.legalName} or are used with permission. Please do not copy or reuse them without written permission.`,
      ] },
      { h: 'Using the site', p: ['Please use the site lawfully and do not try to disrupt it or access what is not meant for you.'] },
      { h: 'Liability', p: [
        'As far as the law allows, our liability for any order is limited to the amount you paid for it. Nothing here limits your rights under the Consumer Protection Act, 2019.',
      ] },
      { h: 'Law and disputes', p: [`These terms are governed by the laws of India. Disputes fall under the courts at ${B.district}, ${B.state}.`] },
      { h: 'Contact', p: [contact] },
    ],
  },
  {
    slug: 'refunds',
    title: 'Refunds and cancellation',
    description: 'How to cancel an ADRENL order, exchange a size, report a problem and get a refund.',
    intro: 'Cancel before dispatch for a full refund. After delivery, one free size exchange, and anything faulty is on us.',
    sections: [
      { h: 'Cancelling an order', p: [
        'You can cancel any time before your order is dispatched and get a full refund. Once it has been dispatched it cannot be cancelled, but the exchange and damage rules below still apply.',
        'If we cancel your order (for example, if an item cannot be made or a price was wrong), you get a full refund.',
      ] },
      { h: 'Size exchange', p: [
        'One free size exchange per item within 7 days of delivery. The tee must be unworn and unwashed, with its tags and packaging. If the new size is not available, we refund you instead.',
      ] },
      { h: 'Damaged, faulty or wrong item', p: [
        'Tell us within 48 hours of delivery and send photos of the item and its packaging. We send a replacement at no cost, or a full refund if a replacement is not possible.',
      ] },
      { h: 'Change of mind', p: ['We do not take returns for change of mind. The free size exchange above covers fit.'] },
      { h: 'How refunds are paid', p: [
        'Refunds go back to the original payment method within 5 to 7 working days of approval. Your bank may take a few more days to show it. Shipping charges are refunded when the mistake is ours.',
      ] },
      { h: 'How to ask', p: [`Call or WhatsApp ${B.phone} with your order number. We reply within 2 working days.`] },
    ],
  },
  {
    slug: 'shipping',
    title: 'Shipping and delivery',
    description: 'Where ADRENL ships, when preorders dispatch, delivery times, charges and tracking.',
    intro: 'We ship across India through courier partners, with tracking on every order.',
    sections: [
      { h: 'Where we ship', p: ['Anywhere in India that our courier partners deliver to. We do not ship outside India yet.'] },
      { h: 'When preorders dispatch', p: [
        'Batch 01 is made after the drop opens. The expected dispatch date is shown before you pay and in your order confirmation, and we tell you if it changes.',
      ] },
      { h: 'Delivery time', p: ['Usually 3 to 7 working days after dispatch, depending on where you are. Remote areas can take longer.'] },
      { h: 'Charges', p: ['Any shipping charge is shown at checkout before you pay.'] },
      { h: 'Tracking', p: ['Once your order is dispatched, you get a tracking link by SMS, WhatsApp or email.'] },
      { h: 'Address and failed delivery', p: [
        'Please check your address and phone number. If a parcel comes back because the address was wrong or nobody was available after the courier\'s attempts, we can send it again; the second shipping charge is payable.',
      ] },
      { h: 'Contact', p: [contact] },
    ],
  },
];
