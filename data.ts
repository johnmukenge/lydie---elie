export type EventItem = {
  title: string;
  time: string;
  description: string;
};

export type GalleryItem = {
  id: number;
  alt: string;
  src: string;
};

export type WeddingData = {
  couple: {
    bride: string;
    groom: string;
    displayName: string;
  };
  weddingDate: string;
  venue: {
    name: string;
    city: string;
    address: string;
  };
  heroImage: string;
  dressCode: string;
  schedule: EventItem[];
  gallery: GalleryItem[];
  audioUrl: string;
};

export const weddingData: WeddingData = {
  couple: {
    bride: 'Lydie',
    groom: 'Elie',
    displayName: 'Lydie & Elie',
  },
  weddingDate: '2026-07-19T16:00:00+02:00',
  venue: {
    name: 'Salle Événementiel - New Foncobel',
    city: 'Kinshasa, Democratic Republic of Congo',
    address: 'Avenue Kasavubu - Entre Bongolo et Force - Réf. Station Bongolo',
  },
  heroImage:
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2200&q=80',
  dressCode: 'Propre et chic - Tenue de ville élégante',
  schedule: [
    {
      title: 'Church Ceremony',
      time: '11:00',
      description: 'Paroisse New-Life, Av. Kola 201 - Arret Bambole, C/ Ngiri-Ngiri, Kinshasa.',
    },
    {
      title: 'Shooting & Media Moments',
      time: '15:00',
      description: 'Professional photos and videos around the city.',
    },
    {
      title: 'Reception Dinner',
      time: '18:00',
      description: 'New Foncobel, Avenue Kasavubu - Between Bongolo and Force - Réf. Station Bongolo',
    },
    {
      title: 'Cake Cutting & Celebration',
      time: '21:00',
      description: 'Cutting the cake and enjoying with the host',
    },
  ],
  gallery: [
    {
      id: 1,
      alt: 'Elie and Lydie portrait 1',
      src: '/media/elie1.jpeg',
    },
    {
      id: 2,
      alt: 'Lydie portrait',
      src: '/media/lydie1.jpeg',
    },
    {
      id: 3,
      alt: 'Elie portrait',
      src: '/media/elie2.jpeg',
    },
    {
      id: 4,
      alt: 'Lydie and Elie portrait 2',
      src: '/media/lydie.JPG',
    },
    {
      id: 5,
      alt: 'Wedding hall view 1',
      src: '/media/salle1.jpg',
    },
    {
      id: 6,
      alt: 'Wedding hall view 2',
      src: '/media/salle2.jpg',
    },
  ],
  audioUrl: '/media/etoile-du-matin.amr',
};
