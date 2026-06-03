# Lydie & Elie Wedding Invitation Landing Page

A modern, production-ready wedding invitation website built with Next.js 16, TypeScript, TailwindCSS, with advanced features including **multi-language support**, **RSVP system**, and **PDF invitation generation**.

## Features

### 🌍 Internationalization (i18n)
- **3 language support**: English, French, Italian
- Language switcher in top-right corner
- All UI text dynamically translated
- Easy to extend with more languages

### 👰 Wedding Details
- **Couple**: Lydie & Elie
- **Date**: July 19, 2026
- **Location**: Kinshasa, Democratic Republic of Congo
- **Venue**: Palais de la Nation
- Fully responsive design (mobile-first)

### 📋 RSVP System
- **Two-step confirmation flow**:
  1. Guest confirms attendance
  2. If yes → form appears with Name, Family Name, Email
- **Automatic PDF Generation**:
  - Fancy, styled PDF invitation
  - Guest name personalization
  - Automatic download on form submission
- Form validation and error handling

### ⏱️ Interactive Features
- **Countdown Timer**: Live countdown to wedding date
- **Hero Section**: Full-screen parallax background image
- **Gallery**: 6-image grid with hover effects
- **Background Audio**: Autoplay with user gesture fallback
- **Smooth Animations**: Fade-in and stagger effects on scroll

## Tech Stack

### Core Framework
- **Next.js 16.2.6** - App Router with Server & Client Components
- **React 19** - UI framework
- **TypeScript 5.8** - Type safety

### Styling & UI
- **TailwindCSS 3.4** - Utility-first CSS
- **Custom Animations** - Fade-in, parallax effects
- **Responsive Design** - Mobile-first approach

### PDF Generation
- **jsPDF 2.5.1** - PDF creation library
- **html2canvas 1.4.1** - HTML-to-image conversion

### Fonts
- **Playfair Display** - Serif font for headings (elegant)
- **Inter** - Sans-serif font for body text (clean)

## Project Structure

```
/
├── app/
│   ├── layout.tsx          # Root layout with LanguageProvider
│   ├── page.tsx            # Main landing page
│   ├── globals.css         # Tailwind + custom styles
│   └── layout.tsx
├── components/
│   ├── Hero.tsx            # Full-screen hero section with parallax
│   ├── Countdown.tsx       # Live countdown timer
│   ├── Gallery.tsx         # Image gallery grid
│   ├── AudioPlayer.tsx     # Background music with autoplay fallback
│   ├── RsvpSection.tsx     # RSVP section
│   ├── RsvpModal.tsx       # RSVP modal with confirmation & form
│   └── LanguageSwitcher.tsx # Language selection buttons
├── context/
│   └── LanguageContext.tsx  # i18n state management
├── hooks/
│   └── useCountdown.ts     # Countdown timer hook
├── i18n/
│   └── translations.ts     # All translated strings
├── utils/
│   └── pdfGenerator.ts     # PDF invitation generator
├── data.ts                 # Mock wedding data & types
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript config
├── next.config.ts          # Next.js config with image optimization
└── package.json            # Dependencies & scripts
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

## Usage

### Language Switching
- Click any of the 3 language buttons (top-right):
  - **English** (en)
  - **Français** (fr)
  - **Italiano** (it)
- All text updates dynamically

### RSVP Flow
1. Scroll to RSVP section or click "Open RSVP"
2. Confirm your attendance ("Yes" or "No")
3. If "Yes":
   - Fill in your First Name, Last Name, Email
   - Click "Generate My Invitation"
   - PDF downloads automatically
4. Modal closes automatically after successful submission

### Adding More Languages
1. Open `i18n/translations.ts`
2. Add new language code (e.g., `'es'` for Spanish)
3. Add translations object
4. Update `LanguageSwitcher.tsx` with new language button
5. Update `Language` type to include new code

## Customization

### Change Wedding Details
Edit `data.ts`:
```typescript
export const weddingData: WeddingData = {
  couple: {
    bride: 'Lydie',
    groom: 'Elie',
    displayName: 'Lydie & Elie',
  },
  weddingDate: '2026-07-19T16:00:00+02:00',
  venue: {
    name: 'Venue Name',
    city: 'City, Country',
    address: 'Street Address',
  },
  // ... more details
};
```

### Modify Colors
Edit `tailwind.config.ts` to change the rose/champagne color palette:
```typescript
colors: {
  rose: { /* your colors */ },
  champagne: { /* your colors */ },
}
```

### Update Hero Image
Change `heroImage` URL in `data.ts` to any Unsplash URL or your own image.

### Change Background Audio
Update `audioUrl` in `data.ts` to any MP3 URL.

### Customize PDF Invitation Template
Edit `utils/pdfGenerator.ts` in the `generatePdfInvitation` function - modify the HTML template styling and content.

## API & Hooks

### useCountdown Hook
```typescript
const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
```
- **targetDate**: ISO 8601 date string
- Returns: countdown values or `isExpired` flag

### useLanguage Hook
```typescript
const { language, setLanguage, t } = useLanguage();
```
- **language**: current language code (`'en' | 'fr' | 'it'`)
- **setLanguage**: function to change language
- **t**: translation function - `t('key')` returns translated string

### generatePdfInvitation Function
```typescript
await generatePdfInvitation({
  firstName: string;
  lastName: string;
  email: string;
});
```
- Generates and downloads a personalized PDF invitation
- Uses html2canvas + jsPDF internally

## SEO & Metadata

The page includes:
- Meta title & description
- Open Graph tags for social sharing
- Twitter card meta tags
- Responsive viewport settings

## Performance

- **Static generation** for fast page loads
- **Image optimization** via Next.js Image component
- **Code splitting** per route
- **CSS-in-JS** compilation at build time
- **No external API calls** (fully static)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Future Enhancements

- [ ] Backend integration for guest list storage
- [ ] Email confirmation on RSVP
- [ ] Guest seating arrangements
- [ ] Wedding registry link
- [ ] Accommodation suggestions
- [ ] Travel directions/maps
- [ ] Guest book/comments
- [ ] Photo upload after wedding

## License

Private - Created for Lydie & Elie's Wedding

## Author

Built with ❤️ as a romantic, modern wedding invitation experience.
# lydie---elie

testing
