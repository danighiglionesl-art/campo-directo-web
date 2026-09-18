export interface NavItem {
  label: string;
  href: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category?: string;
}

export interface ProductItem {
  id: string;
  name: string;
  category: string;
  description: string;
  presentation?: string;
  imageUrl?: string;
}

export interface DifferentialItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
}

export interface ContactFormData {
  fullName: string;
  company: string;
  locality: string;
  province: string;
  phone: string;
  email: string;
  message: string;
}
