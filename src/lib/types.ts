export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

export type Prompt = {
  title: string;
  prompt: string;
};

export type MCP = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_slug: string | null;
  language: string | null;
  repo_url: string;
  website_url: string | null;
  stars: number;
  last_commit_at: string | null;
  is_maintained: boolean;
  prompts: Prompt[];
  tags: string[];
  install_command: string | null;
  verified: boolean;
  submitted_by: string;
  listed_at: string;
  updated_at: string;
};

export type MCPListItem = Pick<
  MCP,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "category_slug"
  | "language"
  | "stars"
  | "is_maintained"
  | "verified"
  | "install_command"
>;

export type GetMCPsParams = {
  query?: string;
  category?: string;
  page?: number;
  pageSize?: number;
};
