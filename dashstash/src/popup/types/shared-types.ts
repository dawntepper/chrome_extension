export interface Article {
    id: string;
    title: string;
    description?: string;
    url: string;
    tags: string[];
    created_at: string;
    updated_at: string;
    user_id: string;
    imageUrl?: string | undefined;
    site_name?: string | undefined;
    publisher?: string;
  }
  
  export interface ArticleFormData {
    title: string;
    description: string;
    url: string;
    tags: string[];
    imageUrl: string;
    site_name: string;
    publisher?: string;
    publisher_url?: string;
  }
  
  export interface Layout {
    id: string;
    name: string;
    user_id: string;
    type: 'tag_based' | 'manual';
    tags: string[];
    article_ids?: string[]; // For manual layouts
    is_default: boolean;
    notes: string | null;
    created_at: string;
  }
  
  export interface LayoutArticle {
      id: string;
      layout_id: string;
      article_id: string;
      created_at: string;
  }
  
  export interface Tag {
    tag: string;
    count: number;
  }
    