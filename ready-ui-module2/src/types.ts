export interface Order {
  id: string;
  confirmationNumber: string;
  items: {
    productId: string;
    title: string;
    author: string;
    thumbnail: string;
  }[];
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  fullName: string;
  location: string;
}

export interface Note {
  text: string;
  contributor: string;
  imageUrl: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  thumbnail: string;
  about: string;
  notes: Note[];
  qty: number;
  isApproved ?: boolean;
  addedBy ?: string;
  userImageUrl ?: string;
  emailId? : string;
}
